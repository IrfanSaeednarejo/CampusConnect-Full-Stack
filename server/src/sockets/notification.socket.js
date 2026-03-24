export const registerNotificationHandlers = (io, socket) => {
    // Keep modular wrapper for future Phase 8 (Notification Service)
    socket.on("notification:ack", ({ notificationId }) => {
        // Will be populated when Notification controllers are implemented
    });
};

export const emitNotification = (io, userId, payload) => {
    if (!io || !userId) return;
    io.to(`user:${userId}`).emit("notification:new", payload);
};
