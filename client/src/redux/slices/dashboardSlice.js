import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dashboardApi from '../../api/dashboardApi';

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getSummary();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard summary');
    }
  }
);

export const fetchDashboardTimeline = createAsyncThunk(
  'dashboard/fetchTimeline',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getTimeline();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard timeline');
    }
  }
);

const initialState = {
  summary: {
    activeEventsCount: 0,
    mySocietiesCount: 0,
    unreadMessagesCount: 0,
    availableMentorsCount: 0,
    myStudyGroupsCount: 0,
    pendingSessionsCount: 0,
    pendingApprovalsCount: 0
  },
  timeline: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = { ...state.summary, ...action.payload };
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboardTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = action.payload;
      })
      .addCase(fetchDashboardTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;

export const selectDashboardSummary = (state) => state.dashboard.summary;
export const selectDashboardTimeline = (state) => state.dashboard.timeline;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

export default dashboardSlice.reducer;
