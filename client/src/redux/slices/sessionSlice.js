import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as mentoringApi from "../../api/mentoringApi";

export const fetchSessionDetails = createAsyncThunk(
  "session/fetchDetails",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.getSessionByBookingId(bookingId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch session details");
    }
  }
);

export const fetchSessionMessages = createAsyncThunk(
  "session/fetchMessages",
  async ({ roomId, params = {} }, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.getSessionMessages(roomId, params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch messages");
    }
  }
);

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    activeSession: null,
    messages: [],
    loading: false,
    messagesLoading: false,
    error: null,
    hasMoreMessages: false,
    pagination: {
        page: 1,
        limit: 50,
        total: 0
    }
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateUserTyping: (state, action) => {
        // We could keep track of who is typing here
    },
    clearSession: (state) => {
      state.activeSession = null;
      state.messages = [];
      state.error = null;
    },
    setSessionEnded: (state) => {
        if (state.activeSession) {
            state.activeSession.status = "ended";
        }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = action.payload;
      })
      .addCase(fetchSessionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSessionMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchSessionMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload.docs || [];
        state.hasMoreMessages = action.payload.hasNextPage;
        state.pagination = {
            page: action.payload.page,
            limit: action.payload.limit,
            total: action.payload.totalDocs
        };
      })
      .addCase(fetchSessionMessages.rejected, (state, action) => {
        state.messagesLoading = false;
      });
  },
});

export const { addMessage, clearSession, setSessionEnded } = sessionSlice.actions;

export const selectActiveSession = (state) => state.session.activeSession;
export const selectSessionMessages = (state) => state.session.messages;
export const selectSessionLoading = (state) => state.session.loading;
export const selectSessionError = (state) => state.session.error;

export default sessionSlice.reducer;
