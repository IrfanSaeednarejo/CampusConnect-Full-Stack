import { systemEvents } from "../utils/events.js";
import { EventTypes } from "../utils/eventBus.js";
import { Notification } from "../models/notification.model.js";
import { SystemEvent } from "../models/systemEvent.model.js";
import { emitNotification } from "../sockets/notification.socket.js";

/**
 * Helper to update event status to processed/failed
 */
const markEventProcessed = async (eventId, status = "processed", error = null) => {
    try {
        await SystemEvent.findOneAndUpdate({ eventId }, { $set: { status, error } });
    } catch (err) {
        console.error(`[Event Handler] Failed to update event status ${eventId}:`, err.message);
    }
};

/**
 * Helper to wrap notification creation logic
 */
const createNotification = async (app, data) => {
    try {
        const n = await Notification.create(data);
        const io = app.get("io");
        if (io) {
            emitNotification(io, n.userId, n);
        }
        return n;
    } catch (error) {
        if (error.code === 11000) {
            console.log(`[Event Handler] Duplicate notification blocked (eventId: ${data.eventId})`);
            return null;
        }
        console.error("[Event Handler] Notification creation failed:", error.message);
        throw error; // Rethrow to mark event as failed
    }
};

export const initMentoringHandlers = (app) => {
    // --- BOOKING EVENTS ---

    systemEvents.on(EventTypes.BOOKING_CREATED, async (event) => {
        try {
            const { actorId, targetId, payload, eventId } = event;
            await createNotification(app, {
                userId: targetId,
                type: "mentor_booking",
                title: "New Mentorship Request",
                body: `${payload.actorName} has requested a session on ${payload.date}.`,
                ref: payload.bookingId,
                refModel: "MentorBooking",
                actorId,
                eventId
            });
            await markEventProcessed(eventId);
        } catch (err) {
            await markEventProcessed(event.eventId, "failed", err.message);
        }
    });

    systemEvents.on(EventTypes.BOOKING_CONFIRMED, async (event) => {
        try {
            const { actorId, targetId, payload, eventId } = event;
            await createNotification(app, {
                userId: targetId,
                type: "mentor_booking",
                title: "Session Confirmed",
                body: `Your mentoring session on ${payload.date} is confirmed!`,
                ref: payload.bookingId,
                refModel: "MentorBooking",
                actorId,
                eventId
            });
            await markEventProcessed(eventId);
        } catch (err) {
            await markEventProcessed(event.eventId, "failed", err.message);
        }
    });

    systemEvents.on(EventTypes.BOOKING_CANCELLED, async (event) => {
        try {
            const { actorId, targetId, payload, eventId } = event;
            await createNotification(app, {
                userId: targetId,
                type: "mentor_booking",
                title: "Session Cancelled",
                body: `${payload.actorName} cancelled the session for ${payload.date}.`,
                ref: payload.bookingId,
                refModel: "MentorBooking",
                actorId,
                eventId,
                priority: "high"
            });
            await markEventProcessed(eventId);
        } catch (err) {
            await markEventProcessed(event.eventId, "failed", err.message);
        }
    });

    systemEvents.on(EventTypes.BOOKING_COMPLETED, async (event) => {
        try {
            const { actorId, targetId, payload, eventId } = event;
            await createNotification(app, {
                userId: targetId,
                type: "mentor_review",
                title: "Session Completed",
                body: `Your session is complete! Don't forget to leave a review.`,
                ref: payload.bookingId,
                refModel: "MentorBooking",
                actorId,
                eventId
            });
            await markEventProcessed(eventId);
        } catch (err) {
            await markEventProcessed(event.eventId, "failed", err.message);
        }
    });

    // --- MENTOR PROFILE EVENTS ---

    systemEvents.on(EventTypes.MENTOR_APPROVED, async (event) => {
        try {
            const { targetId, eventId } = event;
            await createNotification(app, {
                userId: targetId,
                type: "admin",
                title: "🎉 Mentor Profile Verified!",
                body: "Congratulations! Your mentor profile has been verified by the admin team.",
                eventId
            });
            await markEventProcessed(eventId);
        } catch (err) {
            await markEventProcessed(event.eventId, "failed", err.message);
        }
    });

    systemEvents.on(EventTypes.MENTOR_SUSPENDED, async (event) => {
        try {
            const { targetId, payload, eventId } = event;
            await createNotification(app, {
                userId: targetId,
                type: "admin",
                title: "Mentor Profile Suspended",
                body: `Your profile has been suspended: ${payload.reason || "Policy violation"}.`,
                eventId,
                priority: "high"
            });
            await markEventProcessed(eventId);
        } catch (err) {
            await markEventProcessed(event.eventId, "failed", err.message);
        }
    });

    console.log("[Event Handler] Mentoring handlers initialized");
};
