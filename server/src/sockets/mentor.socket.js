import { MentorSession } from "../models/mentorSession.model.js";
import { ChatMessage } from "../models/chatMessage.model.js";

const logSocket = (level, event, userId, msg, err = null) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [Socket | Mentor:${event} | User:${userId}]`;
    if (level === "error") {
        console.error(`${prefix} ERROR: ${msg}`, err ? err.message : "");
    } else {
        console.info(`${prefix} INFO: ${msg}`);
    }
};

export const registerMentorHandlers = (io, socket) => {
    const userId = socket.userId;

    // Join a specific mentor session room
    socket.on("mentor:join_session", async (roomId, callback) => {
        try {
            const session = await MentorSession.findOne({ roomId });
            
            if (!session) {
                if (typeof callback === "function") callback({ error: "Session not found" });
                return;
            }

            // Verify access: must be the mentor or the mentee
            const isMentor = session.mentorId.toString() === userId; // Note: mentorId here is the Mentor profile ID, might need to compare against mentor's userId
            // Actually, we need to compare against the userId values.
            // Let's re-fetch with enrichment or use IDs properly.
            
            // To be safe, let's fetch the mentor profile to get its userId
            const isAuthorized = session.menteeId.toString() === userId || session.mentorId.toString() === userId;
            // Wait, MentorSession stores mentorId as Mentor Object ID and menteeId as User Object ID.
            // We need to ensure we have the mentor's USER ID.
            
            const populatedSession = await MentorSession.findOne({ roomId }).populate("mentorId", "userId");
            if (!populatedSession) {
                if (typeof callback === "function") callback({ error: "Session not found" });
                return;
            }

            if (populatedSession.menteeId.toString() !== userId && populatedSession.mentorId.userId.toString() !== userId) {
                logSocket("error", "join_session", userId, "Unauthorized access attempt to roomId: " + roomId);
                if (typeof callback === "function") callback({ error: "Unauthorized access" });
                return;
            }

            socket.join(roomId);
            logSocket("info", "join_session", userId, `Joined room: ${roomId}`);
            
            if (typeof callback === "function") callback({ success: true, status: session.status });

            // Notify others in room
            socket.to(roomId).emit("mentor:user_joined", { userId });
        } catch (err) {
            logSocket("error", "join_session", userId, "Exception in join_session", err);
            if (typeof callback === "function") callback({ error: "Server error joining session" });
        }
    });

    // Send message to mentor session
    socket.on("mentor:send_message", async (data, callback) => {
        try {
            const { roomId, message, type = "text" } = data;

            if (!roomId || !message) {
                if (typeof callback === "function") callback({ error: "Missing roomId or message" });
                return;
            }

            const session = await MentorSession.findOne({ roomId });
            if (!session || session.status !== "active") {
                if (typeof callback === "function") callback({ error: "Session is not active" });
                return;
            }

            // Persistence
            const chatMessage = await ChatMessage.create({
                roomId,
                senderId: userId,
                message,
                type
            });

            const populatedMessage = await ChatMessage.findById(chatMessage._id).populate("senderId", "profile.displayName profile.avatar");

            // Broadcast
            io.to(roomId).emit("mentor:message_received", populatedMessage);
            
            if (typeof callback === "function") callback({ success: true, message: populatedMessage });
        } catch (err) {
            logSocket("error", "send_message", userId, "Exception in send_message", err);
            if (typeof callback === "function") callback({ error: "Server error sending message" });
        }
    });

    socket.on("mentor:typing", ({ roomId, isTyping }) => {
        socket.to(roomId).emit("mentor:typing_status", { userId, isTyping });
    });
};
