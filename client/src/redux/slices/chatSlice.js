import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as chatApi from "../../api/chatApi";

export const fetchChats = createAsyncThunk(
	"chat/fetchChats",
	async (_, { rejectWithValue }) => {
		try {
			const { data } = await chatApi.getMyChats();
			return data.data;
		} catch (err) {
			return rejectWithValue(err.message);
		}
	}
);

export const fetchMessages = createAsyncThunk(
	"chat/fetchMessages",
	async ({ chatId, params = {} }, { rejectWithValue }) => {
		try {
			const { data } = await chatApi.getChatMessages(chatId, params);
			return { chatId, ...data.data };
		} catch (err) {
			return rejectWithValue(err.message);
		}
	}
);

export const sendMessageThunk = createAsyncThunk(
	"chat/sendMessage",
	async ({ chatId, messageData }, { rejectWithValue }) => {
		try {
			const { data } = await chatApi.sendMessage(chatId, messageData);
			return { chatId, message: data.data };
		} catch (err) {
			return rejectWithValue(err.message);
		}
	}
);

export const editMessageThunk = createAsyncThunk(
	"chat/editMessage",
	async ({ chatId, messageId, content }, { rejectWithValue }) => {
		try {
			const { data } = await chatApi.editMessage(chatId, messageId, { content });
			return { chatId, message: data.data };
		} catch (err) {
			return rejectWithValue(err.message);
		}
	}
);

export const deleteMessageThunk = createAsyncThunk(
	"chat/deleteMessage",
	async ({ chatId, messageId }, { rejectWithValue }) => {
		try {
			await chatApi.deleteMessage(chatId, messageId);
			return { chatId, messageId };
		} catch (err) {
			return rejectWithValue(err.message);
		}
	}
);

export const toggleReactionThunk = createAsyncThunk(
	"chat/toggleReaction",
	async ({ chatId, messageId, emoji }, { rejectWithValue }) => {
		try {
			const { data } = await chatApi.toggleReaction(chatId, messageId, emoji);
			return { chatId, messageId, reactions: data.data.reactions };
		} catch (err) {
			return rejectWithValue(err.message);
		}
	}
);

export const markAsReadThunk = createAsyncThunk(
	"chat/markAsRead",
	async (chatId, { rejectWithValue }) => {
		try {
			await chatApi.markChatAsRead(chatId);
			return { chatId };
		} catch (err) {
			return rejectWithValue(err.message);
		}
	}
);

