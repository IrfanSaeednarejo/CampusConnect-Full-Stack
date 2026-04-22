import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as eventApi from '../../api/eventApi';

export const fetchMySubmission = createAsyncThunk(
  'submission/fetchMySubmission',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventApi.getMySubmission(eventId);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchAllSubmissionsThunk = createAsyncThunk(
  "submissions/fetchAll",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventApi.getSubmissions(eventId);
      return response.data.data; // Should return an array of all submissions
    } catch (err) {
       return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const submitWorkThunk = createAsyncThunk(
  'submission/submitWork',
  async ({ eventId, data }, { rejectWithValue }) => {
    try {
      const response = await eventApi.upsertSubmission(eventId, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addSubmissionFileThunk = createAsyncThunk(
  'submission/addFile',
  async ({ eventId, formData }, { rejectWithValue }) => {
    try {
      const response = await eventApi.addFileToSubmission(eventId, formData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteSubmissionFileThunk = createAsyncThunk(
  'submission/deleteFile',
  async ({ eventId, fileId }, { rejectWithValue }) => {
    try {
      const response = await eventApi.removeFileFromSubmission(eventId, fileId);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const submissionSlice = createSlice({
  name: 'submission',
  initialState: {
    mySubmission: null,
    allSubmissions: [],
    uploadStatus: 'idle', // 'idle' | 'loading' | 'success' | 'failed'
    loading: false,
    error: null,
  },
  reducers: {
    clearSubmissionError: (state) => {
      state.error = null;
    },
    resetSubmissionState: (state) => {
      state.mySubmission = null;
      state.allSubmissions = [];
      state.uploadStatus = 'idle';
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Submission
      .addCase(fetchMySubmission.pending, (state) => { state.uploadStatus = "loading"; })
      .addCase(fetchMySubmission.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";
        state.mySubmission = action.payload;
        state.error = null;
      })
      .addCase(fetchMySubmission.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.error = action.payload;
        state.mySubmission = null;
      })

      // Fetch All Submissions (Admin)
      .addCase(fetchAllSubmissionsThunk.pending, (state) => { state.uploadStatus = "loading"; })
      .addCase(fetchAllSubmissionsThunk.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";
        // Handle both direct array and paginated response
        state.allSubmissions = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload?.docs || []);
        state.error = null;
      })
      .addCase(fetchAllSubmissionsThunk.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.error = action.payload;
        state.allSubmissions = [];
      })

      // Upsert Submission
      .addCase(submitWorkThunk.pending, (state) => { state.loading = true; })
      .addCase(submitWorkThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.mySubmission = action.payload;
        state.error = null;
      })
      .addCase(submitWorkThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload File
      .addCase(addSubmissionFileThunk.pending, (state) => { 
        state.uploadStatus = 'loading'; 
        state.error = null;
      })
      .addCase(addSubmissionFileThunk.fulfilled, (state, action) => {
        state.uploadStatus = 'success';
        state.mySubmission = action.payload;
      })
      .addCase(addSubmissionFileThunk.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.payload;
      })

      // Delete File
      .addCase(deleteSubmissionFileThunk.pending, (state) => { state.loading = true; })
      .addCase(deleteSubmissionFileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.mySubmission = action.payload;
      })
      .addCase(deleteSubmissionFileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSubmissionError, resetSubmissionState } = submissionSlice.actions;

export const selectMySubmission = (state) => state.submissions.mySubmission;
export const selectAllSubmissions = (state) => state.submissions.allSubmissions;
export const selectSubmissionLoading = (state) => state.submissions.loading;
export const selectUploadStatus = (state) => state.submissions.uploadStatus;
export const selectSubmissionError = (state) => state.submissions.error;

export default submissionSlice.reducer;
