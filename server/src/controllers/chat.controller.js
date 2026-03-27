import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as chatService from "../services/chat.service.js";

const createOrGetDM = asyncHandler(async (req, res) => {
    const { chat, created } = await chatService.createOrGetDM(req.body, req.user);
    return res.status(created ? 201 : 200).json(
        new ApiResponse(
            created ? 201 : 200,
            chat,
            created ? "Conversation started" : "Conversation retrieved"
        )
    );
});

const getMyChats = asyncHandler(async (req, res) => {
    const enriched = await chatService.getMyChats(req.user);
    return res.status(200).json(
        new ApiResponse(200, enriched, `${enriched.length} chat${enriched.length === 1 ? "" : "s"} found`)
    );
});

const getChatById = asyncHandler(async (req, res) => {
    const chatObj = await chatService.getChatById(req.params.chatId, req.user);
    return res.status(200).json(new ApiResponse(200, chatObj, "Chat fetched"));
});

const updateGroupChat = asyncHandler(async (req, res) => {
    const updated = await chatService.updateGroupChat(req.params.chatId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Chat updated"));
});

const addMemberToChat = asyncHandler(async (req, res) => {
    const updated = await chatService.addMemberToChat(req.params.chatId, req.body, req.user);
    return res.status(201).json(new ApiResponse(201, updated, "Member added to chat"));
});

const removeMemberFromChat = asyncHandler(async (req, res) => {
    const message = await chatService.removeMemberFromChat(req.params.chatId, req.params.userId, req.user);
    return res.status(200).json(new ApiResponse(200, null, message));
});

const sendMessage = asyncHandler(async (req, res) => {
    const populated = await chatService.sendMessage(req.params.chatId, req.body, req.user);
    return res.status(201).json(new ApiResponse(201, populated, "Message sent"));
});

const getChatMessages = asyncHandler(async (req, res) => {
    const data = await chatService.getChatMessages(req.params.chatId, req.query, req.user);
    return res.status(200).json(new ApiResponse(200, data, "Messages fetched"));
});

const editMessage = asyncHandler(async (req, res) => {
    const populated = await chatService.editMessage(req.params.chatId, req.params.msgId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, populated, "Message edited"));
});

const deleteMessage = asyncHandler(async (req, res) => {
    const result = await chatService.deleteMessage(req.params.chatId, req.params.msgId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Message deleted"));
});

const markChatAsRead = asyncHandler(async (req, res) => {
    const { unreadCount, message } = await chatService.markChatAsRead(req.params.chatId, req.user);
    return res.status(200).json(
        new ApiResponse(200, { unreadCount }, message)
    );
});

const toggleReaction = asyncHandler(async (req, res) => {
    const { messageId, reactions, action } = await chatService.toggleReaction(req.params.chatId, req.params.msgId, req.body, req.user);
    return res.status(200).json(
        new ApiResponse(200, { messageId, reactions, action }, `Reaction ${action}`)
    );
});

export {
    createOrGetDM,
    getMyChats,
    getChatById,
    updateGroupChat,
    addMemberToChat,
    removeMemberFromChat,
    sendMessage,
    getChatMessages,
    editMessage,
    deleteMessage,
    markChatAsRead,
    toggleReaction,
};