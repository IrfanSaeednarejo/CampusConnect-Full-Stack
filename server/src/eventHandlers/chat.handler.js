import { systemEvents } from "../utils/events.js";
import { EventTypes } from "../utils/eventBus.js";
import { SystemEvent } from "../models/systemEvent.model.js";

const markEventProcessed = async (eventId, status = "processed", error = null) => {
    try {
        await SystemEvent.findOneAndUpdate({ eventId }, { $set: { status, error } });
    } catch (err) {
        console.error(`[Chat Handler] Failed to update event status ${eventId}:`, err.message);
    }
};

export const initChatHandlers = (app) => {
    const io = app.get("io");

    systemEvents.on(EventTypes.MESSAGE_SENT, async (event) => {
        try {
            const { payload, eventId } = event;
            if (io && payload.roomId) {
                io.to(payload.roomId).emit("mentor:message_received", payload.message);
            }
            await markEventProcessed(eventId);
        } catch (err) {
            await markEventProcessed(event.eventId, "failed", err.message);
        }
    });

    systemEvents.on(EventTypes.SESSION_STARTED, async (event) => {
        try {
            const { targetId, payload, eventId } = event;
            if (io) {
                io.to(`user:${targetId}`).emit("mentor:session_ready", payload);
            }
            await markEventProcessed(eventId);
        } catch (err) {
            await markEventProcessed(event.eventId, "failed", err.message);
        }
    });

    systemEvents.on(EventTypes.SESSION_ENDED, async (event) => {
        try {
            const { payload, eventId } = event;
            if (io && payload.roomId) {
                io.to(payload.roomId).emit("mentor:session_concluded", payload);
            }
            await markEventProcessed(eventId);
        } catch (err) {
            await markEventProcessed(event.eventId, "failed", err.message);
        }
    });

    console.log("[Event Handler] Chat handlers initialized");
};
