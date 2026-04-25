import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as nexusApi from '../../api/nexusApi';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const sendMessageThunk = createAsyncThunk(
    'nexus/sendMessage',
    async ({ message, conversationId }, { rejectWithValue }) => {
        try {
            const { data } = await nexusApi.sendMessage({ message, conversationId });
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchConversationsThunk = createAsyncThunk(
    'nexus/fetchConversations',
    async (params, { rejectWithValue }) => {
        try {
            const { data } = await nexusApi.getConversations(params);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchConversationThunk = createAsyncThunk(
    'nexus/fetchConversation',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await nexusApi.getConversation(id);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const startConversationThunk = createAsyncThunk(
    'nexus/startConversation',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await nexusApi.startConversation();
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const deleteConversationThunk = createAsyncThunk(
    'nexus/deleteConversation',
    async (id, { rejectWithValue }) => {
        try {
            await nexusApi.deleteConversation(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchActionLogThunk = createAsyncThunk(
    'nexus/fetchActionLog',
    async (params, { rejectWithValue }) => {
        try {
            const { data } = await nexusApi.getActionLog(params);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
    conversations: [],          // List of conversation stubs (title, id, date)
    activeConversationId: null,
    activeMessages: [],         // Full messages of the active conversation
    isStreaming: false,         // AI is generating a response
    actionLog: [],
    loading: false,
    conversationsLoading: false,
    error: null,
};

const nexusSlice = createSlice({
    name: 'nexus',
    initialState,
    reducers: {
        setActiveConversation(state, action) {
            state.activeConversationId = action.payload;
        },
        clearActiveConversation(state) {
            state.activeConversationId = null;
            state.activeMessages = [];
        },
        clearError(state) {
            state.error = null;
        },
        // Optimistically add user message before API responds
        addOptimisticUserMessage(state, action) {
            state.activeMessages.push({
                _id: `optimistic-${Date.now()}`,
                role: 'user',
                content: action.payload,
                timestamp: new Date().toISOString(),
            });
        },
    },
    extraReducers: (builder) => {
        // ── sendMessage ───────────────────────────────────────────────────
        builder
            .addCase(sendMessageThunk.pending, (state) => {
                state.isStreaming = true;
                state.error = null;
            })
            .addCase(sendMessageThunk.fulfilled, (state, action) => {
                state.isStreaming = false;
                const { reply, intent, actionTaken, conversationId, messageId } = action.payload;

                // Update active conversation ID if new
                if (!state.activeConversationId) {
                    state.activeConversationId = conversationId;
                }

                // Push the AI reply into the active messages
                state.activeMessages.push({
                    _id: messageId || `model-${Date.now()}`,
                    role: 'model',
                    content: reply,
                    intent: intent || null,
                    actionTaken: actionTaken || null,
                    timestamp: new Date().toISOString(),
                });
            })
            .addCase(sendMessageThunk.rejected, (state, action) => {
                state.isStreaming = false;
                state.error = action.payload;
            });

        // ── fetchConversations ────────────────────────────────────────────
        builder
            .addCase(fetchConversationsThunk.pending, (state) => {
                state.conversationsLoading = true;
            })
            .addCase(fetchConversationsThunk.fulfilled, (state, action) => {
                state.conversationsLoading = false;
                state.conversations = action.payload.docs || [];
            })
            .addCase(fetchConversationsThunk.rejected, (state) => {
                state.conversationsLoading = false;
            });

        // ── fetchConversation (load full history) ─────────────────────────
        builder
            .addCase(fetchConversationThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConversationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.activeConversationId = action.payload._id;
                state.activeMessages = action.payload.messages || [];
            })
            .addCase(fetchConversationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── startConversation ─────────────────────────────────────────────
        builder
            .addCase(startConversationThunk.fulfilled, (state, action) => {
                state.activeConversationId = action.payload._id;
                state.activeMessages = [];
                // Prepend to conversations list
                state.conversations.unshift({
                    _id: action.payload._id,
                    title: action.payload.title,
                    createdAt: action.payload.createdAt,
                    updatedAt: action.payload.updatedAt,
                    messageCount: 0,
                });
            });

        // ── deleteConversation ────────────────────────────────────────────
        builder
            .addCase(deleteConversationThunk.fulfilled, (state, action) => {
                state.conversations = state.conversations.filter((c) => c._id !== action.payload);
                if (state.activeConversationId === action.payload) {
                    state.activeConversationId = null;
                    state.activeMessages = [];
                }
            });

        // ── fetchActionLog ────────────────────────────────────────────────
        builder
            .addCase(fetchActionLogThunk.fulfilled, (state, action) => {
                state.actionLog = action.payload.docs || [];
            });
    },
});

export const {
    setActiveConversation,
    clearActiveConversation,
    clearError,
    addOptimisticUserMessage,
} = nexusSlice.actions;

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectConversations = (state) => state.nexus.conversations;
export const selectActiveConversationId = (state) => state.nexus.activeConversationId;
export const selectActiveMessages = (state) => state.nexus.activeMessages;
export const selectNexusStreaming = (state) => state.nexus.isStreaming;
export const selectNexusLoading = (state) => state.nexus.loading;
export const selectNexusError = (state) => state.nexus.error;
export const selectActionLog = (state) => state.nexus.actionLog;
export const selectConversationsLoading = (state) => state.nexus.conversationsLoading;

export default nexusSlice.reducer;
