import { generateStructuredJSON, startChat, trimHistory } from "../utils/geminiClient.js";
import { ApiError } from "../utils/ApiError.js";
import { NexusConversation } from "../models/nexusConversation.model.js";
import { NexusActionLog } from "../models/nexusActionLog.model.js";
import { createNote, searchNotesForContext, getRecentNotesForContext } from "./note.service.js";
import { createTask } from "./task.service.js";
import { getMentors } from "./mentoring.service.js";
import { emitEvent, EventTypes } from "../utils/eventBus.js";
import { paginate } from "../utils/paginate.js";
import mongoose from "mongoose";

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────

const SUPPORTED_INTENTS = [
    "create_note",
    "explain_notes",
    "create_task",
    "suggest_mentors",
    "study_explain",
    "general_chat",
];

// Per-user in-memory rate limiter (20 req/hour)
// In production: replace with Redis
const rateLimitMap = new Map(); // userId → { count, resetAt }
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// ─────────────────────────────────────────────
//  SYSTEM PROMPT (Intent Detector)
// ─────────────────────────────────────────────

const INTENT_SYSTEM_PROMPT = `You are Nexus, an intelligent AI assistant embedded in CampusConnect — a university productivity and academic platform.

Your job is to analyse the user's message and return a structured JSON response.

SUPPORTED INTENTS:
- "create_note": User wants to save information as a note. Extract title and content.
- "explain_notes": User wants you to explain or summarize their saved notes on a topic.
- "create_task": User wants to create a reminder or task. Extract title, dueDate (ISO 8601), priority (low/medium/high/urgent), and description.
- "suggest_mentors": User wants to find a mentor. Extract a search query / expertise keywords.
- "study_explain": User wants a concept explained academically (not from their notes).
- "general_chat": All other conversations, questions, help requests.

RESPONSE FORMAT (strict JSON, no markdown, no code fences):
{
  "intent": "<one of the SUPPORTED INTENTS>",
  "confidence": <0.0–1.0>,
  "reply": "<conversational response to show the user>",
  "data": {
    // intent-specific structured data — see below
  }
}

DATA FIELDS BY INTENT:
- create_note: { "title": string, "content": string, "tags": string[] }
- explain_notes: { "topic": string }
- create_task: { "title": string, "description": string, "dueDate": "ISO8601 or null", "priority": "low|medium|high|urgent" }
- suggest_mentors: { "query": string, "expertise": string[] }
- study_explain: { "topic": string }
- general_chat: {}

RULES:
- Always return valid JSON. Never wrap in markdown.
- "reply" must always be a warm, helpful, human-readable string that you show the user.
- For create_note and create_task: extract the actual content from the user's message — do not include generic placeholders.
- For dueDate: parse natural language dates relative to today's date provided in the context. Use ISO 8601 format (e.g. "2026-04-26T17:00:00.000Z"). Return null if no date is mentioned.
- Keep confidence honest — use < 0.7 only if genuinely ambiguous.`;

// ─────────────────────────────────────────────
//  SYSTEM PROMPT (Chat)
// ─────────────────────────────────────────────

const buildChatSystemPrompt = (user) => `You are Nexus, an intelligent AI assistant for CampusConnect — a university productivity platform.

You are talking to ${user.profile?.displayName || "a student"} who studies ${user.academic?.department || "at university"}.

Your personality:
- Warm, smart, and encouraging
- Campus-aware: you know about events, mentors, notes, and study groups
- Precise and actionable — you don't waffle

When you create notes or tasks for the user, confirm what you did in your reply so they feel confident.
Today's date and time: ${new Date().toISOString()}`;

// ─────────────────────────────────────────────
//  RATE LIMITER
// ─────────────────────────────────────────────

const checkRateLimit = (userId) => {
    const key = userId.toString();
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return;
    }

    if (entry.count >= RATE_LIMIT) {
        const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
        throw new ApiError(429, `Nexus rate limit reached. Try again in ${minutesLeft} minute(s).`);
    }

    entry.count += 1;
};

// ─────────────────────────────────────────────
//  CONVERSATION HELPERS
// ─────────────────────────────────────────────

/**
 * Load or create a conversation document.
 */
