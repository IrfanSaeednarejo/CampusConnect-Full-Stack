import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

const rateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 3000;
const RATE_LIMIT_MAX_MSGS = 5;

export const registerChatHandlers = (io, socket) => {
    const userId = socket.userId;
    socket.on("chat:sync", async ({ lastMessageAt }, ackCallback) => {
        try {
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
                .populate("sender", "profile.displayName profile.avatar")
                .populate("replyTo", "content sender type")
                .populate("attachment", "fileName fileUrl mimeType fileSize");

            if (typeof ackCallback === "function") ackCallback({ success: true, messages: missedMessages });
        } catch (err) {
            console.error(`[Socket] Sync error for user ${userId}:`, err.message);
            if (typeof ackCallback === "function") ackCallback({ error: err.message });
        }
    });
    socket.on("chat:join", async ({ chatId }) => {
        try {
            if (!mongoose.isValidObjectId(chatId)) return;
            const chat = await Chat.findById(chatId).select("members");
            if (!chat || !chat.hasMember(userId)) {
                return socket.emit("error:chat", { message: "Not a member", event: "chat:join" });
            }
            socket.join(`chat:${chatId}`);
            socket.emit("chat:joined", { chatId });
        } catch (err) {
            socket.emit("error:chat", { message: err.message, event: "chat:join" });
        }
    });

    socket.on("chat:leave", ({ chatId }) => {
        socket.leave(`chat:${chatId}`);
    });

    socket.on("message:send", async (data, ackCallback) => {
        try {
            const now = Date.now();
            const userLimit = rateLimits.get(userId) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

            if (now > userLimit.resetAt) {
                userLimit.count = 0;
                userLimit.resetAt = now + RATE_LIMIT_WINDOW_MS;
            }

            if (userLimit.count >= RATE_LIMIT_MAX_MSGS) {
                if (typeof ackCallback === "function") {
                    return ackCallback({ error: "Rate limit exceeded. Please slow down." });
                }
                return socket.emit("error:chat", { message: "Rate limit exceeded", event: "message:send" });
            }

            userLimit.count += 1;
            rateLimits.set(userId, userLimit);

            const { chatId, content, type = "text", attachmentId, replyToId } = data;

            if (!chatId || !mongoose.isValidObjectId(chatId)) {
                const err = "Invalid chatId";
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err, event: "message:send" });
            }

            const chat = await Chat.findById(chatId).select("members isArchived");
            if (!chat || !chat.hasMember(userId)) {
                const err = "Not a member";
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err, event: "message:send" });
            }

            if (chat.isArchived) {
                const err = "Chat is archived";
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err, event: "message:send" });
            }

            if (type === "text" && (!content || !content.trim())) {
                const err = "Content cannot be empty";
                if (typeof ackCallback === "function") return ackCallback({ error: err });
                return socket.emit("error:chat", { message: err, event: "message:send" });
            }
            const populated = await Message.sendNewMessage({
                chatId,
                senderId: userId,
                type,
                content,
                attachmentId,
                replyToId,
            });

            const targetMembers = chat.members.map(m => `user:${m.userId.toString()}`);
            io.to(`chat:${chatId}`).to(targetMembers).emit("message:new", populated);

            if (typeof ackCallback === "function") {
                ackCallback({ success: true, message: populated });
            }

        } catch (err) {
            if (typeof ackCallback === "function") {
                ackCallback({ error: err.message });
            } else {
                socket.emit("error:chat", { message: err.message, event: "message:send" });
            }
        }
    });

    socket.on("typing:start", ({ chatId }) => {
        if (!chatId) return;
        socket.to(`chat:${chatId}`).emit("typing:start", {
            chatId,
            userId,
            displayName: socket.user?.profile?.displayName,
        });
    });

    socket.on("typing:stop", ({ chatId }) => {
        if (!chatId) return;
        socket.to(`chat:${chatId}`).emit("typing:stop", {
            chatId,
            userId,
        });
    });

    socket.on("chat:read", async ({ chatId }) => {
        try {
            if (!chatId || !mongoose.isValidObjectId(chatId)) return;

            await Chat.markAsRead(chatId, userId);
            socket.to(`chat:${chatId}`).emit("chat:read", { chatId, userId });
        } catch (err) {
            socket.emit("error:chat", { message: err.message, event: "chat:read" });
        }
    });
};
