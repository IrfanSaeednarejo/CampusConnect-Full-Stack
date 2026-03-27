import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

const rateLimits = {
    "message:send": new Map(),
    "chat:sync": new Map(),
    "typing": new Map(),
    "chat:read": new Map(),
    "message:status": new Map(),
    "message:react": new Map(),
    "message:edit": new Map(),
};

const checkRateLimit = (action, userId, maxCount, windowMs) => {
    const actionLimit = rateLimits[action];
    const now = Date.now();
    const userLimit = actionLimit.get(userId) || { count: 0, resetAt: now + windowMs };

    if (now > userLimit.resetAt) {
        userLimit.count = 0;
        userLimit.resetAt = now + windowMs;
    }

    if (userLimit.count >= maxCount) {
        return false;
    }

    userLimit.count += 1;
    actionLimit.set(userId, userLimit);
    return true;
};

const processedMessages = new Map();
const IDEMPOTENCY_EXPIRY_MS = 5 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of processedMessages.entries()) {
        if (now > value.expiresAt) {
            processedMessages.delete(key);
        }
    }
}, 60000);

const typingStates = new Map();
const TYPING_TIMEOUT_MS = 5000;

const logSocket = (level, event, userId, msg, err = null) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [Socket | ${event} | User:${userId}]`;
    if (level === "error") {
        console.error(`${prefix} ERROR: ${msg}`, err ? err.message : "");
    } else if (level === "warn") {
        console.warn(`${prefix} WARN: ${msg}`);
    } else {
        console.info(`${prefix} INFO: ${msg}`);
    }
};

export const registerChatHandlers = (io, socket) => {
    const userId = socket.userId;

    socket.on("chat:sync", async (data, ackCallback) => {
        try {
            if (!checkRateLimit("chat:sync", userId, 1, 5000)) {
                logSocket("warn", "chat:sync", userId, "Rate limit exceeded");
                if (typeof ackCallback === "function") ackCallback({ error: "Sync requests are rate limited (1 per 5s)" });
                return;
            }

            const lastMessageAt = data?.lastMessageAt;
            const limit = Math.min(parseInt(data?.limit) || 50, 100);

            if (!lastMessageAt) {
                if (typeof ackCallback === "function") ackCallback({ error: "lastMessageAt is required" });
                return;
            }

            const userChats = await Chat.find({
                "members.userId": userId,
                isArchived: false
            }).select("_id");

            const chatIds = userChats.map(c => c._id);

            const missedMessages = await Message.find({
                chat: { $in: chatIds },
                createdAt: { $gt: new Date(lastMessageAt) }
            })
                .sort({ createdAt: 1 })
                .limit(limit)
                .populate("sender", "profile.displayName profile.avatar")
                .populate("replyTo", "content sender type")
                .populate("attachment", "fileName fileUrl mimeType fileSize");

            const hasMore = missedMessages.length === limit;

            logSocket("info", "chat:sync", userId, `Synced ${missedMessages.length} missed messages`);

            if (typeof ackCallback === "function") ackCallback({ success: true, messages: missedMessages, hasMore });
        } catch (err) {
            logSocket("error", "chat:sync", userId, "Sync failed", err);
            if (typeof ackCallback === "function") ackCallback({ error: err.message });
        }
    });

    socket.on("message:send", async (data, ackCallback) => {
        try {
            if (!checkRateLimit("message:send", userId, 5, 3000)) {
                logSocket("warn", "message:send", userId, "Rate limit exceeded");
                const err = "Rate limit exceeded. Please slow down (5 messages per 3s).";
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err, event: "message:send" });
            }

            const { chatId, content, type = "text", attachmentId, replyToId, idempotencyKey, mentions } = data || {};

            if (!chatId || !mongoose.isValidObjectId(chatId)) {
                const err = "Invalid or missing chatId";
                logSocket("warn", "message:send", userId, err);
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err });
            }

            if (type === "text" && (!content || !content.trim())) {
                const err = "Content cannot be empty for text messages";
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err });
            }

            if (content && content.length > 2000) {
                const err = "Content exceeds maximum length of 2000 characters";
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err });
            }

            if (idempotencyKey && typeof idempotencyKey === "string") {
                const cached = processedMessages.get(idempotencyKey);
                if (cached) {
                    logSocket("info", "message:send", userId, `Idempotency hit for key ${idempotencyKey}`);
                    if (typeof ackCallback === "function") return ackCallback({ success: true, message: cached.message });
                    return;
                }
            }

            const chat = await Chat.findById(chatId).select("members isArchived");
            if (!chat || !chat.hasMember(userId)) {
                const err = "Not a member or chat does not exist";
                logSocket("warn", "message:send", userId, `Unauthorized attempt to send to chat ${chatId}`);
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err });
            }

            if (chat.isArchived) {
                const err = "Chat is archived. Messages cannot be sent.";
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err });
            }

            const populated = await Message.sendNewMessage({
                chatId,
                senderId: userId,
                type,
                content,
                attachmentId,
                replyToId,
                mentions
            });

            if (idempotencyKey && typeof idempotencyKey === "string") {
                processedMessages.set(idempotencyKey, {
                    expiresAt: Date.now() + IDEMPOTENCY_EXPIRY_MS,
                    message: populated,
                });
            }

            const targetMembers = chat.members.map((m) => `user:${m.userId.toString()}`);
            io.to(`chat:${chatId}`).to(targetMembers).emit("message:new", populated);
            logSocket("info", "message:send", userId, `Successfully sent message ${populated._id} to chat ${chatId}`);

            if (typeof ackCallback === "function") {
                ackCallback({ success: true, message: populated });
            }
        } catch (err) {
            logSocket("error", "message:send", userId, "Failed to completely send message", err);
            if (typeof ackCallback === "function") {
                ackCallback({ error: err.message });
            } else {
                socket.emit("error:chat", { message: "Internal Server Error during delivery", event: "message:send" });
            }
        }
    });

    socket.on("message:edit", async (data, ackCallback) => {
        try {
            if (!checkRateLimit("message:edit", userId, 5, 5000)) {
                logSocket("warn", "message:edit", userId, "Rate limit exceeded");
                return;
            }

            const { messageId, chatId, content } = data || {};
            if (!messageId || !chatId || !content || typeof content !== "string" || !mongoose.isValidObjectId(messageId)) {
                if (typeof ackCallback === "function") ackCallback({ error: "Invalid payload" });
                return;
            }

            const trimmedContent = content.trim();
            if (trimmedContent.length === 0 || trimmedContent.length > 2000) {
                if (typeof ackCallback === "function") ackCallback({ error: "Content must be between 1 and 2000 characters" });
                return;
            }

            const message = await Message.findById(messageId);
            if (!message || message.chat.toString() !== chatId) {
                if (typeof ackCallback === "function") ackCallback({ error: "Message not found" });
                return;
            }

            if (!message.sender || message.sender.toString() !== userId) {
                if (typeof ackCallback === "function") ackCallback({ error: "Unauthorized to edit this message" });
                return;
            }

            if (message.type !== "text") {
                if (typeof ackCallback === "function") ackCallback({ error: "Only text messages can be edited" });
                return;
            }

            const EDIT_WINDOW_MS = 15 * 60 * 1000;
            if (Date.now() - new Date(message.createdAt).getTime() > EDIT_WINDOW_MS) {
                if (typeof ackCallback === "function") ackCallback({ error: "Message can only be edited within 15 minutes of sending" });
                return;
            }

            if (message.content === trimmedContent) {
                if (typeof ackCallback === "function") ackCallback({ success: true, message });
                return;
            }
            message.editHistory.push({
                content: message.content,
                editedAt: message.editedAt || message.createdAt
            });

            message.content = trimmedContent;
            message.isEdited = true;
            message.editedAt = new Date();

            await message.save();

            io.to(`chat:${chatId}`).emit("message:updated", {
                messageId,
                chatId,
                content: message.content,
                isEdited: message.isEdited,
                editedAt: message.editedAt,
                editHistory: message.editHistory
            });

            logSocket("info", "message:edit", userId, `Successfully edited message ${messageId}`);
            if (typeof ackCallback === "function") ackCallback({ success: true, message });
        } catch (err) {
            logSocket("error", "message:edit", userId, "Edit failed", err);
            if (typeof ackCallback === "function") ackCallback({ error: err.message });
        }
    });

    socket.on("message:delivered", async (data, ackCallback) => {
        try {
            if (!checkRateLimit("message:status", userId, 15, 5000)) {
                logSocket("warn", "message:delivered", userId, "Rate limit exceeded");
                return;
            }

            const { messageId, chatId } = data || {};
            if (!messageId || !chatId || !mongoose.isValidObjectId(messageId) || !mongoose.isValidObjectId(chatId)) {
                if (typeof ackCallback === "function") ackCallback({ error: "Invalid payload" });
                return;
            }

            const updated = await Message.findOneAndUpdate(
                { _id: messageId, chat: chatId, "deliveredTo.userId": { $ne: userId } },
                { $push: { deliveredTo: { userId, deliveredAt: new Date() } } },
                { new: true }
            );

            if (updated) {
                socket.to(`chat:${chatId}`).emit("message:delivered", {
                    messageId,
                    chatId,
                    userId,
                    deliveredAt: new Date()
                });
            }

            if (typeof ackCallback === "function") ackCallback({ success: true });
        } catch (err) {
            logSocket("error", "message:delivered", userId, "Failed to update delivered status", err);
            if (typeof ackCallback === "function") ackCallback({ error: err.message });
        }
    });

    socket.on("message:seen", async (data, ackCallback) => {
        try {
            if (!checkRateLimit("message:status", userId, 15, 5000)) {
                logSocket("warn", "message:seen", userId, "Rate limit exceeded");
                return;
            }

            const { messageIds, chatId } = data || {};
            if (!chatId || !mongoose.isValidObjectId(chatId) || !Array.isArray(messageIds) || messageIds.length === 0) {
                if (typeof ackCallback === "function") ackCallback({ error: "Invalid payload" });
                return;
            }

            const validDocs = messageIds.filter(id => mongoose.isValidObjectId(id));
            if (!validDocs.length) {
                if (typeof ackCallback === "function") ackCallback({ error: "No valid message IDs" });
                return;
            }

            const now = new Date();

            const updatedResult = await Message.updateMany(
                { _id: { $in: validDocs }, chat: chatId, "readBy.userId": { $ne: userId } },
                { $push: { readBy: { userId, readAt: now } } }
            );

            if (updatedResult.modifiedCount > 0) {
                socket.to(`chat:${chatId}`).emit("message:seen", {
                    messageIds: validDocs,
                    chatId,
                    userId,
                    seenAt: now
                });
            }

            await Chat.markAsRead(chatId, userId);

            const { Notification } = await import("../models/notification.model.js");
            await Notification.updateMany(
                { userId, ref: chatId, type: "chat_message", read: false },
                { $set: { read: true, readAt: now } }
            );

            const unreadCount = await Notification.getUnreadCount(userId);
            io.to(`user:${userId}`).emit("notification:sync", { unreadCount });

            socket.to(`chat:${chatId}`).emit("chat:read", { chatId, userId });

            if (typeof ackCallback === "function") ackCallback({ success: true });
        } catch (err) {
            logSocket("error", "message:seen", userId, "Failed to update seen status", err);
            if (typeof ackCallback === "function") ackCallback({ error: err.message });
        }
    });

    socket.on("message:react", async (data, ackCallback) => {
        try {
            if (!checkRateLimit("message:react", userId, 10, 3000)) {
                logSocket("warn", "message:react", userId, "Rate limit exceeded");
                return;
            }

            const { messageId, chatId, emoji } = data || {};
            if (!messageId || !chatId || !emoji || !mongoose.isValidObjectId(messageId) || typeof emoji !== "string") {
                if (typeof ackCallback === "function") ackCallback({ error: "Invalid payload" });
                return;
            }

            const message = await Message.findById(messageId);
            if (!message || message.chat.toString() !== chatId) {
                if (typeof ackCallback === "function") ackCallback({ error: "Message not found" });
                return;
            }

            const existingReactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
            let hasReacted = false;

            if (existingReactionIndex !== -1) {
                const userIndex = message.reactions[existingReactionIndex].users.findIndex(u => u.toString() === userId);
                if (userIndex !== -1) {
                    message.reactions[existingReactionIndex].users.splice(userIndex, 1);
                    if (message.reactions[existingReactionIndex].users.length === 0) {
                        message.reactions.splice(existingReactionIndex, 1); // Drop empty emoji
                    }
                } else {
                    message.reactions[existingReactionIndex].users.push(userId);
                    hasReacted = true;
                }
            } else {
                message.reactions.push({ emoji, users: [userId] });
                hasReacted = true;
            }

            await message.save();

            io.to(`chat:${chatId}`).emit("message:reaction:update", {
                messageId,
                chatId,
                reactions: message.reactions
            });

            if (hasReacted && message.sender && message.sender.toString() !== userId) {
                const { systemEvents } = await import("../utils/events.js");
                systemEvents.emit("notification:create", {
                    userId: message.sender,
                    type: "chat_message",
                    title: "New Reaction",
                    body: `Reacted ${emoji} to your message`,
                    ref: chatId,
                    refModel: "Chat",
                    actorId: userId,
                    priority: "normal"
                });
            }

            if (typeof ackCallback === "function") ackCallback({ success: true, reactions: message.reactions });
        } catch (err) {
            logSocket("error", "message:react", userId, "Reaction failed", err);
            if (typeof ackCallback === "function") ackCallback({ error: err.message });
        }
    });

    socket.on("typing:start", (data) => {
        if (!checkRateLimit("typing", userId, 5, 2000)) return;

        const chatId = data?.chatId;
        if (!chatId || !mongoose.isValidObjectId(chatId)) return;

        const stateKey = `${chatId}_${userId}`;
        const existingTimer = typingStates.get(stateKey);

        if (existingTimer) {
            clearTimeout(existingTimer);
        } else {
            socket.to(`chat:${chatId}`).emit("typing:start", {
                chatId,
                userId,
                displayName: socket.user?.profile?.displayName,
            });
        }

        typingStates.set(stateKey, setTimeout(() => {
            typingStates.delete(stateKey);
            socket.to(`chat:${chatId}`).emit("typing:stop", { chatId, userId });
        }, TYPING_TIMEOUT_MS));
    });

    socket.on("typing:stop", (data) => {
        if (!checkRateLimit("typing", userId, 5, 2000)) return;

        const chatId = data?.chatId;
        if (!chatId || !mongoose.isValidObjectId(chatId)) return;

        const stateKey = `${chatId}_${userId}`;
        const existingTimer = typingStates.get(stateKey);

        if (existingTimer) {
            clearTimeout(existingTimer);
            typingStates.delete(stateKey);
            socket.to(`chat:${chatId}`).emit("typing:stop", { chatId, userId });
        }
    });

    socket.on("chat:read", async (data) => {
        const chatId = data?.chatId;
        try {
            if (!checkRateLimit("chat:read", userId, 10, 5000)) return;
            if (!chatId || !mongoose.isValidObjectId(chatId)) return;

            await Chat.markAsRead(chatId, userId);
            socket.to(`chat:${chatId}`).emit("chat:read", { chatId, userId });
        } catch (err) {
            logSocket("error", "chat:read", userId, `Failed to mark chat ${chatId} as read`, err);
        }
    });

    socket.on("chat:join", async (data) => {
        const chatId = data?.chatId;
        try {
            if (!chatId || !mongoose.isValidObjectId(chatId)) return;
            const chat = await Chat.findById(chatId).select("members");
            if (!chat || !chat.hasMember(userId)) {
                return socket.emit("error:chat", { message: "Not a member", event: "chat:join" });
            }
            socket.join(`chat:${chatId}`);
            socket.emit("chat:joined", { chatId });
        } catch (err) {
            logSocket("error", "chat:join", userId, `Error joining chat ${chatId}`, err);
            socket.emit("error:chat", { message: "Internal Server Error", event: "chat:join" });
        }
    });

    socket.on("chat:leave", (data) => {
        const chatId = data?.chatId;
        if (chatId) socket.leave(`chat:${chatId}`);
    });
};
