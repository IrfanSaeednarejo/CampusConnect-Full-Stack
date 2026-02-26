// useSocket - Custom hook for WebSocket/Socket.IO interactions
// Provides easy access to socket instance and methods from any component

import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../contexts/SocketContext.jsx';

/**
 * Hook to access socket context within the application
 * Must be used within a component wrapped by SocketProvider
 * 
 * @returns {Object} Socket context with methods: emit, on, off, disconnect
 * 
 * @example
 * function MyComponent() {
 *   const { emit, on, isConnected } = useSocket();
 *   
 *   useEffect(() => {
 *     // Listen for incoming messages
 *     on('message', (data) => {
 *       console.log('Received:', data);
 *     });
 *   }, [on]);
 *   
 *   const sendMessage = (msg) => {
 *     emit('message', msg);
 *   };
 *   
 *   return <div>{isConnected ? 'Connected' : 'Disconnected'}</div>;
 * }
 */
export function useSocket() {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error(
      'useSocket must be used within a <SocketProvider>. ' +
      'Make sure your component is wrapped with SocketProvider in App.jsx'
    );
  }
  
  return context;
}

/**
 * Hook for listening to a specific socket event
 * Automatically cleans up listener on unmount
 * 
 * @param {string} event - Event name to listen for
 * @param {function} callback - Handler function
 * @param {array} dependencies - Optional dependency array for callback updates
 * 
 * @example
 * useSocketListener('user-connected', (user) => {
 *   console.log('User connected:', user);
 * });
 */
export function useSocketListener(event, callback, dependencies = []) {
  const { on, off } = useSocket();
  
  React.useEffect(() => {
    on(event, callback);
    
    return () => {
      off(event);
    };
  }, [event, on, off, ...dependencies]);
}

export default useSocket;
