import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { getSocket } from '../socket/socket';
import { registerChatHandlers, unregisterChatHandlers, injectGetState } from '../socket/handlers/chat.handler';
import { registerNotificationHandlers, unregisterNotificationHandlers } from '../socket/handlers/notification.handler';
import { selectIsAuthenticated } from '../redux/slices/authSlice';

export const useSocket = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const registeredRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      registeredRef.current = false;
      setIsConnected(false);
      return;
    }

    const socket = getSocket();
    if (!socket || registeredRef.current) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = (err) => setError(err.message);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    injectGetState(store.getState);
    registerChatHandlers(socket, dispatch);
    registerNotificationHandlers(socket, dispatch);
    registeredRef.current = true;
    setIsConnected(socket.connected);

    return () => {
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('connect_error', onConnectError);
        unregisterChatHandlers(socket);
        unregisterNotificationHandlers(socket);
        registeredRef.current = false;
      }
    };
  }, [isAuthenticated, dispatch]);

  const emit = (event, data) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  };

  return { socket: getSocket(), emit, isConnected, error };
};

export const useSocketListener = (event, callback, deps = []) => {
  const { socket } = useSocket();
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!socket) return;
    const listener = (data) => savedCallback.current(data);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, ...deps]);
};

export default useSocket;
