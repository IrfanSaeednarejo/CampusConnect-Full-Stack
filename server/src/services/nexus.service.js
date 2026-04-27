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
    "needs_clarification",
];

// Per-user in-memory rate limiter (20 req/hour)
// In production: replace with Redis
const rateLimitMap = new Map(); // userId → { count, resetAt }
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// ─────────────────────────────────────────────
//  SYSTEM PROMPT (Intent Detector)
// ─────────────────────────────────────────────

const INTENT_SYSTEM_PROMPT = `You are Nexus, an intelligent AI assistant embedded in CampusNexus — a university productivity and academic platform.

Your job is to analyse the user's message and return a structured JSON response.

SUPPORTED INTENTS:
- "create_note": User wants to save information. REQUIRED: "title", "content".
- "create_task": User wants a reminder/task. REQUIRED: "title". OPTIONAL: "dueDate", "priority", "description".
- "explain_notes": Summarize saved notes. REQUIRED: "topic".
- "suggest_mentors": Find a mentor. REQUIRED: "query".
- "study_explain": Academic explanation. REQUIRED: "topic".
- "needs_clarification": Use this if user intent matches one of the above but a REQUIRED field is missing.
- "general_chat": Small talk, questions about Nexus, or irrelevant topics.

RESPONSE FORMAT (strict JSON):
{
  "intent": "<intent>",
  "confidence": <0.0–1.0>,
  "reply": "<conversational response>",
  "data": { ... },
  "missingFields": ["field1", "field2"] // Only if intent is "needs_clarification"
}

RULES:
- If a REQUIRED field is missing, set intent to "needs_clarification", list the missing field names in "missingFields", and ask a friendly follow-up question in "reply".
- For "create_task", if no title is given (e.g. user says "Set a reminder"), ask "What would you like the reminder for?".
- For "create_note", if only a title is given (e.g. "Save a note called Shopping List"), ask "What content should I add to the note?".
- Always provide a conversational, helpful "reply".`;

// ─────────────────────────────────────────────
//  SYSTEM PROMPT (Chat)
// ─────────────────────────────────────────────

