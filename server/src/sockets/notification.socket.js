import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";

export const registerNotificationHandlers = (io, socket) => {
    socket.on("notification:ack", async ({ notificationId }) => {
        try {
            if (!notificationId || !mongoose.isValidObjectId(notificationId)) return;
            if (!socket.userId) return;

            const updated = await Notification.findOneAndUpdate(
                { _id: notificationId, userId: socket.userId },
                { $set: { read: true, readAt: new Date() } },
                { new: true }
            );

            if (updated) {
                socket.emit("notification:acked", { notificationId: updated._id, readAt: updated.readAt });
            }
        } catch (error) {
            console.error("[Notification Socket] Failed to ack notification:", error.message);
        }
    });

    socket.on("notification:read_all", async () => {
        try {
            if (!socket.userId) return;

            await Notification.markAllRead(socket.userId);

            io.to(`user:${socket.userId}`).emit("notification:all_acked");
        } catch (error) {
            console.error("[Notification Socket] Failed to read all notifications:", error.message);
        }
    });
};
export const emitNotification = (io, userId, payload) => {
    if (!io || !userId) return;
    io.to(`user:${userId.toString()}`).emit("notification:new", payload);
};
