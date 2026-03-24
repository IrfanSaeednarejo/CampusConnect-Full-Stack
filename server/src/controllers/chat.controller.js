import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { File } from "../models/file.model.js";

const CHAT_SELECT = "-members.unreadCount";

const MEMBER_POPULATE = {
    path: "members.userId",
    select: "profile.displayName profile.avatar profile.firstName profile.lastName",
};

const findChatById = async (chatId, select = "") => {
    if (!mongoose.isValidObjectId(chatId)) {
        throw new ApiError(400, "Invalid chat ID format");
    }
    const chat = await Chat.findById(chatId).select(select || undefined);
    if (!chat) throw new ApiError(404, "Chat not found");
    return chat;
};

const requireMember = (chat, userId) => {
    if (!chat.hasMember(userId)) {
        throw new ApiError(403, "You are not a member of this chat");
    }
};

const requireChatAdmin = (chat, userId) => {
    if (!chat.isAdmin(userId)) {
        throw new ApiError(403, "Only chat admins can perform this action");
    }
};

// POST /api/v1/chats/dm
const createOrGetDM = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;

    if (!targetUserId) throw new ApiError(400, "targetUserId is required");
    if (!mongoose.isValidObjectId(targetUserId)) {
        throw new ApiError(400, "Invalid targetUserId format");
    }

    if (targetUserId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot start a conversation with yourself");
    }

    const targetUser = await User.findById(targetUserId)
        .select("status campusId profile.displayName");

    if (!targetUser || targetUser.status === "deleted") {
        throw new ApiError(404, "User not found");
    }
    if (targetUser.status === "suspended") {
        throw new ApiError(403, "Cannot start a conversation with a suspended user");
    }

    if (
        req.user.campusId?.toString() &&
        targetUser.campusId?.toString() &&
        req.user.campusId.toString() !== targetUser.campusId.toString()
    ) {
        throw new ApiError(403, "You can only message users on the same campus");
    }

    const { chat, created } = await Chat.findOrCreateDM(
        req.user._id,
        targetUserId,
        req.user.campusId
    );

    const populated = await Chat.findById(chat._id).populate(MEMBER_POPULATE);

    return res.status(created ? 201 : 200).json(
        new ApiResponse(
            created ? 201 : 200,
            populated,
            created ? "Conversation started" : "Conversation retrieved"
        )
    );
});

// GET /api/v1/chats
const getMyChats = asyncHandler(async (req, res) => {
    const chats = await Chat.findUserChats(req.user._id);

    const enriched = chats.map((chat) => {
        const chatObj = chat.toObject({ virtuals: true });
        const myMembership = chat.members.find(
            (m) => m.userId?._id?.toString() === req.user._id.toString()
                || m.userId?.toString() === req.user._id.toString()
        );
        chatObj.myUnreadCount = myMembership?.unreadCount ?? 0;
        chatObj.members = chatObj.members.map(({ unreadCount: _uc, ...rest }) => rest);
        return chatObj;
    });

    return res.status(200).json(
        new ApiResponse(200, enriched, `${enriched.length} chat${enriched.length === 1 ? "" : "s"} found`)
    );
});

// GET /api/v1/chats/:chatId
const getChatById = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
        .populate(MEMBER_POPULATE)
        .populate("lastMessage");

    if (!chat) throw new ApiError(404, "Chat not found");

    requireMember(chat, req.user._id);

    const chatObj = chat.toObject({ virtuals: true });
    const myMembership = chat.getMember(req.user._id);
    chatObj.myUnreadCount = myMembership?.unreadCount ?? 0;
    chatObj.members = chatObj.members.map(({ unreadCount: _uc, ...rest }) => rest);

    return res.status(200).json(new ApiResponse(200, chatObj, "Chat fetched"));
});

// PATCH /api/v1/chats/:chatId
const updateGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { name, description } = req.body;

    const chat = await findChatById(chatId, "type members name description");

    if (chat.type === "dm") {
        throw new ApiError(400, "DM chats cannot be renamed");
    }

    requireChatAdmin(chat, req.user._id);

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided");
    }

    const updated = await Chat.findByIdAndUpdate(
        chatId,
        { $set: updates },
        { new: true, runValidators: true }
    ).populate(MEMBER_POPULATE);

    return res.status(200).json(new ApiResponse(200, updated, "Chat updated"));
});

