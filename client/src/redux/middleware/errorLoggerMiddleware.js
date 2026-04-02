
const errorLoggerMiddleware = store => next => action => {
  try {
    return next(action);
  } catch (error) {
    console.error('Redux error:', {
      action: action.type,
      payload: action.payload,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export default errorLoggerMiddleware;
