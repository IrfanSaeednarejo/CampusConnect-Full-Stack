import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getMentoringSessions, 
  confirmSession as confirmSessionApi, 
  completeSession as completeSessionApi,
  cancelSession as cancelSessionApi
} from '../../api/mentoringApi';

const initialState = {
  mentors: [],
  sessions: [],
  requests: [],
  selectedMentor: null,
  pendingFeedback: [],
  mentees: [],
  scheduledSessions: [],
  completedSessions: [],
  earningsData: {
    totalEarnings: 0,
    sessionCompleted: 0,
    averageRating: 0,
    pendingWithdrawal: 0,
    lastWithdrawal: null,
  },
  withdrawalHistory: [],
  sessionEarnings: [],
  loading: false,
  error: null,
};

// --- Async Thunks ---

export const fetchSessionsThunk = createAsyncThunk(
  'mentoring/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMentoringSessions();
      // response is the ApiResponse body: { success, data: { docs, pagination }, ... }
      return response.data?.docs || (Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch sessions');
    }
  }
);

export const confirmSessionThunk = createAsyncThunk(
  'mentoring/confirmSession',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await confirmSessionApi(bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to confirm session');
    }
  }
);

export const completeSessionThunk = createAsyncThunk(
  'mentoring/completeSession',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await completeSessionApi(bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to complete session');
    }
  }
);

export const cancelSessionThunk = createAsyncThunk(
  'mentoring/cancelSession',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await cancelSessionApi(bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to cancel session');
    }
  }
);

const mentoringSlice = createSlice({
  name: 'mentoring',
  initialState,
  reducers: {
    setMentors: (state, action) => {
      state.mentors = action.payload;
    },
    addMentor: (state, action) => {
      state.mentors.push(action.payload);
    },
    updateMentor: (state, action) => {
      const index = state.mentors.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.mentors[index] = { ...state.mentors[index], ...action.payload };
      }
    },
    removeMentor: (state, action) => {
      state.mentors = state.mentors.filter((m) => m.id !== action.payload);
    },
    setSelectedMentor: (state, action) => {
      state.selectedMentor = action.payload;
    },
    setSessions: (state, action) => {
      state.sessions = action.payload;
    },
    addSession: (state, action) => {
      state.sessions.push(action.payload);
    },
    updateSession: (state, action) => {
      const index = state.sessions.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = { ...state.sessions[index], ...action.payload };
      }
    },
    removeSession: (state, action) => {
      state.sessions = state.sessions.filter((s) => s.id !== action.payload);
    },
    setRequests: (state, action) => {
      state.requests = action.payload;
    },
    addRequest: (state, action) => {
      state.requests.push(action.payload);
    },
    updateRequest: (state, action) => {
      const index = state.requests.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = { ...state.requests[index], ...action.payload };
      }
    },
    removeRequest: (state, action) => {
      state.requests = state.requests.filter((r) => r.id !== action.payload);
    },
    setMentoringLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMentoringError: (state, action) => {
      state.error = action.payload;
    },
    clearMentoringError: (state) => {
      state.error = null;
    },
    // Pending Feedback actions
    setPendingFeedback: (state, action) => {
      state.pendingFeedback = action.payload;
    },
    addPendingFeedback: (state, action) => {
      state.pendingFeedback.push(action.payload);
    },
    removePendingFeedback: (state, action) => {
      state.pendingFeedback = state.pendingFeedback.filter((f) => f.id !== action.payload);
    },
    // Mentees actions
    setMentees: (state, action) => {
      state.mentees = action.payload;
    },
    addMentee: (state, action) => {
      state.mentees.push(action.payload);
    },
    updateMentee: (state, action) => {
      const index = state.mentees.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.mentees[index] = { ...state.mentees[index], ...action.payload };
      }
    },
    removeMentee: (state, action) => {
      state.mentees = state.mentees.filter((m) => m.id !== action.payload);
    },
    // Scheduled Sessions actions
    setScheduledSessions: (state, action) => {
      state.scheduledSessions = action.payload;
    },
    addScheduledSession: (state, action) => {
      state.scheduledSessions.push(action.payload);
    },
    updateScheduledSession: (state, action) => {
      const index = state.scheduledSessions.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.scheduledSessions[index] = { ...state.scheduledSessions[index], ...action.payload };
      }
    },
    removeScheduledSession: (state, action) => {
      state.scheduledSessions = state.scheduledSessions.filter((s) => s.id !== action.payload);
    },
    // Completed Sessions actions
    setCompletedSessions: (state, action) => {
      state.completedSessions = action.payload;
    },
    addCompletedSession: (state, action) => {
      state.completedSessions.push(action.payload);
    },
    // Earnings actions
    setEarningsData: (state, action) => {
      state.earningsData = action.payload;
    },
    updateEarningsData: (state, action) => {
      state.earningsData = { ...state.earningsData, ...action.payload };
    },
    setWithdrawalHistory: (state, action) => {
      state.withdrawalHistory = action.payload;
    },
    addWithdrawal: (state, action) => {
      state.withdrawalHistory.unshift(action.payload);
    },
    setSessionEarnings: (state, action) => {
      state.sessionEarnings = action.payload;
    },
    addSessionEarning: (state, action) => {
      state.sessionEarnings.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sessions
      .addCase(fetchSessionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        // The thunk now returns the array directly
        const sessions = action.payload;
        if (Array.isArray(sessions)) {
          state.scheduledSessions = sessions.filter(s => ['pending', 'confirmed'].includes(s.status));
          state.completedSessions = sessions.filter(s => s.status === 'completed');
          state.sessions = sessions;
        }
      })
      .addCase(fetchSessionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm/Complete/Cancel status updates
      .addMatcher(
        (action) => [confirmSessionThunk.fulfilled.type, completeSessionThunk.fulfilled.type, cancelSessionThunk.fulfilled.type].includes(action.type),
        (state, action) => {
          const updatedSession = action.payload;
          
          // Update in scheduledSessions
          const sIndex = state.scheduledSessions.findIndex(s => s._id === updatedSession._id);
          if (sIndex !== -1) {
            if (['pending', 'confirmed'].includes(updatedSession.status)) {
              state.scheduledSessions[sIndex] = updatedSession;
            } else {
              state.scheduledSessions.splice(sIndex, 1);
            }
          }

          // Update in completedSessions
          if (updatedSession.status === 'completed') {
            const cIndex = state.completedSessions.findIndex(s => s._id === updatedSession._id);
            if (cIndex === -1) {
              state.completedSessions.unshift(updatedSession);
            } else {
              state.completedSessions[cIndex] = updatedSession;
            }
          }
          
          // Update in main sessions list
          const mIndex = state.sessions.findIndex(s => s._id === updatedSession._id);
          if (mIndex !== -1) state.sessions[mIndex] = updatedSession;
        }
      );
  },
});

