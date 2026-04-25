import { systemEvents } from "../utils/events.js";
import { EventTypes } from "../utils/eventBus.js";

/**
 * Nexus Event Handlers
 *
 * Handles side effects of Nexus AI actions by listening to EventBus events
 * and emitting downstream notifications via systemEvents.
 *
 * Follows the same pattern as mentoring.handler.js and chat.handler.js.
 */
export const initNexusHandlers = (app) => {
    // ── NEXUS_NOTE_CREATED ────────────────────────────────────────────────
    systemEvents.on(EventTypes.NEXUS_NOTE_CREATED, async (event) => {
        try {
            const { actorId, payload } = event;
            if (!actorId || !payload?.noteId) return;

            systemEvents.emit("notification:create", {
                userId: actorId,
                type: "nexus_action",
                title: "📝 Note Saved by Nexus",
                body: `Your note "${payload.title}" has been created and saved.`,
                ref: payload.noteId,
                refModel: "NexusConversation",
                priority: "low",
            });
        } catch (err) {
            console.error("[NexusHandler] NEXUS_NOTE_CREATED error:", err.message);
        }
    });

    // ── NEXUS_TASK_CREATED ────────────────────────────────────────────────
    systemEvents.on(EventTypes.NEXUS_TASK_CREATED, async (event) => {
        try {
            const { actorId, payload } = event;
            if (!actorId || !payload?.taskId) return;

            // Only notify if task was created by AI (source === "ai")
            // Manual task creation doesn't need a notification
            if (payload.source !== "ai") return;

            systemEvents.emit("notification:create", {
                userId: actorId,
                type: "task_created",
                title: "✅ Task Created by Nexus",
                body: `Task "${payload.title}" has been added to your task list.`,
                ref: payload.taskId,
                refModel: "Task",
                priority: "normal",
            });
        } catch (err) {
            console.error("[NexusHandler] NEXUS_TASK_CREATED error:", err.message);
        }
    });

    // ── NEXUS_ACTION_COMPLETED ────────────────────────────────────────────
    // Reserved for future socket-push to the Nexus panel
    systemEvents.on(EventTypes.NEXUS_ACTION_COMPLETED, async (event) => {
        try {
            const io = app.get("io");
            if (!io || !event?.actorId) return;

            // Future: push real-time update to Nexus panel via socket
            // io.to(event.actorId.toString()).emit("nexus:action_completed", event.payload);
        } catch (err) {
            console.error("[NexusHandler] NEXUS_ACTION_COMPLETED error:", err.message);
        }
    });

    console.info("[NexusHandler] Initialized — listening for Nexus events.");
};
