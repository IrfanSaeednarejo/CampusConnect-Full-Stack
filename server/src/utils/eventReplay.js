import { SystemEvent } from "../models/systemEvent.model.js";
import { emitEvent, EventTypes } from "./eventBus.js";

/**
 * Replays a specific event by ID
 * @param {string} eventId 
 */
export const replayEvent = async (eventId) => {
    const event = await SystemEvent.findOne({ eventId });
    if (!event) throw new Error("Event not found");

    console.log(`[EventReplay] Manually replaying event: ${event.eventType} | ID: ${eventId}`);
    
    // We re-emit using the same data but emitEvent will generate a NEW eventId 
    // to preserve individual processing logs, OR we could update emitEvent 
    // to allow preserving the original ID if needed.
    // For SaaS correctness, we usually treat the retry as a NEW attempt but linked.
    
    // Actually, to keep it simple and safe for standard handlers, 
    // we use the original typeSpec which includes version.
    const typeSpec = `${event.eventType}@${event.version}`;
    
    await emitEvent(typeSpec, {
        actorId: event.actorId,
        targetId: event.targetId,
        payload: {
            ...event.payload,
            isReplay: true,
            originalEventId: eventId
        }
    });

    // Mark original as archived/replaced? 
    // For now, let's just log it.
};

/**
 * Automatically find and retry failed events from the last 24 hours
 */
export const retryFailedEvents = async () => {
    const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h
    const failedEvents = await SystemEvent.find({ 
        status: "failed", 
        timestamp: { $gte: timeLimit } 
    });

    console.log(`[EventReplay] Found ${failedEvents.length} failed events to retry.`);

    for (const event of failedEvents) {
        try {
            await replayEvent(event.eventId);
            // Optionally mark as "retried" so we don't spam it
            event.status = "processed"; // Or a new status "retried"
            await event.save();
        } catch (err) {
            console.error(`[EventReplay] Retry failed for ${event.eventId}:`, err.message);
        }
    }
};
