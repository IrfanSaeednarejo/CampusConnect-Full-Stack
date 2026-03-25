import {
  addNotification,
  acknowledgeNotification,
  clearAllNotifications,
  setUnreadCount,
} from '../../redux/slices/notificationSlice';

export const registerNotificationHandlers = (socket, dispatch) => {
  socket.on('notification:new', (notification) => {
    dispatch(addNotification(notification));
  });

  socket.on('notification:acked', (data) => {
    dispatch(acknowledgeNotification(data.notificationId));
  });

  socket.on('notification:all_acked', () => {
    dispatch(clearAllNotifications());
  });

  socket.on('notification:sync', (data) => {
    if (typeof data.unreadCount === 'number') {
      dispatch(setUnreadCount(data.unreadCount));
    }
  });
};

export const unregisterNotificationHandlers = (socket) => {
  const events = [
    'notification:new', 'notification:acked',
    'notification:all_acked', 'notification:sync',
  ];
  events.forEach((e) => socket.off(e));
};
