export const registerPresenceHandlers = (io, socket, onlineUsers) => {
    const userId = socket.userId;

    io.emit("user:online", {
        userId,
        displayName: socket.user?.profile?.displayName,
    });
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit("presence:online-users", { users: onlineList });

    socket.on("presence:check", ({ targetUserId }) => {
        const isOnline = onlineUsers.has(targetUserId);
        socket.emit("presence:status", { userId: targetUserId, isOnline });
    });
};