export const createOrGetDMThunk = createAsyncThunk(
	"chat/createOrGetDM",
	async (participantId, { rejectWithValue }) => {
		try {
			const { data } = await chatApi.createOrGetDM(participantId);
			return data.data;
		} catch (err) {
			return rejectWithValue(err.message);
		}
	}
);
const initialState = {
	conversations: [],
	messagesByConversation: {},
	unreadByConversation: {},
	selectedConversationId: null,
	pinnedConversations: [],
	archivedConversations: [],
	mutedConversations: [],
	draftsByConversation: {},
	typingByConversation: {},
	forwardingMessage: null,
	replyTo: null,
	editingMessage: null,
	searchQuery: "",
	searchResults: [],
	hiddenMessagesByConversation: {},
	searchByConversation: {},
	loading: { chats: false, messages: false, operation: false },
	error: null,
	connection: { isConnected: false, error: null, lastConnectedAt: null },
};

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		setSelectedConversation: (state, action) => {
			const conversationId = action.payload;
			state.selectedConversationId = conversationId;
			if (conversationId) state.unreadByConversation[conversationId] = 0;
		},
		closeConversation: (state) => {
			state.selectedConversationId = null;
		},
		newMessage: (state, action) => {
			const { conversationId, message } = action.payload;
			if (!conversationId || !message) return;
			if (!state.messagesByConversation[conversationId]) {
				state.messagesByConversation[conversationId] = [];
			}
			const exists = state.messagesByConversation[conversationId].some(
				(m) => m._id === message._id
			);
			if (!exists) {
				state.messagesByConversation[conversationId].push(message);
			}
			if (conversationId !== state.selectedConversationId) {
				state.unreadByConversation[conversationId] =
					(state.unreadByConversation[conversationId] || 0) + 1;
			}
		},
		setConversationMessages: (state, action) => {
			const { conversationId, messages } = action.payload;
			if (conversationId) state.messagesByConversation[conversationId] = messages || [];
		},
		addOptimisticMessage: (state, action) => {
			const { conversationId, message } = action.payload;
			if (!state.messagesByConversation[conversationId]) {
				state.messagesByConversation[conversationId] = [];
			}
			state.messagesByConversation[conversationId].push(message);
		},
		replaceOptimisticMessage: (state, action) => {
			const { conversationId, tempId, realMessage } = action.payload;
			const msgs = state.messagesByConversation[conversationId];
			if (msgs) {
				const idx = msgs.findIndex((m) => m._id === tempId || m.tempId === tempId);
				if (idx !== -1) {
					msgs[idx] = realMessage;
				}
			}
		},
		applyEditMessage: (state, action) => {
			const { conversationId, messageId, text } = action.payload;
			const msgs = state.messagesByConversation[conversationId] || [];
			const msg = msgs.find((m) => m._id === messageId || m.id === messageId);
			if (msg) {
				msg.content = text;
				msg.text = text;
				msg.isEdited = true;
			}
		},
		deleteMessageForAll: (state, action) => {
			const { conversationId, messageId } = action.payload;
			const msgs = state.messagesByConversation[conversationId] || [];
			const msg = msgs.find((m) => m._id === messageId || m.id === messageId);
			if (msg) {
				msg.content = "This message was deleted";
				msg.text = "This message was deleted";
				msg.deleted = true;
			}
		},
		toggleReaction: (state, action) => {
			const { conversationId, messageId, reactions, fromServer } = action.payload;
			if (fromServer && reactions) {
				const msgs = state.messagesByConversation[conversationId] || [];
				const msg = msgs.find((m) => m._id === messageId || m.id === messageId);
				if (msg) msg.reactions = reactions;
			}
		},

		updateMessageStatus: (state, action) => {
			const { conversationId, messageId, status } = action.payload;
			const msgs = state.messagesByConversation[conversationId] || [];
			const msg = msgs.find((m) => m._id === messageId || m.id === messageId);
			if (msg) msg.status = status;
		},
		markMessageFailed: (state, action) => {
			const { conversationId, messageId } = action.payload;
			const msgs = state.messagesByConversation[conversationId] || [];
			const msg = msgs.find((m) => m._id === messageId || m.id === messageId);
			if (msg) msg.status = "failed";
		},

		setTypingStatus: (state, action) => {
			const { conversationId, isTyping, userName } = action.payload;
			if (conversationId) {
				state.typingByConversation[conversationId] = { isTyping, userName };
			}
		},

		setDraft: (state, action) => {
			const { conversationId, text } = action.payload;
			if (!conversationId) return;
			state.draftsByConversation[conversationId] = {
				...(state.draftsByConversation[conversationId] || {}),
				text,
			};
		},

		togglePinConversation: (state, action) => {
			const id = action.payload.conversationId;
			if (state.pinnedConversations.includes(id)) {
				state.pinnedConversations = state.pinnedConversations.filter((i) => i !== id);
			} else {
				state.pinnedConversations.push(id);
			}
		},
		toggleMuteConversation: (state, action) => {
			const id = action.payload.conversationId;
			if (state.mutedConversations.includes(id)) {
				state.mutedConversations = state.mutedConversations.filter((i) => i !== id);
			} else {
				state.mutedConversations.push(id);
			}
		},

		setForwardingMessage: (state, action) => {
			state.forwardingMessage = action.payload;
		},
		clearForwardingMessage: (state) => {
			state.forwardingMessage = null;
		},
		setConnectionStatus: (state, action) => {
			const { isConnected, error } = action.payload || {};
			state.connection.isConnected = !!isConnected;
			state.connection.error = error || null;
			if (isConnected) state.connection.lastConnectedAt = new Date().toISOString();
		},
		setReplyTo: (state, action) => {
			state.replyTo = action.payload;
		},
		clearReplyTo: (state) => {
			state.replyTo = null;
		},
		setEditingMessage: (state, action) => {
			state.editingMessage = action.payload;
		},
		clearEditingMessage: (state) => {
			state.editingMessage = null;
		},
		deleteMessageForMe: (state, action) => {
			const { conversationId, messageId } = action.payload;
			if (state.messagesByConversation[conversationId]) {
				state.messagesByConversation[conversationId] = state.messagesByConversation[
					conversationId
				].filter((m) => m._id !== messageId && m.id !== messageId);
			}
		},
		toggleArchiveConversation: (state, action) => {
			const id = action.payload;
			if (state.archivedConversations.includes(id)) {
				state.archivedConversations = state.archivedConversations.filter((i) => i !== id);
			} else {
				state.archivedConversations.push(id);
			}
		},
		clearConversation: (state, action) => {
			const conversationId = action.payload;
			state.messagesByConversation[conversationId] = [];
		},
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload;
		},
		forwardMessageToConversation: (state, action) => {
			// This would usually trigger a thunk, but we can set the state here
			state.forwardingMessage = action.payload.message;
		},
		syncPendingMessages: (state) => {
			// Implementation for offline sync if needed
		},
		retryMessage: (state, action) => {
			// Implementation for retrying failed messages
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChats.pending, (state) => {
				state.loading.chats = true;
			})
			.addCase(fetchChats.fulfilled, (state, action) => {
				state.conversations = action.payload || [];
				state.loading.chats = false;
			})
			.addCase(fetchChats.rejected, (state, action) => {
				state.error = action.payload;
				state.loading.chats = false;
			});

		builder
			.addCase(fetchMessages.pending, (state) => {
				state.loading.messages = true;
			})
			.addCase(fetchMessages.fulfilled, (state, action) => {
				const { chatId, docs, messages } = action.payload;
				state.messagesByConversation[chatId] = docs || messages || [];
				state.loading.messages = false;
			})
			.addCase(fetchMessages.rejected, (state, action) => {
				state.error = action.payload;
				state.loading.messages = false;
			});

		builder
			.addCase(sendMessageThunk.fulfilled, (state, action) => {
				const { chatId, message } = action.payload;
				if (!state.messagesByConversation[chatId]) {
					state.messagesByConversation[chatId] = [];
				}
				const exists = state.messagesByConversation[chatId].some(
					(m) => m._id === message._id
				);
				if (!exists) {
					state.messagesByConversation[chatId].push(message);
				}
			});

		builder.addCase(createOrGetDMThunk.fulfilled, (state, action) => {
			const chat = action.payload;
			const exists = state.conversations.find((c) => c._id === chat._id);
			if (!exists) {
				state.conversations.unshift(chat);
			}
			state.selectedConversationId = chat._id;
		});

		builder.addCase(editMessageThunk.fulfilled, (state, action) => {
			const { chatId, message } = action.payload;
			const msgs = state.messagesByConversation[chatId];
			if (msgs) {
				const idx = msgs.findIndex((m) => m._id === message._id);
				if (idx !== -1) {
					msgs[idx] = message;
				}
			}
		});

		builder.addCase(deleteMessageThunk.fulfilled, (state, action) => {
			const { chatId, messageId } = action.payload;
			const msgs = state.messagesByConversation[chatId];
			if (msgs) {
				const msg = msgs.find((m) => m._id === messageId);
				if (msg) {
					msg.content = "This message was deleted";
					msg.deleted = true;
				}
			}
		});

		builder.addCase(toggleReactionThunk.fulfilled, (state, action) => {
			const { chatId, messageId, reactions } = action.payload;
			const msgs = state.messagesByConversation[chatId];
			if (msgs) {
				const msg = msgs.find((m) => m._id === messageId);
				if (msg) {
					msg.reactions = reactions;
				}
			}
		});

		builder.addCase(markAsReadThunk.fulfilled, (state, action) => {
			const { chatId } = action.payload;
			state.unreadByConversation[chatId] = 0;
			const chat = state.conversations.find((c) => c._id === chatId);
			if (chat) chat.unreadCount = 0;
		});
	},
});

