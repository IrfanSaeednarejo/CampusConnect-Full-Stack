import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
    processMessage,
    getUserConversations,
    getConversationById,
    deleteConversation,
    startNewConversation,
    getUserActionLog,
} from "../services/nexus.service.js";
import {
    draftPost,
    improvePost,
    suggestHashtags,
    generatePollOptions,
    moderateContent,
} from "../services/postAI.service.js";

// ─── Rate Limiter (in-memory, per user) ───────────────────────────────────────
// Max 10 AI post-assist calls per user per 10 minutes
const AI_RATE_WINDOW_MS   = 10 * 60 * 1000;
const AI_RATE_LIMIT       = 10;
const _rateLimitMap       = new Map(); // userId → [timestamps]

const checkRateLimit = (userId) => {
    const now   = Date.now();
    const calls = (_rateLimitMap.get(userId) || []).filter((t) => now - t < AI_RATE_WINDOW_MS);
    if (calls.length >= AI_RATE_LIMIT) {
        throw new ApiError(429, "AI rate limit reached. Please wait a few minutes before generating again.");
    }
    calls.push(now);
    _rateLimitMap.set(userId, calls);
};

/**
 * POST /nexus/chat
 * Main entry point — send a message to Nexus.
 */
const sendMessage = asyncHandler(async (req, res) => {
    const { message, conversationId } = req.body;
    const result = await processMessage(message, req.user, conversationId || null);
    return res.status(200).json(new ApiResponse(200, result, "Nexus response generated"));
});

/**
 * POST /nexus/conversations
 * Start a new empty conversation thread.
 */
const createConversation = asyncHandler(async (req, res) => {
    const conversation = await startNewConversation(req.user);
    return res.status(201).json(new ApiResponse(201, conversation, "Conversation started"));
});

/**
 * GET /nexus/conversations
 * List all of the user's conversations (paginated, no messages payload).
 */
const getConversations = asyncHandler(async (req, res) => {
    const result = await getUserConversations(req.user, req.query);
    return res.status(200).json(new ApiResponse(200, result, "Conversations fetched"));
});

/**
 * GET /nexus/conversations/:id
 * Get a single conversation with its full message history.
 */
const getConversation = asyncHandler(async (req, res) => {
    const conversation = await getConversationById(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, conversation, "Conversation fetched"));
});

/**
 * DELETE /nexus/conversations/:id
 * Delete a conversation — enforces ownership.
 */
const removeConversation = asyncHandler(async (req, res) => {
    await deleteConversation(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, null, "Conversation deleted"));
});

/**
 * GET /nexus/actions
 * Get the user's Nexus AI action audit log.
 */
const getActionLog = asyncHandler(async (req, res) => {
    const result = await getUserActionLog(req.user, req.query);
    return res.status(200).json(new ApiResponse(200, result, "Action log fetched"));
});

/**
 * POST /nexus/draft
 * Generate structured data to autofill forms based on a natural language prompt.
 */
const generateDraft = asyncHandler(async (req, res) => {
    const { prompt, schemaType } = req.body;
    const { generateFormDraft } = await import("../services/nexus.service.js");
    const result = await generateFormDraft(prompt, schemaType);
    return res.status(200).json(new ApiResponse(200, result, "Draft generated successfully"));
});

// ─── Post AI Handlers ──────────────────────────────────────────────────────────

/**
 * POST /nexus/post/draft
 * Generate a full post body from a rough topic / idea.
 */
const draftPostHandler = asyncHandler(async (req, res) => {
    checkRateLimit(req.user._id.toString());
    const { topic, tone = "casual" } = req.body;
    if (!topic?.trim()) throw new ApiError(400, "topic is required");

    const userContext = {
        displayName: req.user.profile?.displayName || "a student",
        campusName:  req.user.campusId?.name       || "the university",
    };

    const result = await draftPost(topic.trim(), userContext, tone);
    return res.status(200).json(new ApiResponse(200, result, "Post draft generated"));
});

/**
 * POST /nexus/post/improve
 * Rewrite an existing post body with the specified tone.
 */
const improvePostHandler = asyncHandler(async (req, res) => {
    checkRateLimit(req.user._id.toString());
    const { body, tone = "casual" } = req.body;
    if (!body?.trim()) throw new ApiError(400, "body is required");

    const result = await improvePost(body.trim(), tone);
    return res.status(200).json(new ApiResponse(200, result, "Post improved"));
});

/**
 * POST /nexus/post/hashtags
 * Suggest 3–7 relevant hashtags from the post body.
 */
const suggestHashtagsHandler = asyncHandler(async (req, res) => {
    checkRateLimit(req.user._id.toString());
    const { body } = req.body;
    if (!body?.trim()) throw new ApiError(400, "body is required");

    const result = await suggestHashtags(body.trim());
    return res.status(200).json(new ApiResponse(200, result, "Hashtags suggested"));
});

/**
 * POST /nexus/post/poll
 * Generate 4 smart poll options from a question.
 */
const generatePollHandler = asyncHandler(async (req, res) => {
    checkRateLimit(req.user._id.toString());
    const { question } = req.body;
    if (!question?.trim()) throw new ApiError(400, "question is required");

    const result = await generatePollOptions(question.trim());
    return res.status(200).json(new ApiResponse(200, result, "Poll options generated"));
});

/**
 * POST /nexus/post/moderate
 * Pre-submission content safety check.
 */
const moderatePostHandler = asyncHandler(async (req, res) => {
    // Moderation doesn't count against the user's rate limit
    const { body } = req.body;
    if (!body?.trim()) {
        return res.status(200).json(new ApiResponse(200, { safe: true, score: 0, reason: null }, "Content is safe"));
    }

    const result = await moderateContent(body.trim());
    return res.status(200).json(new ApiResponse(200, result, "Content moderated"));
});

export {
    sendMessage, createConversation, getConversations, getConversation,
    removeConversation, getActionLog, generateDraft,
    // Post AI
    draftPostHandler, improvePostHandler, suggestHashtagsHandler,
    generatePollHandler, moderatePostHandler,
};