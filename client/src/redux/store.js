import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import apiMiddleware from './middleware/apiMiddleware';
import socketMiddleware from './middleware/socketMiddleware';
import errorLoggerMiddleware from './middleware/errorLoggerMiddleware';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket instance in payload (not serializable)
        ignoredActions: ['SOCKET_CONNECTED'],
        ignoredActionPaths: ['payload.socket'],
        ignoredPaths: ['socket'],
      },
    })
      .concat(apiMiddleware)
      .concat(socketMiddleware)
      .concat(errorLoggerMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

const CHAT_STORAGE_KEY = "chatState";

const persistChatState = (state) => {
  if (typeof window === "undefined") return;
  try {
    const chatState = state.chat;
    const payload = {
      selectedConversationId: chatState.selectedConversationId,
      messagesByConversation: chatState.messagesByConversation,
      unreadByConversation: chatState.unreadByConversation,
      pinnedConversations: chatState.pinnedConversations,
      archivedConversations: chatState.archivedConversations,
      mutedConversations: chatState.mutedConversations,
      draftsByConversation: chatState.draftsByConversation,
      hiddenMessagesByConversation: chatState.hiddenMessagesByConversation,
      lastSeenByConversation: chatState.lastSeenByConversation,
    };
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore persistence errors
  }
};

store.subscribe(() => persistChatState(store.getState()));

export default store;
