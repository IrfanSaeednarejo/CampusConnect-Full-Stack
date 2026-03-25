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
        ignoredActions: ['SOCKET_CONNECTED', 'socket/connected'],
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
const CHAT_PERSIST_DEBOUNCE_MS = 500;

const persistChatState = (() => {
  let previousChatState = null;
  let debounceTimeoutId = null;

  return (state) => {
    if (typeof window === "undefined") return;

    const chatState = state.chat;

    if (chatState === previousChatState) {
      return;
    }
    previousChatState = chatState;
    if (debounceTimeoutId !== null) {
      clearTimeout(debounceTimeoutId);
    }

    debounceTimeoutId = setTimeout(() => {
      try {
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
      }
    }, CHAT_PERSIST_DEBOUNCE_MS);
  };
})();
store.subscribe(() => persistChatState(store.getState()));

export default store;
