import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMentoringSessions, bookSession as bookMentorSessionApi, cancelSession as cancelSessionApi, submitSessionFeedback as submitFeedbackApi } from '../../api/mentoringApi';

export const fetchSessions = createAsyncThunk('sessions/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await getMentoringSessions();
    const docs = response.data?.docs || (Array.isArray(response.data) ? response.data : []);
    
    // Map and flatten for UI consumption
    return docs.map(s => ({
      ...s,
      mentorName: s.mentorId?.userId?.profile?.displayName || "Mentor",
      mentorAvatar: s.mentorId?.userId?.profile?.avatar || "",
      mentorTitle: s.mentorId?.tier || "Peer Mentor",
      mentorCompany: "CampusConnect", // Default or extract if available
      date: s.startAt ? new Date(s.startAt).toLocaleDateString([], { dateStyle: 'medium' }) : "TBD",
      time: s.startAt ? new Date(s.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD",
    }));
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch sessions');
  }
});

export const bookMentorSession = createAsyncThunk('sessions/book', async ({ mentorId, sessionData }, { rejectWithValue }) => {
  try {
    const response = await bookMentorSessionApi(mentorId, sessionData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to book session');
  }
});

export const cancelSession = createAsyncThunk('sessions/cancel', async (sessionId, { rejectWithValue }) => {
  try {
    await cancelSessionApi(sessionId);
    return sessionId;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to cancel session');
  }
});

export const submitSessionFeedback = createAsyncThunk('sessions/feedback', async ({ sessionId, feedbackText, rating }, { rejectWithValue }) => {
  try {
    const response = await submitFeedbackApi(sessionId, { comment: feedbackText, rating: rating || 5 });
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to submit feedback');
  }
});

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    actionLoading: {},
  },
  reducers: {
    addSessionLocally: (state, action) => {
      // Allows manual insertion or socket updates
      state.items.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    // fetchSessions
    builder.addCase(fetchSessions.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchSessions.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(fetchSessions.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });

    // bookMentorSession
    builder.addCase(bookMentorSession.pending, (state) => { state.status = 'loading'; })
      .addCase(bookMentorSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(bookMentorSession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // cancelSession
    builder.addCase(cancelSession.pending, (state, action) => { state.actionLoading[action.meta.arg] = true; })
      .addCase(cancelSession.fulfilled, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        // Mark as cancelled or remove based on UX. Usually mark as cancelled:
        const index = state.items.findIndex(s => s._id === action.payload);
        if (index !== -1) {
          state.items[index].status = 'cancelled';
        }
      })
      .addCase(cancelSession.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.error = action.payload;
      });

    // submitFeedback
    builder.addCase(submitSessionFeedback.pending, (state, action) => { state.actionLoading[action.meta.arg.sessionId] = true; })
      .addCase(submitSessionFeedback.fulfilled, (state, action) => {
        state.actionLoading[action.meta.arg.sessionId] = false;
        const index = state.items.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(submitSessionFeedback.rejected, (state, action) => {
        state.actionLoading[action.meta.arg.sessionId] = false;
        state.error = action.payload;
      });
  }
});

export const { addSessionLocally } = sessionsSlice.actions;
export default sessionsSlice.reducer;

// Selectors
export const selectUpcomingSessions = (state) => (state.sessions?.items || []).filter(s => ['pending', 'confirmed'].includes(s.status));
export const selectCompletedSessions = (state) => (state.sessions?.items || []).filter(s => s.status === 'completed');
export const selectSessionActionLoading = (state, sessionId) => !!state.sessions?.actionLoading?.[sessionId];
