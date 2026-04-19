import { systemEvents } from "./events.js";
import { SystemEvent } from "../models/systemEvent.model.js";
import crypto from "crypto";

/**
 * Standardized Event Types with Versions
 */
export const EventTypes = {
    // MENTOR EVENTS
    MENTOR_APPLICATION_SUBMITTED: "MENTOR_APPLICATION_SUBMITTED@v1",
    MENTOR_APPROVED: "MENTOR_APPROVED@v1",
    MENTOR_SUSPENDED: "MENTOR_SUSPENDED@v1",

    // BOOKING EVENTS
    BOOKING_CREATED: "BOOKING_CREATED@v1",
    BOOKING_CONFIRMED: "BOOKING_CONFIRMED@v1",
    BOOKING_CANCELLED: "BOOKING_CANCELLED@v1",
    BOOKING_COMPLETED: "BOOKING_COMPLETED@v1",
    BOOKING_NO_SHOW: "BOOKING_NO_SHOW@v1",

    // SESSION EVENTS
    SESSION_STARTED: "SESSION_STARTED@v1",
    SESSION_ENDED: "SESSION_ENDED@v1",

    // CHAT EVENTS
    MESSAGE_SENT: "MESSAGE_SENT@v1",
    USER_JOINED_SESSION: "USER_JOINED_SESSION@v1",
    USER_LEFT_SESSION: "USER_LEFT_SESSION@v1"
};

/**
 * Centrally emit a standardized system event (Reliable Mode)
 * @param {string} typeSpec - From EventTypes (e.g. EVENT_NAME@v1)
 * @param {object} data - Payload { actorId, targetId, payload, ... }
 */
export const emitEvent = async (typeSpec, data = {}) => {
    const [eventType, version] = typeSpec.includes("@") ? typeSpec.split("@") : [typeSpec, "v1"];
    const eventId = crypto.randomUUID();

    const eventPayload = {
        eventId,
        eventType,
        version,
        actorId: data.actorId || null,
        targetId: data.targetId || null,
        payload: data.payload || {},
        timestamp: new Date().toISOString()
    };

    // Persistence Layer: Store even before emitting for absolute recovery
    try {
        await SystemEvent.create(eventPayload);
        console.log(`[EventBus] Persisted: ${eventType} | ID: ${eventId}`);
    } catch (err) {
        console.error(`[EventBus] CRITICAL: Failed to persist event: ${eventId}`, err.message);
        // We still emit the event so the system functions, but log the persistence failure
    }

    console.log(`[EventBus] Emitting: ${eventType} (${version}) | ID: ${eventId}`);
    systemEvents.emit(typeSpec, eventPayload);
};
