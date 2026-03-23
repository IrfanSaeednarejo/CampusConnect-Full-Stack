/**
 * API Middleware
 * 
 * Handles async API calls through Redux
 * Provides consistent loading/error states across the app
 * 
 * Usage:
 *   Dispatch actions that follow this pattern:
 *   {
 *     type: 'FETCH_DATA',
 *     payload: { 
 *       apiCall: async () => fetch(...),
 *       onSuccess: (data) => dispatch(successAction(data)),
 *       onError: (error) => dispatch(errorAction(error))
 *     }
 *   }
 */

const apiMiddleware = store => next => action => {
  // Only handle actions with api property
  if (!action.payload || !action.payload.apiCall) {
    return next(action);
  }

  const { apiCall, onSuccess, onError } = action.payload;

  // Call the async API function
  Promise.resolve(apiCall())
    .then(data => {
      // Success - dispatch success action
      if (onSuccess) {
        store.dispatch(onSuccess(data));
      }
    })
    .catch(error => {
      // Error - dispatch error action
      console.error('API middleware error:', error);
      if (onError) {
        store.dispatch(onError(error.message || 'An error occurred'));
      }
    });

  return next(action);
};

export default apiMiddleware;
