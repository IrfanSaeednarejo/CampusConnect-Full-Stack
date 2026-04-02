
let socketInstance = null;
const socketsWithListeners = new WeakSet();

const socketMiddleware = store => next => action => {
  if (action.payload && action.payload.socket) {
    const incomingSocket = action.payload.socket;
    if (incomingSocket && incomingSocket !== socketInstance) {
      socketInstance = incomingSocket;
    }
    if (socketInstance && !socketsWithListeners.has(socketInstance)) {
      setupSocketListeners(store, socketInstance);
      socketsWithListeners.add(socketInstance);
    }
  }

  return next(action);
};
function setupSocketListeners(store, socket) {
  socket.on('connected', (data) => {
    store.dispatch({
      type: 'socket/connected',
      payload: data,
    });
  });
  socket.on('user-update', (data) => {
    store.dispatch({
      type: 'user/updateUserProfile',
      payload: data,
    });
  });
  socket.on('notification', (data) => {
    store.dispatch({
      type: 'notifications/addNotification',
      payload: data,
    });
  });
  socket.on('message', (data) => {
    store.dispatch({
      type: 'chat/newMessage',
      payload: data,
    });
  });
  socket.on('event-update', (data) => {
    store.dispatch({
      type: 'events/updateEvent',
      payload: data,
    });
  });
  socket.on('society-update', (data) => {
    store.dispatch({
      type: 'societies/updateSociety',
      payload: data,
    });
  });
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    store.dispatch({
      type: 'socket/error',
      payload: error,
    });
  });
  socket.on('disconnected', () => {
    store.dispatch({
      type: 'socket/disconnected',
    });
  });
}

export default socketMiddleware;
