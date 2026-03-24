import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { registerChatHandlers } from "./chat.socket.js";
import { registerPresenceHandlers } from "./presence.socket.js";
import { registerNotificationHandlers } from "./notification.socket.js";

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
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace("Bearer ", "");

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
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

    io.on("connection", (socket) => {
        const userId = socket.userId;
        onlineUsers.set(userId, socket.id);
        socket.join(`user:${userId}`);

        registerPresenceHandlers(io, socket, onlineUsers);
        registerChatHandlers(io, socket);
        registerNotificationHandlers(io, socket);

        socket.on("disconnect", () => {
            onlineUsers.delete(userId);
            io.emit("user:offline", { userId });
        });

        socket.on("error", (err) => {
            console.error(`[Socket] Error for user ${userId}:`, err.message);
        });
    });

    return io;
};
