import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as eventApi from '../../api/eventApi';

// Note: Requires judging config permissions tied to user's auth token
export const fetchMyJudgingQueue = createAsyncThunk(
  'scoring/fetchMyQueue',
  async ({ eventId, params }, { rejectWithValue }) => {
    try {
      const response = await eventApi.getMyJudgingQueue(eventId, params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const submitScoreThunk = createAsyncThunk(
  'scoring/submitScore',
  async ({ eventId, subId, data }, { rejectWithValue }) => {
    try {
      const response = await eventApi.scoreSubmission(eventId, subId, data);
      return response.data; // Usually returns confirmation and payload
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const scoringSlice = createSlice({
  name: 'scoring',
  initialState: {
    myQueue: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearScoringError: (state) => {
      state.error = null;
    },
    resetScoringState: (state) => {
      state.myQueue = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Queue
      .addCase(fetchMyJudgingQueue.pending, (state) => { state.loading = true; })
      .addCase(fetchMyJudgingQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.myQueue = action.payload; // Typically array of submissions needing review
        state.error = null;
      })
      .addCase(fetchMyJudgingQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Submit Score
      .addCase(submitScoreThunk.pending, (state) => { state.loading = true; })
      .addCase(submitScoreThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Depending on response, we might filter the queue item out if fully scored
        // For simplicity, we just clear error and let component re-fetch or filter manually
        state.error = null;
      })
      .addCase(submitScoreThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearScoringError, resetScoringState } = scoringSlice.actions;

export const selectJudgingQueue = (state) => state.scoring.myQueue;
export const selectScoringLoading = (state) => state.scoring.loading;
export const selectScoringError = (state) => state.scoring.error;

export default scoringSlice.reducer;
