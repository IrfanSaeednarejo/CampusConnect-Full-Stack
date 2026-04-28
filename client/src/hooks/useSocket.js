import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { getSocket } from '../socket/socket';
import { registerChatHandlers, unregisterChatHandlers, injectGetState } from '../socket/handlers/chat.handler';
import { registerNotificationHandlers, unregisterNotificationHandlers } from '../socket/handlers/notification.handler';
import { selectIsAuthenticated, logout } from '../redux/slices/authSlice';

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
    if (!socket) return;
    
    // GUARD: Only register global handlers once per socket instance
    if (!socket._handlersRegistered) {
      injectGetState(store.getState);
      registerChatHandlers(socket, dispatch);
      registerNotificationHandlers(socket, dispatch);
      socket._handlersRegistered = true;
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = (err) => setError(err.message);

    const onForceLogout = (data) => {
      console.warn("[Socket] Session terminated by admin:", data?.message);
      // 1. Clear Redux State
      dispatch(logout());
      // 2. Clear Socket
      const s = getSocket();
      if (s) s.disconnect();
      // 3. Force Redirect
      setTimeout(() => {
        window.location.replace("/login?reason=terminated");
      }, 100);
    };

    const onSuspension = (data) => {
      console.error("[Socket] Account suspended by admin:", data?.reason);
      // We don't necessarily logout, just force a location change so 
      // the ProtectedRoute can handle the status check on next render
      window.location.replace("/suspended");
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('user:logout', onForceLogout);
    socket.on('user:suspension', onSuspension);

    setIsConnected(socket.connected);

    return () => {
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('connect_error', onConnectError);
        socket.off('user:logout', onForceLogout);
        socket.off('user:suspension', onSuspension);
      }
    };
  }, [isAuthenticated, dispatch, store]);

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
