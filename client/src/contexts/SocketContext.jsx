// src/contexts/SocketContext.js
// Socket Context - manages WebSocket connection and real-time data

import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';

export const SocketContext = createContext(null);

export function SocketProvider({ children, socketUrl }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [listeners, setListeners] = useState({});
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!socketUrl) return;

    const connectSocket = () => {
      try {
        // For demo purposes, we'll simulate socket connection
        // In production, use actual WebSocket or Socket.IO
        const mockSocket = {
          connected: true,
          emit: (event, data) => {
            // Mock emit
          },
          on: (event, callback) => {
            setListeners((prev) => ({
              ...prev,
              [event]: callback,
            }));
          },
          off: (event) => {
            setListeners((prev) => {
              const updated = { ...prev };
              delete updated[event];
              return updated;
            });
          },
          disconnect: () => {
            setIsConnected(false);
          },
        };

        socketRef.current = mockSocket;
        setSocket(mockSocket);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err.message);
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [socketUrl]);

  const emit = useCallback(
    (event, data) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit(event, data);
      }
    },
    [isConnected]
  );

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  }, []);

  const value = {
    socket,
    isConnected,
    error,
    listeners,
    emit,
    on,
    off,
    disconnect,
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
