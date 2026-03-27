
import mongoose from "mongoose";
import { Event } from "../models/event.model.js";
import { EventTeam } from "../models/eventTeam.model.js";

const rateLimits = new Map();

const checkRateLimit = (userId, action, maxCount = 10, windowMs = 5000) => {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const entry = rateLimits.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
        entry.count = 0;
        entry.resetAt = now + windowMs;
    }
    if (entry.count >= maxCount) return false;
    entry.count++;
    rateLimits.set(key, entry);
    return true;
};

setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimits.entries()) {
        if (now > entry.resetAt + 10000) rateLimits.delete(key);
    }
}, 30000);

export const registerEventHandlers = (io, socket) => {
    const userId = socket.userId;
    socket.on("event:join", async ({ eventId } = {}, ackCallback) => {
        try {
            if (!checkRateLimit(userId, "event:join", 5, 10000)) {
                if (typeof ackCallback === "function") ackCallback({ error: "Rate limit exceeded" });
                return;
            }

            if (!eventId || !mongoose.isValidObjectId(eventId)) {
                if (typeof ackCallback === "function") ackCallback({ error: "Invalid eventId" });
                return;
            }

            const event = await Event.findOne(
                { _id: eventId, isOnlineCompetition: true },
                "createdBy judgingConfig.judges status"
            );

            if (!event) {
                if (typeof ackCallback === "function") ackCallback({ error: "Competition not found" });
                return;
            }

            const isOrganizer = event.createdBy.toString() === userId;
            const isJudge = event.judgingConfig?.judges?.some((j) => j.toString() === userId);

            if (isOrganizer || isJudge) {
                socket.join(`event:${eventId}:staff`);
            }
            const inTeam = await EventTeam.isUserInEvent(eventId, userId);

            if (isOrganizer || isJudge || inTeam) {
                socket.join(`event:${eventId}`);
                if (typeof ackCallback === "function") {
                    ackCallback({ success: true, room: `event:${eventId}` });
                }
            } else {
                if (typeof ackCallback === "function") {
                    ackCallback({ error: "You are not a participant in this competition" });
                }
            }
        } catch (err) {
            console.error(`[Event Socket] event:join error for user ${userId}:`, err.message);
            if (typeof ackCallback === "function") ackCallback({ error: "Internal error" });
        }
    });

    socket.on("event:leave", ({ eventId } = {}) => {
        if (!eventId) return;
        socket.leave(`event:${eventId}`);
        socket.leave(`event:${eventId}:staff`);
    });
    socket.on("event:ping", ({ eventId } = {}, ackCallback) => {
        if (typeof ackCallback === "function") {
            ackCallback({ pong: true, eventId, ts: Date.now() });
        }
    });
};
export const emitStatusChange = (io, eventId, data) => {
    if (!io || !eventId) return;
    io.to(`event:${eventId}`).emit("event:status_changed", { eventId, ...data });
};
export const emitAnnouncement = (io, eventId, announcement) => {
    if (!io || !eventId) return;
    io.to(`event:${eventId}`).emit("event:announcement", { eventId, announcement });
};
export const emitLeaderboardUpdate = (io, eventId, data) => {
    if (!io || !eventId) return;
    io.to(`event:${eventId}`).emit("event:leaderboard_update", { eventId, ...data });
};
export const emitTeamUpdate = (io, eventId, data) => {
    if (!io || !eventId) return;
    io.to(`event:${eventId}`).emit("event:team_update", { eventId, ...data });
};
export const emitToEventStaff = (io, eventId, eventName, data) => {
    if (!io || !eventId) return;
    io.to(`event:${eventId}:staff`).emit(eventName, { eventId, ...data });
};