const resolveConversation = async (conversationId, requestUser) => {
    if (conversationId) {
        if (!mongoose.isValidObjectId(conversationId)) {
            throw new ApiError(400, "Invalid conversation ID");
        }
        const conv = await NexusConversation.findOne({
            _id: conversationId,
            userId: requestUser._id,
        });
        if (!conv) throw new ApiError(404, "Conversation not found");
        return conv;
    }

    // Create a new conversation
    return await NexusConversation.create({
        userId: requestUser._id,
        campusId: requestUser.campusId,
        title: "New Conversation",
    });
};

/**
 * Build Gemini-format history from stored messages.
 * Trims to fit within token budget.
 */
const buildGeminiHistory = (messages) => {
    const trimmed = trimHistory(messages, 5000);
    return trimmed.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
    }));
};

/**
 * Auto-generate a conversation title from the first user message.
 */
const generateTitle = (message) => {
    const cleaned = message.replace(/[^\w\s,.?!-]/g, "").trim();
    return cleaned.length > 60 ? cleaned.slice(0, 57) + "..." : cleaned || "New Conversation";
};

// ─────────────────────────────────────────────
//  ACTION HANDLERS
// ─────────────────────────────────────────────

const handleCreateNote = async (data, reply, requestUser) => {
    const { title, content, tags } = data;

    if (!title?.trim() || !content?.trim()) {
        return { success: false, reason: "Insufficient data to create note (title or content missing)" };
    }

    const note = await createNote(
        { title: title.trim(), content: content.trim(), tags: tags || [], source: "ai", type: "academic" },
        requestUser
    );

    emitEvent(EventTypes.NEXUS_NOTE_CREATED, {
        actorId: requestUser._id,
        targetId: requestUser._id,
        payload: { noteId: note._id, title: note.title },
    });

    return {
        success: true,
        targetModel: "Note",
        targetId: note._id,
        summary: { id: note._id, title: note.title, type: note.type },
    };
};

const handleCreateTask = async (data, reply, requestUser) => {
    const { title, description, dueDate, priority } = data;

    if (!title?.trim()) {
        return { success: false, reason: "Insufficient data to create task (title missing)" };
    }

    const task = await createTask(
        {
            title: title.trim(),
            description: description?.trim() || "",
            dueDate: dueDate || null,
            priority: priority || "medium",
            source: "ai",
        },
        requestUser
    );

    return {
        success: true,
        targetModel: "Task",
        targetId: task._id,
        summary: { id: task._id, title: task.title, dueDate: task.dueDate, priority: task.priority },
    };
};

const handleExplainNotes = async (data, requestUser, chatSession) => {
    const { topic } = data;
    const notes = await searchNotesForContext(topic || "", requestUser, 5);

    if (notes.length === 0) {
        const fallback = await getRecentNotesForContext(requestUser, 3);
        if (fallback.length === 0) {
            return {
                reply: "I couldn't find any notes to explain. Start by adding some notes and I'll be able to help you review them!",
                actionTaken: null,
            };
        }

        const noteText = fallback
            .map((n) => `**${n.title}**\n${n.content}`)
            .join("\n\n---\n\n");
        const result = await chatSession.sendMessage(
            `The user wants to understand their notes. Here are their most recent notes:\n\n${noteText}\n\nProvide a clear, structured explanation.`
        );
        return { reply: result.response.text(), actionTaken: null };
    }

    const noteText = notes
        .map((n) => `**${n.title}** (${n.courseId || n.type})\n${n.content}`)
        .join("\n\n---\n\n");

    const result = await chatSession.sendMessage(
        `The user wants to understand their notes about "${topic}". Here are the relevant notes:\n\n${noteText}\n\nExplain these notes clearly and helpfully.`
    );

    return { reply: result.response.text(), actionTaken: null };
};

const handleSuggestMentors = async (data, requestUser) => {
    const { query, expertise } = data;

    const queryParams = {
        page: 1,
        limit: 5,
        campusId: requestUser.campusId?.toString(),
    };

    if (query?.trim()) queryParams.q = query.trim();
    if (Array.isArray(expertise) && expertise.length > 0) {
        queryParams.expertise = expertise[0]; // Use first as primary filter
    }

    const result = await getMentors(queryParams);
    const mentors = result.docs || [];

    return {
        mentors,
        count: mentors.length,
        actionTaken: null,
    };
};

