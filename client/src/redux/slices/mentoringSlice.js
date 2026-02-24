import { createSlice } from '@reduxjs/toolkit';

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
