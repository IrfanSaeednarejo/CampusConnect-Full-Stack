import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { registerChatHandlers } from "./chat.socket.js";
import { registerPresenceHandlers } from "./presence.socket.js";
import { registerNotificationHandlers } from "./notification.socket.js";
import { registerEventHandlers } from "./event.socket.js";
import { registerMentorHandlers } from "./mentor.socket.js";


const onlineUsers = new Map();

export const getOnlineUsers = () => onlineUsers;

export const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: [
                "https://campus-connect-full-stack.vercel.app",
                "http://localhost:5173",
            ],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    io.use(async (socket, next) => {
        try {
            let token = null;
            const cookieHeader = socket.handshake.headers?.cookie;
            if (cookieHeader) {
                const cookies = Object.fromEntries(
                    cookieHeader.split(";").map((c) => {
                        const [key, ...val] = c.trim().split("=");
                        return [key, val.join("=")];
                    })
                );
                token = cookies.accessToken || null;
            }

            if (!token) {
                token =
                    socket.handshake.auth?.token ||
                    socket.handshake.headers?.authorization?.replace("Bearer ", "");
            }

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const timeRemaining = (decoded.exp * 1000) - Date.now();
            if (timeRemaining <= 0) {
                return next(new Error("Token has expired"));
            }
            socket.tokenExpRemaining = timeRemaining;

            const user = await User.findById(decoded._id).select(
                "_id campusId profile.displayName profile.avatar roles"
            );

            if (!user) return next(new Error("User not found"));

            socket.user = user;
            socket.userId = user._id.toString();
            next();
        } catch (err) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", async (socket) => {
        const userId = socket.userId;

        socket.authTimeout = setTimeout(() => {
            socket.emit("error:auth", { message: "Session expired" });
            socket.disconnect(true);
        }, socket.tokenExpRemaining);
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        socket.join(`user:${userId}`);

        try {
            const userChats = await Chat.find({
                "members.userId": userId,
                isArchived: false
            }).select("_id");

            const chatRooms = userChats.map(c => `chat:${c._id.toString()}`);
            if (chatRooms.length > 0) {
                socket.join(chatRooms);
            }
        } catch (err) {
            console.error(`[Socket] Failed to pre-join chats for user ${userId}:`, err.message);
        }

        registerPresenceHandlers(io, socket, onlineUsers);
        registerChatHandlers(io, socket);
        registerNotificationHandlers(io, socket);
        registerEventHandlers(io, socket);
        registerMentorHandlers(io, socket);

        socket.on("disconnect", () => {
            clearTimeout(socket.authTimeout);

            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    io.emit("user:offline", { userId });
                }
            }
        });

        socket.on("error", (err) => {
            console.error(`[Socket] Error for user ${userId}:`, err.message);
        });
    });

    return io;
};