const handleStudyExplain = async (data, chatSession) => {
    const { topic } = data;
    const result = await chatSession.sendMessage(
        `Please explain the following academic topic clearly and concisely for a university student: "${topic}"`
    );
    return { reply: result.response.text(), actionTaken: null };
};

// ─────────────────────────────────────────────
//  MAIN MESSAGE PROCESSOR
// ─────────────────────────────────────────────

/**
 * Process a user message through Nexus intent engine.
 * @param {string} message - Raw user input.
 * @param {object} requestUser - Authenticated user.
 * @param {string|null} conversationId - Existing conversation ID or null for new.
 * @returns {Promise<object>} - { reply, intent, actionTaken, conversationId, messageId }
 */
export const processMessage = async (message, requestUser, conversationId = null) => {
    if (!message?.trim()) throw new ApiError(400, "Message cannot be empty");
    if (message.length > 8000) throw new ApiError(400, "Message is too long (max 8000 characters)");

    // Rate limit check
    checkRateLimit(requestUser._id);

    // Load or create conversation
    const conversation = await resolveConversation(conversationId, requestUser);

    // Auto-set title from first message
    if (conversation.messages.length === 0) {
        conversation.title = generateTitle(message);
    }

    // Build Gemini history from stored messages
    const geminiHistory = buildGeminiHistory(conversation.messages);

    // Step 1: Intent detection via structured JSON
    let parsed;
    const intentContext = `User message: "${message}"\nToday: ${new Date().toISOString()}\nUser department: ${requestUser.academic?.department || "unknown"}`;

    try {
        parsed = await generateStructuredJSON(intentContext, INTENT_SYSTEM_PROMPT);
    } catch (err) {
        console.error("[NexusService] Intent parsing failed:", err.message);
        // Fall back to general chat if intent detection fails
        parsed = { intent: "general_chat", confidence: 0.5, reply: "", data: {} };
    }

    const { intent, confidence, data: intentData, reply: intentReply } = parsed;

    // Validate intent is one we support
    const resolvedIntent = SUPPORTED_INTENTS.includes(intent) ? intent : "general_chat";

    // Step 2: Open a chat session for conversational replies
    const chatSession = startChat(geminiHistory, buildChatSystemPrompt(requestUser));

    let finalReply = intentReply || "";
    let actionResult = null;
    let targetModel = null;
    let targetId = null;

    // Step 3: Execute action based on intent
    try {
        if (resolvedIntent === "create_note") {
            const result = await handleCreateNote(intentData, intentReply, requestUser);
            if (result.success) {
                actionResult = result.summary;
                targetModel = result.targetModel;
                targetId = result.targetId;
                if (!finalReply) {
                    finalReply = `✅ I've saved a note titled **"${result.summary.title}"** for you! You can find it in your Notes section.`;
                }
            } else {
                // Fall through to general chat
                const r = await chatSession.sendMessage(message);
                finalReply = r.response.text();
            }
        } else if (resolvedIntent === "create_task") {
            const result = await handleCreateTask(intentData, intentReply, requestUser);
            if (result.success) {
                actionResult = result.summary;
                targetModel = result.targetModel;
                targetId = result.targetId;
                const due = result.summary.dueDate
                    ? ` due **${new Date(result.summary.dueDate).toLocaleDateString("en-US", { dateStyle: "medium" })}**`
                    : "";
                if (!finalReply) {
                    finalReply = `✅ Task **"${result.summary.title}"**${due} has been created! Check your Tasks page to manage it.`;
                }
            } else {
                const r = await chatSession.sendMessage(message);
                finalReply = r.response.text();
            }
        } else if (resolvedIntent === "explain_notes") {
            const result = await handleExplainNotes(intentData, requestUser, chatSession);
            finalReply = result.reply;
            actionResult = result.actionTaken;
        } else if (resolvedIntent === "suggest_mentors") {
            const result = await handleSuggestMentors(intentData, requestUser);
            actionResult = { mentors: result.mentors, count: result.count };
            if (result.count === 0) {
                finalReply = intentReply || "I couldn't find any mentors matching your criteria right now. Try broadening your search!";
            } else {
                finalReply = intentReply || `I found **${result.count} mentor${result.count > 1 ? "s" : ""}** that might be a great fit for you! Take a look below.`;
            }
        } else if (resolvedIntent === "study_explain") {
            const result = await handleStudyExplain(intentData, chatSession);
            finalReply = result.reply;
        } else {
            // general_chat — pass directly to Gemini chat
            const r = await chatSession.sendMessage(message);
            finalReply = r.response.text();
        }
    } catch (err) {
        console.error(`[NexusService] Action handler error for intent "${resolvedIntent}":`, err.message);
        // Graceful fallback — still respond conversationally
        try {
            const r = await chatSession.sendMessage(message);
            finalReply = r.response.text();
        } catch {
            finalReply = "I'm having a moment — please try again shortly!";
        }
    }

    // Step 4: Persist messages to conversation
    const userMsg = {
        role: "user",
        content: message,
        timestamp: new Date(),
    };
    const modelMsg = {
        role: "model",
        content: finalReply,
        intent: resolvedIntent !== "general_chat" ? resolvedIntent : null,
        actionTaken: actionResult || null,
        timestamp: new Date(),
    };

    conversation.messages.push(userMsg, modelMsg);
    conversation.messageCount = conversation.messages.length;
    await conversation.save();

    // Step 5: Write audit log for any system action
    if (actionResult && targetModel) {
        await NexusActionLog.create({
            userId: requestUser._id,
            campusId: requestUser.campusId,
            conversationId: conversation._id,
            intent: resolvedIntent,
            inputPrompt: message.slice(0, 500),
            resolvedAction: intentData,
            outcome: "success",
            targetModel,
            targetId,
            confidence: confidence ?? null,
        }).catch((err) => console.error("[NexusService] Failed to write action log:", err.message));
    }

    // Step 6: Emit completion event
    emitEvent(EventTypes.NEXUS_ACTION_COMPLETED, {
        actorId: requestUser._id,
        payload: { intent: resolvedIntent, conversationId: conversation._id },
    });

    return {
        reply: finalReply,
        intent: resolvedIntent,
        confidence: confidence ?? null,
        actionTaken: actionResult || null,
        conversationId: conversation._id,
        messageId: modelMsg._id ?? null,
    };
};

