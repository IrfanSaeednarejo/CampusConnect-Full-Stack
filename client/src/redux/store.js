import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import apiMiddleware from './middleware/apiMiddleware';
import errorLoggerMiddleware from './middleware/errorLoggerMiddleware';
import { injectStore } from '../api/axios';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['SOCKET_CONNECTED', 'socket/connected'],
        ignoredActionPaths: ['payload.socket', 'meta.arg', 'payload.headers'],
        ignoredPaths: ['socket'],
      },
    })
      .concat(apiMiddleware)
      .concat(errorLoggerMiddleware),
  devTools: import.meta.env.MODE !== 'production',
});

injectStore(store);

export default store;