// POST /api/v1/chats/:chatId/members
const addMemberToChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.body;

    if (!userId) throw new ApiError(400, "userId is required");
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId format");
    }

    const chat = await findChatById(chatId, "type members campusId");

    if (chat.type === "dm") {
        throw new ApiError(400, "Cannot add members to a DM chat");
    }

    requireChatAdmin(chat, req.user._id);

    if (chat.hasMember(userId)) {
        throw new ApiError(409, "User is already a member of this chat");
    }

    const targetUser = await User.findById(userId)
        .select("status campusId profile.displayName");

    if (!targetUser || targetUser.status === "deleted") {
        throw new ApiError(404, "User not found");
    }

    chat.members.push({ userId, role: "member", joinedAt: new Date(), unreadCount: 0 });
    await chat.save();

    await Message.sendSystemMessage(
        chatId,
        `${targetUser.profile.displayName} was added to the group`
    );

    const updated = await Chat.findById(chatId).populate(MEMBER_POPULATE);
    return res.status(201).json(new ApiResponse(201, updated, "Member added to chat"));
});

// DELETE /api/v1/chats/:chatId/members/:userId
const removeMemberFromChat = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId format");
    }

    const chat = await findChatById(chatId, "type members");

    if (chat.type === "dm") {
        throw new ApiError(400, "Cannot remove members from a DM chat");
    }

    if (!chat.hasMember(req.user._id)) {
        throw new ApiError(403, "You are not a member of this chat");
    }

    const isSelf = userId === req.user._id.toString();
    const isAdmin = chat.isAdmin(req.user._id);

    if (!isSelf && !isAdmin) {
        throw new ApiError(403, "Only admins can remove other members");
    }

    const targetMember = chat.getMember(userId);
    if (!targetMember) throw new ApiError(404, "User is not a member of this chat");

    if (targetMember.role === "admin") {
        const adminCount = chat.members.filter((m) => m.role === "admin").length;
        if (adminCount <= 1) {
            throw new ApiError(
                400,
                "Cannot remove the only admin. Promote another member first."
            );
        }
    }

    chat.members = chat.members.filter((m) => m.userId.toString() !== userId);
    await chat.save();

    const removedUser = await User.findById(userId).select("profile.displayName");
    await Message.sendSystemMessage(
        chatId,
        isSelf
            ? `${removedUser?.profile.displayName} left the group`
            : `${removedUser?.profile.displayName} was removed from the group`
    );

    return res.status(200).json(new ApiResponse(200, null, isSelf ? "You left the chat" : "Member removed"));
});

// POST /api/v1/chats/:chatId/messages
const sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { content, type = "text", attachmentId, replyToId } = req.body;

    const chat = await findChatById(chatId, "members isArchived type");

    requireMember(chat, req.user._id);

    if (chat.isArchived) {
        throw new ApiError(400, "Cannot send messages to an archived chat");
    }
    if (type === "text" && (!content || !content.trim())) {
        throw new ApiError(400, "Message content cannot be empty");
    }
    if ((type === "image" || type === "file") && !attachmentId) {
        throw new ApiError(400, `attachmentId is required for ${type} messages`);
    }
    if (attachmentId && !mongoose.isValidObjectId(attachmentId)) {
        throw new ApiError(400, "Invalid attachmentId format");
    }

    if (replyToId) {
        if (!mongoose.isValidObjectId(replyToId)) {
            throw new ApiError(400, "Invalid replyToId format");
        }
        const parent = await Message.findOne({ _id: replyToId, chat: chatId });
        if (!parent) throw new ApiError(404, "Message being replied to not found in this chat");
    }

    const populated = await Message.sendNewMessage({
        chatId,
        senderId: req.user._id,
        type,
        content,
        attachmentId,
        replyToId,
    });

    return res.status(201).json(new ApiResponse(201, populated, "Message sent"));
});

// GET /api/v1/chats/:chatId/messages?before=<msgId>&limit=50
const getChatMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { before, limit = 50 } = req.query;

    const chat = await findChatById(chatId, "members");
    requireMember(chat, req.user._id);
    if (before && !mongoose.isValidObjectId(before)) {
        throw new ApiError(400, "Invalid cursor format for 'before' parameter");
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    const messages = await Message.getChatMessages(chatId, {
        before: before || undefined,
        limit: parsedLimit,
    });

    const ordered = [...messages].reverse();
    const hasMore = messages.length === parsedLimit;
    const nextCursor = hasMore ? messages[messages.length - 1]._id : null;

    return res.status(200).json(
        new ApiResponse(200, {
            messages: ordered,
            pagination: {
                hasMore,
                nextCursor,
                count: ordered.length,
            },
        }, "Messages fetched")
    );
});

