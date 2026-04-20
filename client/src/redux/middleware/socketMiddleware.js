
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

  socket.on('CONNECTION_REQUEST_RECEIVED', (data) => {
    store.dispatch({
      type: 'network/addPendingReceived',
      payload: data.connection,
    });
  });

  socket.on('CONNECTION_ACCEPTED', (data) => {
    store.dispatch({
      type: 'network/acceptRequestSuccess',
      payload: data.connection,
    });
    // Intelligent refresh: Update recommendations when the social graph changes
    store.dispatch({ type: 'network/fetchSuggested', payload: 10 });
  });

  socket.on('CONNECTION_REJECTED', (data) => {
    store.dispatch({
      type: 'network/removePendingSent',
      payload: data,
    });
  });

  socket.on('CONNECTION_CANCELLED', (data) => {
    store.dispatch({
      type: 'network/removePendingReceived',
      payload: data,
    });
  });

  socket.on('CONNECTION_REMOVED', (data) => {
    store.dispatch({
      type: 'network/removeConnectionState',
      payload: data,
    });
  });
  socket.on('disconnected', () => {
    store.dispatch({
      type: 'socket/disconnected',
    });
  });
}

export default socketMiddleware;