export const {
	setSelectedConversation,
	closeConversation,
	newMessage,
	setConversationMessages,
	addOptimisticMessage,
	replaceOptimisticMessage,
	applyEditMessage,
	deleteMessageForAll,
	toggleReaction,
	updateMessageStatus,
	markMessageFailed,
	setTypingStatus,
	setDraft,
	togglePinConversation,
	toggleMuteConversation,
	setForwardingMessage,
	clearForwardingMessage,
	setConnectionStatus,
	setReplyTo,
	clearReplyTo,
	setEditingMessage,
	clearEditingMessage,
	deleteMessageForMe,
	toggleArchiveConversation,
	clearConversation,
	setSearchQuery,
	forwardMessageToConversation,
	syncPendingMessages,
	retryMessage,
} = chatSlice.actions;

export const selectConversations = (state) => state.chat.conversations;
export const selectMessagesByConversation = (state) => state.chat.messagesByConversation;
export const selectUnreadByConversation = (state) => state.chat.unreadByConversation;
export const selectSelectedConversationId = (state) => state.chat.selectedConversationId;
export const selectTypingByConversation = (state) => state.chat.typingByConversation;
export const selectChatLoading = (state) => state.chat.loading;
export const selectChatConnection = (state) => state.chat.connection;
export const selectDirectConversations = (state) => state.chat.conversations;
export const selectDirectConversationById = (id) => (state) =>
	state.chat.conversations.find((c) => c.id === id);
export const selectPinnedConversations = (state) => state.chat.pinnedConversations || [];
export const selectArchivedConversations = (state) => state.chat.archivedConversations || [];
export const selectMutedConversations = (state) => state.chat.mutedConversations || [];
export const selectDraftsByConversation = (state) => state.chat.draftsByConversation || {};
export const selectSearchQuery = (state) => state.chat.searchQuery;
export const selectSearchResults = (state) => state.chat.searchResults;
export const selectReplyTo = (state) => state.chat.replyTo;
export const selectEditingMessage = (state) => state.chat.editingMessage;
export const selectForwardingMessage = (state) => state.chat.forwardingMessage;
export const selectHiddenMessagesByConversation = (state) => state.chat.hiddenMessagesByConversation || {};
export const selectSearchByConversation = (state) => state.chat.searchByConversation || {};
export const selectLastSeenByConversation = (state) => state.chat.lastSeenByConversation || {};

export const sendMessage = sendMessageThunk;
export const createOrGetDM = createOrGetDMThunk;
export const editMessage = editMessageThunk;
export const deleteMessage = deleteMessageThunk;
export const toggleReactionThunkAction = toggleReactionThunk;
export const markAsRead = markAsReadThunk;

export default chatSlice.reducer;
