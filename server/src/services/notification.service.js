import { Notification } from "../models/notification.model.js";
import { systemEvents } from "../utils/events.js";
import { emitNotification } from "../sockets/notification.socket.js";

const recentNotifications = new Map();
const DEDUPLICATION_WINDOW_MS = 60 * 1000;

const cleanupCache = () => {
    const now = Date.now();
    for (const [key, timestamp] of recentNotifications.entries()) {
        if (now - timestamp > DEDUPLICATION_WINDOW_MS) {
            recentNotifications.delete(key);
        }
    }
};

setInterval(cleanupCache, DEDUPLICATION_WINDOW_MS);

export const initNotificationService = (app) => {
    systemEvents.on("notification:create", async (payload) => {
        try {
            const { userId, type, title, body, ref, refModel, actorId, priority } = payload;

            if (!userId || !type || !title) {
                console.warn("[NotificationService] Required fields missing in payload:", payload);
                return;
            }

            const dedupKey = `${userId}:${type}:${ref || "none"}`;
            const lastSent = recentNotifications.get(dedupKey);
            if (lastSent && Date.now() - lastSent < DEDUPLICATION_WINDOW_MS) {
                return;
            }
            recentNotifications.set(dedupKey, Date.now());

            const notification = await Notification.create({
                userId,
                type,
                title,
                body: body || "",
                ref: ref || undefined,
                refModel: refModel || undefined,
                actorId: actorId || undefined,
                priority: priority || "normal",
            });

            const populated = await Notification.findById(notification._id)
                .populate("actorId", "profile.displayName profile.avatar");
            const io = app.get("io");
            if (io) {
                emitNotification(io, userId, populated);
            }

        } catch (error) {
            console.error("[NotificationService] Failed to process notification:", error.message);
        }
    });
    systemEvents.on("notification:create:bulk", async (payload) => {
        try {
            const { eventId, type, title, body, ref, refModel, actorId } = payload;
            if (!eventId || !type || !title) return;

            const event = await Event.findById(eventId);
            if (!event) return;

            const userIds = event.participants.map(p => p.userId.toString());
            const notifications = userIds.map(userId => ({
                userId,
                type,
                title,
                body,
                ref,
                refModel,
                actorId,
                priority: "normal",
            }));

            await Notification.insertMany(notifications);

            const populated = await Notification.find({
                userId: { $in: userIds },
                ref: ref
            }).populate("actorId", "profile.displayName profile.avatar");

            const io = app.get("io");
            if (io) {
                populated.forEach(n => emitNotification(io, n.userId.toString(), n));
            }
        } catch (error) {
            console.error("[NotificationService] Failed to process bulk notification:", error.message);
        }
    });

    console.log("[NotificationService] Initialized and listening to systemEvents.");
};
