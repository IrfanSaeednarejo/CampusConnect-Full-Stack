/**
 * Error Logger Middleware
 * 
 * Logs all Redux actions and errors
 * Useful for debugging and monitoring application state
 * 
 * In production, can send logs to external service (Sentry, LogRocket, etc.)
 */

const errorLoggerMiddleware = store => next => action => {
  try {
    return next(action);
  } catch (error) {
    // Log error to console
    console.error('Redux error:', {
      action: action.type,
      payload: action.payload,
      error: error.message,
      stack: error.stack,
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, action);
    }

    // Re-throw error so it's handled by Error Boundary
    throw error;
  }
};

export default errorLoggerMiddleware;
