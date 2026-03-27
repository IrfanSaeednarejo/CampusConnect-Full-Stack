import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsReadThunk,
  markAllReadThunk,
  selectNotifications,
  selectUnreadCount,
  selectNotificationLoading,
} from '../redux/slices/notificationSlice';
import { getSocket } from '../socket/socket';
export const useNotifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationLoading);

  const loadNotifications = useCallback(
    (params = {}) => dispatch(fetchNotifications(params)),
    [dispatch]
  );

  const loadUnreadCount = useCallback(
    () => dispatch(fetchUnreadCount()),
    [dispatch]
  );

  const markRead = useCallback(
    (id) => {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('notification:ack', { notificationId: id });
      }
      dispatch(markAsReadThunk(id));
    },
    [dispatch]
  );

  const markAllRead = useCallback(
    () => {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('notification:read_all');
      }
      dispatch(markAllReadThunk());
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    loadUnreadCount,
    markRead,
    markAllRead,
  };
};

export default useNotifications;
