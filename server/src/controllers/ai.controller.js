import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    processMessage,
    getUserConversations,
    getConversationById,
    deleteConversation,
    startNewConversation,
    getUserActionLog,
} from "../services/nexus.service.js";

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

export { sendMessage, createConversation, getConversations, getConversation, removeConversation, getActionLog };