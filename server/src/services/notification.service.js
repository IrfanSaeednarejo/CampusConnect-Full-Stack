import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Notification } from "../models/notification.model.js";
import { paginate } from "../utils/paginate.js";
import { systemEvents } from "../utils/events.js";
import { EventTeam } from "../models/eventTeam.model.js";
import { emitNotification } from "../sockets/notification.socket.js";

const ADMIN_NOTIFICATION_TYPES = ["admin", "system"];

const isAdminUser = (user) =>
    Array.isArray(user?.roles) &&
    user.roles.some((role) => ["admin", "super_admin", "campus_admin", "read_only_admin"].includes(role));

const buildNotificationFilter = (queryParams, requestUser) => {
    const { unreadOnly, scope } = queryParams;

    const filter = { userId: requestUser._id };
    if (unreadOnly === "true") {
        filter.read = false;
    }

    if (scope === "admin" && isAdminUser(requestUser)) {
        filter.type = { $in: ADMIN_NOTIFICATION_TYPES };
    }

    return filter;
};

export const getMyNotifications = async (queryParams, requestUser) => {
    const { page = 1, limit = 20 } = queryParams;
    const filter = buildNotificationFilter(queryParams, requestUser);

    return await paginate(Notification, filter, {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: [
            {
                path: "actorId",
                select: "profile.displayName profile.avatar",
            },
        ],
    });
};

export const getUnreadCount = async (requestUser, queryParams = {}) => {
    const filter = buildNotificationFilter(queryParams, requestUser);
    return await Notification.countDocuments({ ...filter, read: false });
};

export const markAsRead = async (notificationId, userId) => {
    if (!mongoose.isValidObjectId(notificationId)) {
        throw new ApiError(400, "Invalid notification ID format");
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { $set: { read: true, readAt: new Date() } },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return notification;
};

export const markAllAsRead = async (requestUser, queryParams = {}) => {
    const filter = buildNotificationFilter(queryParams, requestUser);
    const result = await Notification.updateMany(
        { ...filter, read: false },
        { $set: { read: true, readAt: new Date() } }
    );
    return { modifiedCount: result.modifiedCount };
};

export const deleteNotification = async (notificationId, userId) => {
    if (!mongoose.isValidObjectId(notificationId)) {
        throw new ApiError(400, "Invalid notification ID format");
    }

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return true;
};

export const initNotificationService = (app) => {
    systemEvents.on("notification:create:bulk", async (data) => {
        try {
            const { eventId, type, title, body, ref, refModel, actorId } = data;
            const teams = await EventTeam.find({ eventId, status: { $in: ["forming", "registered"] } }).select("members.userId");
            const userIds = [...new Set(teams.flatMap(t => t.members.map(m => m.userId.toString())))];

            if (userIds.length === 0) return;

            const notifications = userIds.map(userId => ({
                userId, type, title, body, ref, refModel, actorId
            }));

            const created = await Notification.insertMany(notifications);
            const io = app.get("io");
            if (io) {
                created.forEach(notif => {
                    emitNotification(io, notif.userId, notif);
                });
            }
        } catch (error) {
            console.error("[Notification Service] Bulk create error:", error.message);
        }
    });

    systemEvents.on("notification:create", async (data) => {
        try {
            const { userId, type, ref, actorId, title, body, refModel, priority } = data;
            
            // Deduplication Check
            if (ref) {
                // If the exact same unread notification exists for this user/ref/type within the last 15 minutes, skip it or update it.
                // Note: For chat messages, we skip dedup here because Chat handles its own idempotency and we want every message notifying generally if they are truly distinct, 
                // but actually for chat messages we might want to just update the existing unread "New Message" notification instead of blasting 50.
                
                const timeLimit = new Date(Date.now() - 15 * 60 * 1000); // 15 mins
                const query = {
                    userId,
                    type,
                    ref,
                    read: false,
                    createdAt: { $gte: timeLimit }
                };
                
                if (actorId) query.actorId = actorId;

                const existingNotification = await Notification.findOne(query);

                if (existingNotification) {
                    // Update timestamp and body of existing instead of creating new
                    existingNotification.body = body || existingNotification.body;
                    existingNotification.createdAt = new Date();
                    await existingNotification.save();
                    
                    // We still emit the updated notification so the frontend bumps it to the top
                    const io = app.get("io");
                    if (io) {
                        emitNotification(io, existingNotification.userId, existingNotification);
                    }
                    return;
                }
            }

            const n = await Notification.create(data);
            const io = app.get("io");
            if (io) {
                emitNotification(io, n.userId, n);
            }
        } catch (error) {
            console.error("[Notification Service] Single create error:", error.message);
        }
    });

    console.info("[Notification Service] Initialized — listening for systemEvents");
};
