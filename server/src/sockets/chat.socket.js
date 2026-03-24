import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

export const registerChatHandlers = (io, socket) => {
    const userId = socket.userId;
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
    socket.on("message:send", async (data) => {
        try {
            const { chatId, content, type = "text", attachmentId, replyToId } = data;

            if (!chatId || !mongoose.isValidObjectId(chatId)) {
                return socket.emit("error:chat", { message: "Invalid chatId", event: "message:send" });
            }

            const chat = await Chat.findById(chatId).select("members isArchived");
            if (!chat || !chat.hasMember(userId)) {
                return socket.emit("error:chat", { message: "Not a member", event: "message:send" });
            }

            if (chat.isArchived) {
                return socket.emit("error:chat", { message: "Chat is archived", event: "message:send" });
            }

            if (type === "text" && (!content || !content.trim())) {
                return socket.emit("error:chat", { message: "Content cannot be empty", event: "message:send" });
            }
            const populated = await Message.sendNewMessage({
                chatId,
                senderId: userId,
                type,
                content,
                attachmentId,
                replyToId,
            });

            io.to(`chat:${chatId}`).emit("message:new", populated);

        } catch (err) {
            socket.emit("error:chat", { message: err.message, event: "message:send" });
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