// PATCH /api/v1/chats/:chatId/messages/:msgId
const editMessage = asyncHandler(async (req, res) => {
    const { chatId, msgId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) throw new ApiError(400, "New content cannot be empty");

    if (!mongoose.isValidObjectId(msgId)) {
        throw new ApiError(400, "Invalid message ID format");
    }

    const chat = await findChatById(chatId, "members");
    requireMember(chat, req.user._id);

    const message = await Message.findOne({ _id: msgId, chat: chatId });
    if (!message) throw new ApiError(404, "Message not found in this chat");

    if (message.sender?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only edit your own messages");
    }

    if (message.isDeleted) {
        throw new ApiError(400, "Cannot edit a deleted message");
    }

    if (message.type !== "text") {
        throw new ApiError(400, "Only text messages can be edited");
    }

    message.content = content.trim();
    message.editedAt = new Date();
    await message.save();

    const populated = await Message.findById(message._id)
        .populate("sender", "profile.displayName profile.avatar");

    return res.status(200).json(new ApiResponse(200, populated, "Message edited"));
});

// DELETE /api/v1/chats/:chatId/messages/:msgId
const deleteMessage = asyncHandler(async (req, res) => {
    const { chatId, msgId } = req.params;

    if (!mongoose.isValidObjectId(msgId)) {
        throw new ApiError(400, "Invalid message ID format");
    }

    const [chat, message] = await Promise.all([
        findChatById(chatId, "members"),
        Message.findOne({ _id: msgId, chat: chatId }),
    ]);

    if (!message) throw new ApiError(404, "Message not found in this chat");

    requireMember(chat, req.user._id);

    const isSender = message.sender?.toString() === req.user._id.toString();
    const isAdmin = chat.isAdmin(req.user._id);

    if (!isSender && !isAdmin) {
        throw new ApiError(403, "You can only delete your own messages");
    }

    if (message.isDeleted) {
        throw new ApiError(400, "Message is already deleted");
    }

    message.isDeleted = true;
    message.content = "[deleted]";

    if (message.attachment) {
        const file = await File.findById(message.attachment).select("+publicId");
        if (file && file.publicId) {
            const { deleteFromCloudinary } = await import("../utils/cloudinary.js");
            const resourceType = file.mimeType.startsWith("video/") || file.mimeType.startsWith("audio/") ? "video" : "image";
            deleteFromCloudinary(file.publicId, resourceType === "video" ? "video" : "image").catch(err =>
                console.error("[Chat Controller] Cloudinary attachment deletion error:", err.message)
            );
        }
        if (file) await File.findByIdAndDelete(file._id);
        message.attachment = undefined;
    }

    await message.save();

    return res.status(200).json(new ApiResponse(200, { messageId: msgId }, "Message deleted"));
});

// PATCH /api/v1/chats/:chatId/read
const markChatAsRead = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await findChatById(chatId, "members");
    requireMember(chat, req.user._id);

    const result = await Chat.markAsRead(chatId, req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            { unreadCount: 0 },
            result?.alreadyRead ? "Already up to date" : "Chat marked as read"
        )
    );
});

// POST /api/v1/chats/:chatId/messages/:msgId/react
const toggleReaction = asyncHandler(async (req, res) => {
    const { chatId, msgId } = req.params;
    const { emoji } = req.body;

    if (!emoji?.trim()) throw new ApiError(400, "emoji is required");

    if (!mongoose.isValidObjectId(msgId)) {
        throw new ApiError(400, "Invalid message ID format");
    }

    const chat = await findChatById(chatId, "members");
    requireMember(chat, req.user._id);

    const message = await Message.findOne({ _id: msgId, chat: chatId });
    if (!message) throw new ApiError(404, "Message not found in this chat");

    if (message.isDeleted) {
        throw new ApiError(400, "Cannot react to a deleted message");
    }

    const userId = req.user._id.toString();
    const existingIdx = message.reactions.findIndex(
        (r) => r.userId.toString() === userId && r.emoji === emoji.trim()
    );

    let action;
    if (existingIdx !== -1) {
        message.reactions.splice(existingIdx, 1);
        action = "removed";
    } else {
        message.reactions.push({ userId: req.user._id, emoji: emoji.trim() });
        action = "added";
    }

    await message.save();

    return res.status(200).json(
        new ApiResponse(200, {
            messageId: msgId,
            reactions: message.reactions,
            action,
        }, `Reaction ${action}`)
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