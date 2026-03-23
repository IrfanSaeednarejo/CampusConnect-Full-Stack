import { createSlice } from "@reduxjs/toolkit";
import chatMock from "../../data/ChatMock.json";

const CHAT_STORAGE_KEY = "chatState";

const loadPersistedState = () => {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(CHAT_STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
};

const buildUnreadMap = (conversations) =>
	conversations.reduce((acc, conversation) => {
		acc[conversation.id] = conversation.unread || 0;
		return acc;
	}, {});

const buildLastSeenMap = (conversations) =>
	conversations.reduce((acc, conversation) => {
		if (conversation.status !== "online") {
			acc[conversation.id] = conversation.lastSeen || conversation.timestamp || null;
		}
		return acc;
	}, {});

const persisted = loadPersistedState();
const mockUsers = (chatMock.mockUsers || []).map((user) => ({
	...user,
	type: "user",
	lastSeen: user.lastSeen || user.timestamp || null,
}));

const initialState = {
	directConversations: mockUsers,
	messagesByConversation: persisted?.messagesByConversation || chatMock.mockMessages || {},
	unreadByConversation: persisted?.unreadByConversation || buildUnreadMap(mockUsers),
	selectedConversationId: persisted?.selectedConversationId || null,
	pinnedConversations: persisted?.pinnedConversations || [],
	archivedConversations: persisted?.archivedConversations || [],
	mutedConversations: persisted?.mutedConversations || [],
	draftsByConversation: persisted?.draftsByConversation || {},
	searchByConversation: persisted?.searchByConversation || {},
	typingByConversation: {},
	hiddenMessagesByConversation: persisted?.hiddenMessagesByConversation || {},
	forwardingMessage: null,
	lastSeenByConversation: persisted?.lastSeenByConversation || buildLastSeenMap(mockUsers),
	connection: {
		isConnected: false,
		error: null,
		lastConnectedAt: null,
	},
};

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		setSelectedConversation: (state, action) => {
			const conversationId = action.payload;
			state.selectedConversationId = conversationId;
			if (conversationId) {
				state.unreadByConversation[conversationId] = 0;
			}
		},
		closeConversation: (state) => {
			state.selectedConversationId = null;
		},
		sendMessage: (state, action) => {
			const { conversationId, message } = action.payload;
			if (!conversationId || !message) return;
			if (!state.messagesByConversation[conversationId]) {
				state.messagesByConversation[conversationId] = [];
			}
			state.messagesByConversation[conversationId].push(message);
		},
		newMessage: (state, action) => {
			const { conversationId, message } = action.payload;
			if (!conversationId || !message) return;
			if (!state.messagesByConversation[conversationId]) {
				state.messagesByConversation[conversationId] = [];
			}

			const isActive = conversationId === state.selectedConversationId;
			const status = message.status || (isActive ? "read" : "delivered");
			state.messagesByConversation[conversationId].push({
				...message,
				status,
			});

			if (!isActive) {
				state.unreadByConversation[conversationId] =
					(state.unreadByConversation[conversationId] || 0) + 1;
			}
		},
		setDraft: (state, action) => {
			const { conversationId, text } = action.payload;
			if (!conversationId) return;
			const draft = state.draftsByConversation[conversationId] || {
				text: "",
				replyToId: null,
				editingMessageId: null,
			};
			state.draftsByConversation[conversationId] = {
				...draft,
				text,
			};
		},
		setReplyTo: (state, action) => {
			const { conversationId, messageId } = action.payload;
			if (!conversationId) return;
			const draft = state.draftsByConversation[conversationId] || {
				text: "",
				replyToId: null,
				editingMessageId: null,
			};
			state.draftsByConversation[conversationId] = {
				...draft,
				replyToId: messageId,
			};
		},
		clearReplyTo: (state, action) => {
			const { conversationId } = action.payload;
			if (!conversationId) return;
			const draft = state.draftsByConversation[conversationId];
			if (draft) {
				draft.replyToId = null;
			}
		},
		setEditingMessage: (state, action) => {
			const { conversationId, messageId } = action.payload;
			if (!conversationId) return;
			const draft = state.draftsByConversation[conversationId] || {
				text: "",
				replyToId: null,
				editingMessageId: null,
			};
			state.draftsByConversation[conversationId] = {
				...draft,
				editingMessageId: messageId,
			};
		},
		clearEditingMessage: (state, action) => {
			const { conversationId } = action.payload;
			if (!conversationId) return;
			const draft = state.draftsByConversation[conversationId];
			if (draft) {
				draft.editingMessageId = null;
			}
		},
		applyEditMessage: (state, action) => {
			const { conversationId, messageId, text } = action.payload;
			const messages = state.messagesByConversation[conversationId] || [];
			const message = messages.find((msg) => msg.id === messageId);
			if (message) {
				message.text = text;
				message.edited = true;
			}
		},
		deleteMessageForMe: (state, action) => {
			const { conversationId, messageId } = action.payload;
			if (!conversationId) return;
			if (!state.hiddenMessagesByConversation[conversationId]) {
				state.hiddenMessagesByConversation[conversationId] = [];
			}
			state.hiddenMessagesByConversation[conversationId].push(messageId);
		},
		deleteMessageForAll: (state, action) => {
			const { conversationId, messageId } = action.payload;
			const messages = state.messagesByConversation[conversationId] || [];
			const message = messages.find((msg) => msg.id === messageId);
			if (message) {
				message.text = "This message was deleted";
				message.deleted = true;
				message.reactions = {};
			}
		},
		toggleReaction: (state, action) => {
			const { conversationId, messageId, emoji, userId } = action.payload;
			const messages = state.messagesByConversation[conversationId] || [];
			const message = messages.find((msg) => msg.id === messageId);
			if (!message) return;
			if (!message.reactions) {
				message.reactions = {};
			}
			const current = message.reactions[emoji] || [];
			if (current.includes(userId)) {
				message.reactions[emoji] = current.filter((id) => id !== userId);
				if (message.reactions[emoji].length === 0) {
					delete message.reactions[emoji];
				}
			} else {
				message.reactions[emoji] = [...current, userId];
			}
		},
		togglePinConversation: (state, action) => {
			const { conversationId } = action.payload;
			if (!conversationId) return;
			if (state.pinnedConversations.includes(conversationId)) {
				state.pinnedConversations = state.pinnedConversations.filter(
					(id) => id !== conversationId
				);
			} else {
				state.pinnedConversations.push(conversationId);
			}
		},
		toggleArchiveConversation: (state, action) => {
			const { conversationId } = action.payload;
			if (!conversationId) return;
			if (state.archivedConversations.includes(conversationId)) {
				state.archivedConversations = state.archivedConversations.filter(
					(id) => id !== conversationId
				);
			} else {
				state.archivedConversations.push(conversationId);
			}
		},
		toggleMuteConversation: (state, action) => {
			const { conversationId } = action.payload;
			if (!conversationId) return;
			if (state.mutedConversations.includes(conversationId)) {
				state.mutedConversations = state.mutedConversations.filter(
					(id) => id !== conversationId
				);
			} else {
				state.mutedConversations.push(conversationId);
			}
		},
		clearConversation: (state, action) => {
			const { conversationId } = action.payload;
			if (!conversationId) return;
			state.messagesByConversation[conversationId] = [];
			state.hiddenMessagesByConversation[conversationId] = [];
		},
		setSearchQuery: (state, action) => {
			const { conversationId, query } = action.payload;
			if (!conversationId) return;
			state.searchByConversation[conversationId] = query;
		},
		setTypingStatus: (state, action) => {
			const { conversationId, isTyping, userName } = action.payload;
			if (!conversationId) return;
			state.typingByConversation[conversationId] = {
				isTyping,
				userName,
			};
		},
		setForwardingMessage: (state, action) => {
			state.forwardingMessage = action.payload;
		},
		clearForwardingMessage: (state) => {
			state.forwardingMessage = null;
		},
		forwardMessageToConversation: (state, action) => {
			const { conversationId, message } = action.payload;
			if (!conversationId || !message) return;
			if (!state.messagesByConversation[conversationId]) {
				state.messagesByConversation[conversationId] = [];
			}
			state.messagesByConversation[conversationId].push({
				...message,
				id: `fwd-${Date.now()}`,
				forwarded: true,
				status: "sent",
			});
		},
		setConversationMessages: (state, action) => {
			const { conversationId, messages } = action.payload;
			if (!conversationId) return;
			state.messagesByConversation[conversationId] = messages || [];
		},
		updateMessageStatus: (state, action) => {
			const { conversationId, messageId, status } = action.payload;
			const messages = state.messagesByConversation[conversationId] || [];
			const message = messages.find((msg) => msg.id === messageId);
			if (message) {
				message.status = status;
			}
		},
		markMessageFailed: (state, action) => {
			const { conversationId, messageId } = action.payload;
			const messages = state.messagesByConversation[conversationId] || [];
			const message = messages.find((msg) => msg.id === messageId);
			if (message) {
				message.status = "failed";
			}
		},
		syncPendingMessages: (state) => {
			Object.values(state.messagesByConversation).forEach((messages) => {
				messages.forEach((message) => {
					if (message.senderId === "current" && message.status === "sent") {
						message.status = "delivered";
					}
				});
			});
		},
		retryMessage: (state, action) => {
			const { conversationId, messageId } = action.payload;
			const messages = state.messagesByConversation[conversationId] || [];
			const message = messages.find((msg) => msg.id === messageId);
			if (message) {
				message.status = "sent";
			}
		},
		setConnectionStatus: (state, action) => {
			const { isConnected, error } = action.payload || {};
			state.connection.isConnected = !!isConnected;
			state.connection.error = error || null;
			if (isConnected) {
				state.connection.lastConnectedAt = new Date().toISOString();
			}
		},
	},
});