// Actions
export const {
  setMentors,
  addMentor,
  updateMentor,
  removeMentor,
  setSelectedMentor,
  setSessions,
  addSession,
  updateSession,
  removeSession,
  setRequests,
  addRequest,
  updateRequest,
  removeRequest,
  setMentoringLoading,
  setMentoringError,
  clearMentoringError,
  setPendingFeedback,
  addPendingFeedback,
  removePendingFeedback,
  setMentees,
  addMentee,
  updateMentee,
  removeMentee,
  setScheduledSessions,
  addScheduledSession,
  updateScheduledSession,
  removeScheduledSession,
  setCompletedSessions,
  addCompletedSession,
  setEarningsData,
  updateEarningsData,
  setWithdrawalHistory,
  addWithdrawal,
  setSessionEarnings,
  addSessionEarning,
} = mentoringSlice.actions;

// Selectors
export const selectAllMentors = (state) => state.mentoring.mentors;
export const selectSelectedMentor = (state) => state.mentoring.selectedMentor;
export const selectAllSessions = (state) => state.mentoring.sessions;
export const selectAllRequests = (state) => state.mentoring.requests;
export const selectMentoringLoading = (state) => state.mentoring.loading;
export const selectMentoringError = (state) => state.mentoring.error;
export const selectMentorById = (mentorId) => (state) =>
  state.mentoring.mentors.find((mentor) => mentor.id === mentorId);
export const selectPendingFeedback = (state) => state.mentoring.pendingFeedback;
export const selectMentees = (state) => state.mentoring.mentees;
export const selectScheduledSessions = (state) => state.mentoring.scheduledSessions;
export const selectCompletedSessions = (state) => state.mentoring.completedSessions;
export const selectEarningsData = (state) => state.mentoring.earningsData;
export const selectWithdrawalHistory = (state) => state.mentoring.withdrawalHistory;
export const selectSessionEarnings = (state) => state.mentoring.sessionEarnings;

// Reducer
export default mentoringSlice.reducer;
