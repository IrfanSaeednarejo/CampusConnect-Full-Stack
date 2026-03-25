import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Notification } from "../models/notification.model.js";
import { paginate } from "../utils/paginate.js";

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
