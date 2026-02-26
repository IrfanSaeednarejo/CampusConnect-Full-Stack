import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recentActivity: [],
  stats: {
    eventsAttended: 0,
    mentoringSessions: 0,
    societiesMember: 0,
    connectionsCount: 0,
  },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setRecentActivity: (state, action) => {
      state.recentActivity = action.payload;
    },
    addActivity: (state, action) => {
      state.recentActivity.unshift(action.payload);
    },
    clearActivity: (state) => {
      state.recentActivity = [];
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    incrementStat: (state, action) => {
      const { stat } = action.payload;
      if (state.stats[stat] !== undefined) {
        state.stats[stat] += 1;
      }
    },
    setDashboardLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDashboardError: (state, action) => {
      state.error = action.payload;
    },
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
});

// Actions
export const {
  setRecentActivity,
  addActivity,
  clearActivity,
  setStats,
  incrementStat,
  setDashboardLoading,
  setDashboardError,
  clearDashboardError,
} = dashboardSlice.actions;

// Selectors
export const selectRecentActivity = (state) => state.dashboard.recentActivity;
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

// Reducer
export default dashboardSlice.reducer;