const buildChatSystemPrompt = (user) => `You are Nexus, an intelligent AI assistant for CampusNexus — a university productivity platform.

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

    const missing = [];
    if (!title?.trim()) missing.push("title");
    if (!content?.trim()) missing.push("content");

    if (missing.length > 0) {
        return { success: false, missingFields: missing };
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
        return { success: false, missingFields: ["title"] };
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

    checkRateLimit(requestUser._id);
    const conversation = await resolveConversation(conversationId, requestUser);

    if (conversation.messages.length === 0) {
        conversation.title = generateTitle(message);
    }

    const geminiHistory = buildGeminiHistory(conversation.messages);

    // Step 1: Context Injection (include pending action if any)
    let intentContext = `User message: "${message}"\nToday: ${new Date().toISOString()}\nUser department: ${requestUser.academic?.department || "unknown"}`;
    if (conversation.pendingAction?.intent) {
        intentContext += `\n\nPENDING CONTEXT: The user previously tried to "${conversation.pendingAction.intent}". 
        Current partial data: ${JSON.stringify(conversation.pendingAction.data)}. 
        Missing fields: ${conversation.pendingAction.missingFields.join(", ")}.
        Please determine if this new message provides the missing information.`;
    }

    // Step 2: Intent Detection
    let parsed;
    try {
        parsed = await generateStructuredJSON(intentContext, INTENT_SYSTEM_PROMPT);
    } catch (err) {
        console.error("[NexusService] Intent parsing failed:", err.message);
        parsed = { intent: "general_chat", confidence: 0.5, reply: "", data: {} };
    }

    const { intent, confidence, data: intentData, reply: intentReply, missingFields } = parsed;
    let resolvedIntent = SUPPORTED_INTENTS.includes(intent) ? intent : "general_chat";

    // Step 3: Clarification Logic
    if (resolvedIntent === "needs_clarification" || (missingFields && missingFields.length > 0)) {
        // Save current data to pendingAction
        conversation.pendingAction = {
            intent: intentData?.intent || conversation.pendingAction?.intent || "general_chat",
            data: { ...(conversation.pendingAction?.data || {}), ...(intentData || {}) },
            missingFields: missingFields || [],
            updatedAt: new Date()
        };
        await conversation.save();

        const modelMsg = {
            role: "model",
            content: intentReply || "Could you provide a bit more detail so I can help with that?",
            intent: "needs_clarification",
            timestamp: new Date(),
        };
        conversation.messages.push({ role: "user", content: message, timestamp: new Date() }, modelMsg);
        await conversation.save();

        return {
            reply: modelMsg.content,
            intent: "needs_clarification",
            conversationId: conversation._id,
        };
    }

    // Merge pending data if we are fulfilling a previous request
    let finalData = intentData;
    if (conversation.pendingAction?.intent && (resolvedIntent === conversation.pendingAction.intent || resolvedIntent === "general_chat")) {
        finalData = { ...conversation.pendingAction.data, ...intentData };
        resolvedIntent = conversation.pendingAction.intent;
    }

    const chatSession = startChat(geminiHistory, buildChatSystemPrompt(requestUser));
    let finalReply = intentReply || "";
    let actionResult = null;
    let targetModel = null;
    let targetId = null;

    // Step 4: Action Execution
    try {
        if (resolvedIntent === "create_note") {
            const result = await handleCreateNote(finalData, finalReply, requestUser);
            if (result.success) {
                actionResult = result.summary;
                targetModel = "Note";
                targetId = result.summary.id;
                finalReply = finalReply || `✅ I've saved your note: **"${result.summary.title}"**`;
                conversation.pendingAction = null; // Success! Clear pending
            } else {
                // Still missing fields? (Should have been caught by detector, but double check)
                conversation.pendingAction = { intent: "create_note", data: finalData, missingFields: result.missingFields };
                finalReply = `I need a bit more info to save that note. ${result.missingFields.includes('title') ? 'What should the title be?' : 'What content should I add?'}`;
            }
        } else if (resolvedIntent === "create_task") {
            const result = await handleCreateTask(finalData, finalReply, requestUser);
            if (result.success) {
                actionResult = result.summary;
                targetModel = "Task";
                targetId = result.summary.id;
                finalReply = finalReply || `✅ Task **"${result.summary.title}"** created!`;
                conversation.pendingAction = null;
            } else {
                conversation.pendingAction = { intent: "create_task", data: finalData, missingFields: result.missingFields };
                finalReply = "What would you like the task title to be?";
            }
        } else if (resolvedIntent === "explain_notes") {
            const result = await handleExplainNotes(finalData, requestUser, chatSession);
            finalReply = result.reply;
        } else if (resolvedIntent === "suggest_mentors") {
            const result = await handleSuggestMentors(finalData, requestUser);
            actionResult = { mentors: result.mentors, count: result.count };
            finalReply = finalReply || `I found **${result.count}** mentors for you.`;
        } else if (resolvedIntent === "study_explain") {
            const result = await handleStudyExplain(finalData, chatSession);
            finalReply = result.reply;
        } else {
            const r = await chatSession.sendMessage(message);
            finalReply = r.response.text();
        }
    } catch (err) {
        console.error(`[NexusService] Action failed:`, err.message);
        const r = await chatSession.sendMessage(message);
        finalReply = r.response.text();
    }

    // Step 5: Save & Return
    const userMsg = { role: "user", content: message, timestamp: new Date() };
    const modelMsg = {
        role: "model",
        content: finalReply,
        intent: resolvedIntent,
        actionTaken: actionResult,
        timestamp: new Date(),
    };

    conversation.messages.push(userMsg, modelMsg);
    await conversation.save();

    if (actionResult && targetModel) {
        await NexusActionLog.create({
            userId: requestUser._id,
            conversationId: conversation._id,
            intent: resolvedIntent,
            inputPrompt: message.slice(0, 500),
            outcome: "success",
            targetModel,
            targetId,
        }).catch(() => {});
    }

    return {
        reply: finalReply,
        intent: resolvedIntent,
        actionTaken: actionResult,
        conversationId: conversation._id,
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

// ─────────────────────────────────────────────
//  FORM DRAFTING (AUTOFILL)
// ─────────────────────────────────────────────

/**
 * Generates a structured JSON draft for complex forms based on a natural language prompt.
 * @param {string} prompt The natural language description.
 * @param {string} schemaType "event" or "society"
 */
export const generateFormDraft = async (prompt, schemaType) => {
    if (!prompt?.trim()) throw new ApiError(400, "Draft prompt cannot be empty");
    
    let systemPrompt = `You are Nexus Draft, an AI that converts natural language into strict JSON for form autofilling.
Current Date/Time context: ${new Date().toISOString()}

Return ONLY a JSON object that matches the requested schema. If information is missing from the user's prompt, leave the field empty ("" or null) or use sensible defaults. DO NOT make up details like URLs or addresses if not provided.`;

    if (schemaType === "event") {
        systemPrompt += `
SCHEMA REQUIRED FOR "event":
{
    "title": "string (extract a catchy title)",
    "description": "string (extract or generate a short professional description based on the prompt)",
    "category": "academic | cultural | sports | social | workshop | competition | networking | other",
    "eventType": "general | hackathon | coding_competition | workshop | seminar",
    "startAt": "ISO 8601 string (parse dates relative to current date, set to null if none mentioned)",
    "endAt": "ISO 8601 string (typically 1-3 hours after start if not specified, null if no start)",
    "venueType": "physical | online | hybrid",
    "venueAddress": "string (extract physical address/room if mentioned)",
    "venueOnlineUrl": "string (extract URL if mentioned)",
    "tags": ["string array (generate 2-4 relevant tags)"]
}`;
    } else if (schemaType === "society") {
        systemPrompt += `
SCHEMA REQUIRED FOR "society":
{
    "name": "string (extract society name)",
    "tag": "string (generate a URL-friendly tag, 3-20 chars, lowercase, letters/numbers/hyphens only)",
    "category": "academic | cultural | sports | tech | social | arts | professional | other",
    "description": "string (extract or generate a short mission statement)"
}`;
    } else {
        throw new ApiError(400, "Invalid schema type for drafting");
    }

    const context = `User Prompt: "${prompt}"`;
    
    try {
        const parsed = await generateStructuredJSON(context, systemPrompt);
        return parsed;
    } catch (err) {
        console.error("[NexusService] Draft generation failed:", err.message);
        throw new ApiError(500, "Failed to generate draft. Please try again.");
    }
};

