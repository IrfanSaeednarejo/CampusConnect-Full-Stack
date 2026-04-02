const apiMiddleware = store => next => action => {
  if (!action.payload || !action.payload.apiCall) {
    return next(action);
  }

  const { apiCall, onSuccess, onError } = action.payload;
  Promise.resolve(apiCall())
    .then(data => {
      if (onSuccess) {
        store.dispatch(onSuccess(data));
      }
    })
    .catch(error => {
      console.error('API middleware error:', error);
      if (onError) {
        store.dispatch(onError(error.message || 'An error occurred'));
      }
    });

  return next(action);
};

export default apiMiddleware;
