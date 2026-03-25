import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as notificationService from "../services/notification.service.js";

const getMyNotifications = asyncHandler(async (req, res) => {
    const result = await notificationService.getMyNotifications(req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

const getUnreadCount = asyncHandler(async (req, res) => {
    const unreadCount = await notificationService.getUnreadCount(req.user._id);
    return res.status(200).json(new ApiResponse(200, { unreadCount }, "Unread count fetched"));
});

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, notification, "Notification marked as read"));
});

const markAllAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user._id);
    return res.status(200).json(new ApiResponse(200, result, "All notifications marked as read"));
});

const deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, {}, "Notification deleted successfully"));
});

export {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};