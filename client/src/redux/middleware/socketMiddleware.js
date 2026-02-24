/**
 * Socket Middleware
 * 
 * Handles WebSocket/Socket.IO events and syncs with Redux
 * Listens for socket events and dispatches corresponding Redux actions
 * 
 * Usage:
 * 1. Socket events automatically dispatch corresponding Redux actions
 * 2. Format: socket message "user-update" -> dispatch action "socket/userUpdate"
 * 
 * Supported events:
 * - connection: User connected
 * - user-update: User profile updated
 * - notification: New notification
 * - message: New chat message
 * - event-update: Event information changed
 * - society-update: Society information changed
 */

let socketInstance = null;

const socketMiddleware = store => next => action => {
  // Store socket instance when it's provided
  if (action.payload && action.payload.socket) {
    socketInstance = action.payload.socket;
    
    // Set up listeners for socket events
    if (socketInstance) {
      setupSocketListeners(store, socketInstance);
    }
  }

  return next(action);
};

/**
 * Set up listeners for common socket events
 * These should map to your Redux actions
 */
function setupSocketListeners(store, socket) {
  // Connection events
  socket.on('connected', (data) => {
    store.dispatch({
      type: 'socket/connected',
      payload: data,
    });
  });

  // User events
  socket.on('user-update', (data) => {
    store.dispatch({
      type: 'user/updateUser',
      payload: data,
    });
  });

  // Notification events
  socket.on('notification', (data) => {
    store.dispatch({
      type: 'notifications/addNotification',
      payload: data,
    });
  });

  // Chat message events
  socket.on('message', (data) => {
    store.dispatch({
      type: 'chat/newMessage',
      payload: data,
    });
  });

  // Event updates
  socket.on('event-update', (data) => {
    store.dispatch({
      type: 'events/updateEvent',
      payload: data,
    });
  });

  // Society updates
  socket.on('society-update', (data) => {
    store.dispatch({
      type: 'societies/updateSociety',
      payload: data,
    });
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    store.dispatch({
      type: 'socket/error',
      payload: error,
    });
  });

  // Disconnection
  socket.on('disconnected', () => {
    store.dispatch({
      type: 'socket/disconnected',
    });
  });
}

export default socketMiddleware;
