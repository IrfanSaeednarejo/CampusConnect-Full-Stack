import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

const rateLimits = {
    "message:send": new Map(),
    "chat:sync": new Map(),
    "typing": new Map(),
    "chat:read": new Map(),
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
                isArchived: false,
            }).select("_id");

            const chatIds = userChats.map((c) => c._id);

            const missedMessages = await Message.find({
                chat: { $in: chatIds },
                createdAt: { $gt: new Date(lastMessageAt) },
            })
                .sort({ createdAt: 1 })
                .limit(limit)
                .populate("sender", "profile.displayName profile.avatar")
                .populate("replyTo", "content sender type")
                .populate("attachment", "fileName fileUrl mimeType fileSize");

            const hasMore = missedMessages.length === limit;

            logSocket("info", "chat:sync", userId, `Synced ${missedMessages.length} missed messages`);

            if (typeof ackCallback === "function") {
                ackCallback({ success: true, messages: missedMessages, hasMore });
            }
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

            const { chatId, content, type = "text", attachmentId, replyToId, idempotencyKey } = data || {};

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
            });

            // Cache for retries
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

    socket.on("typing:start", (data) => {
        if (!checkRateLimit("typing", userId, 2, 1000)) return;
        const chatId = data?.chatId;
        if (!chatId || !mongoose.isValidObjectId(chatId)) return;
        socket.to(`chat:${chatId}`).emit("typing:start", {
            chatId,
            userId,
            displayName: socket.user?.profile?.displayName,
        });
    });

    socket.on("typing:stop", (data) => {
        if (!checkRateLimit("typing", userId, 2, 1000)) return;
        const chatId = data?.chatId;
        if (!chatId || !mongoose.isValidObjectId(chatId)) return;
        socket.to(`chat:${chatId}`).emit("typing:stop", {
            chatId,
            userId,
        });
    });

    socket.on("chat:read", async (data) => {
        const chatId = data?.chatId;
        try {
            if (!checkRateLimit("chat:read", userId, 10, 5000)) {
                logSocket("warn", "chat:read", userId, "Rate limit exceeded");
                return;
            }

            if (!chatId || !mongoose.isValidObjectId(chatId)) return;

            await Chat.markAsRead(chatId, userId);
            socket.to(`chat:${chatId}`).emit("chat:read", { chatId, userId });
        } catch (err) {
            logSocket("error", "chat:read", userId, `Failed to mark chat ${chatId} as read`, err);
            socket.emit("error:chat", { message: "Internal server error marking chat as read", event: "chat:read" });
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
