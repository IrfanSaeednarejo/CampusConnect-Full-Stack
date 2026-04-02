// src/contexts/SocketContext.jsx
import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

export const SocketContext = createContext(null);

export function SocketProvider({ children, socketUrl = 'http://localhost:8000' }) {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // Connect when authenticated, disconnect when not
  useEffect(() => {
    if (!socketUrl || !isAuthenticated) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    try {
      const newSocket = io(socketUrl, {
        withCredentials: true,
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setError(null);
        console.log('[Socket] Connected to backend');
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log('[Socket] Disconnected:', reason);
      });

      newSocket.on('connect_error', (err) => {
        setError(err.message);
        setIsConnected(false);
        console.error('[Socket] Connection error:', err.message);
      });

      newSocket.on('error:auth', () => {
        console.warn('[Socket] Auth error — session may have expired');
        newSocket.disconnect();
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [socketUrl, isAuthenticated, token]);

  const emit = useCallback(
    (event, data, callback) => {
      if (socketRef.current && isConnected) {
        if (callback) {
          socketRef.current.emit(event, data, callback);
        } else {
          socketRef.current.emit(event, data);
        }
      }
    },
    [isConnected]
  );

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  }, []);

  const joinChat = useCallback((chatId) => {
    emit('chat:join', { chatId });
  }, [emit]);

  const leaveChat = useCallback((chatId) => {
    emit('chat:leave', { chatId });
  }, [emit]);

  const value = {
    socket,
    isConnected,
    error,
    emit,
    on,
    off,
    disconnect,
    joinChat,
    leaveChat
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