// ─────────────────────────────────────────────
//  CONVERSATION MANAGEMENT
// ─────────────────────────────────────────────

export const getUserConversations = async (requestUser, queryParams = {}) => {
    return await paginate(
        NexusConversation,
        { userId: requestUser._id, isArchived: false },
        {
            page: queryParams.page || 1,
            limit: queryParams.limit || 20,
            sort: { updatedAt: -1 },
            select: "title messageCount createdAt updatedAt",
        }
    );
};

export const getConversationById = async (conversationId, requestUser) => {
    if (!mongoose.isValidObjectId(conversationId)) {
        throw new ApiError(400, "Invalid conversation ID");
    }

    const conv = await NexusConversation.findOne({
        _id: conversationId,
        userId: requestUser._id,
    });

    if (!conv) throw new ApiError(404, "Conversation not found");
    return conv;
};

export const deleteConversation = async (conversationId, requestUser) => {
    if (!mongoose.isValidObjectId(conversationId)) {
        throw new ApiError(400, "Invalid conversation ID");
    }

    const conv = await NexusConversation.findOneAndDelete({
        _id: conversationId,
        userId: requestUser._id,
    });

    if (!conv) throw new ApiError(404, "Conversation not found");
    return true;
};

export const startNewConversation = async (requestUser) => {
    return await NexusConversation.create({
        userId: requestUser._id,
        campusId: requestUser.campusId,
        title: "New Conversation",
    });
};

export const getUserActionLog = async (requestUser, queryParams = {}) => {
    return await paginate(
        NexusActionLog,
        { userId: requestUser._id },
        {
            page: queryParams.page || 1,
            limit: queryParams.limit || 20,
            sort: { createdAt: -1 },
            select: "intent outcome targetModel targetId inputPrompt createdAt confidence",
        }
    );
};
