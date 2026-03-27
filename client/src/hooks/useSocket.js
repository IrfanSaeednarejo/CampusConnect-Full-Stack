import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket } from '../socket/socket';
import { registerChatHandlers, unregisterChatHandlers } from '../socket/handlers/chat.handler';
import { registerNotificationHandlers, unregisterNotificationHandlers } from '../socket/handlers/notification.handler';
import { selectIsAuthenticated } from '../redux/slices/authSlice';

export const useSocket = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      registeredRef.current = false;
      return;
    }

    const socket = getSocket();
    if (!socket || registeredRef.current) return;

    registerChatHandlers(socket, dispatch);
    registerNotificationHandlers(socket, dispatch);
    registeredRef.current = true;

    return () => {
      if (socket) {
        unregisterChatHandlers(socket);
        unregisterNotificationHandlers(socket);
        registeredRef.current = false;
      }
    };
  }, [isAuthenticated, dispatch]);

  return { socket: getSocket() };
};

export default useSocket;