export const {
	setSelectedConversation,
	sendMessage,
	newMessage,
	setDraft,
	setReplyTo,
	clearReplyTo,
	setEditingMessage,
	clearEditingMessage,
	applyEditMessage,
	deleteMessageForMe,
	deleteMessageForAll,
	toggleReaction,
	togglePinConversation,
	toggleArchiveConversation,
	toggleMuteConversation,
	clearConversation,
	closeConversation,
	setSearchQuery,
	setTypingStatus,
	setForwardingMessage,
	clearForwardingMessage,
	forwardMessageToConversation,
	setConversationMessages,
	updateMessageStatus,
	markMessageFailed,
	syncPendingMessages,
	retryMessage,
	setConnectionStatus,
} = chatSlice.actions;

export const selectDirectConversations = (state) => state.chat.directConversations;
export const selectDirectConversationById = (conversationId) => (state) =>
	state.chat.directConversations.find((conversation) => conversation.id === conversationId);
export const selectMessagesByConversation = (state) => state.chat.messagesByConversation;
export const selectUnreadByConversation = (state) => state.chat.unreadByConversation;
export const selectSelectedConversationId = (state) => state.chat.selectedConversationId;
export const selectPinnedConversations = (state) => state.chat.pinnedConversations;
export const selectArchivedConversations = (state) => state.chat.archivedConversations;
export const selectMutedConversations = (state) => state.chat.mutedConversations;
export const selectDraftsByConversation = (state) => state.chat.draftsByConversation;
export const selectSearchByConversation = (state) => state.chat.searchByConversation;
export const selectTypingByConversation = (state) => state.chat.typingByConversation;
export const selectHiddenMessagesByConversation = (state) => state.chat.hiddenMessagesByConversation;
export const selectForwardingMessage = (state) => state.chat.forwardingMessage;
export const selectLastSeenByConversation = (state) => state.chat.lastSeenByConversation;
export const selectChatConnection = (state) => state.chat.connection;

export default chatSlice.reducer;
