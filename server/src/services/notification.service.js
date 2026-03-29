import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Notification } from "../models/notification.model.js";
import { paginate } from "../utils/paginate.js";
import { systemEvents } from "../utils/events.js";
import { EventTeam } from "../models/eventTeam.model.js";
import { emitNotification } from "../sockets/notification.socket.js";

export const getMyNotifications = async (queryParams, requestUser) => {
    const { page = 1, limit = 20, unreadOnly } = queryParams;

    const filter = { userId: requestUser._id };
    if (unreadOnly === "true") {
        filter.read = false;
    }

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

export const getUnreadCount = async (userId) => {
    return await Notification.getUnreadCount(userId);
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

export const markAllAsRead = async (userId) => {
    const result = await Notification.markAllRead(userId);
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
