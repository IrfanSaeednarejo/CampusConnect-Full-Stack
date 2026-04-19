import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as mentoringApi from '../../api/mentoringApi';

// ── Thunks ─────────────────────────────────────────────────────────────

export const fetchMentors = createAsyncThunk(
  'mentoring/fetchMentors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.getMentors(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch mentors');
    }
  }
);

export const fetchMentorById = createAsyncThunk(
  'mentoring/fetchMentorById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.getMentorById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch mentor details');
    }
  }
);

export const fetchMyMentorProfile = createAsyncThunk(
  'mentoring/fetchMyMentorProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.getMyMentorProfile();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch your mentor profile');
    }
  }
);

export const registerAsMentorThunk = createAsyncThunk(
  'mentoring/register',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.registerAsMentor(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to submit mentor application');
    }
  }
);

export const updateMentorProfile = createAsyncThunk(
  'mentoring/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.updateMentorProfile(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update profile');
    }
  }
);

export const setMentorAvailability = createAsyncThunk(
  'mentoring/setAvailability',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.setAvailability(scheduleData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to save availability');
    }
  }
);

export const fetchMentorAvailability = createAsyncThunk(
  'mentoring/getAvailability',
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.getMentorAvailability(id, params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch availability');
    }
  }
);

export const bookSessionThunk = createAsyncThunk(
  'mentoring/bookSession',
  async ({ mentorId, bookingData }, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.bookSession(mentorId, bookingData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to book session');
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'mentoring/fetchMyBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.getMyBookings(params);
      return data.data; // expecting { docs: [], totalDocs, ... } or similar
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'mentoring/fetchBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.getBookingById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch booking details');
    }
  }
);

export const confirmBookingThunk = createAsyncThunk(
  'mentoring/confirmBooking',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.confirmBooking(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to confirm booking');
    }
  }
);

export const cancelBookingThunk = createAsyncThunk(
  'mentoring/cancelBooking',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.cancelBooking(id);
      return data.data; // Should return { bookingId, status: 'cancelled' }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to cancel booking');
    }
  }
);

export const completeBookingThunk = createAsyncThunk(
  'mentoring/completeBooking',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.completeBooking(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to complete booking');
    }
  }
);

export const fetchMentorReviews = createAsyncThunk(
  'mentoring/fetchMentorReviews',
  async ({ mentorId, params = {} }, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.getMentorReviews(mentorId, params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch reviews');
    }
  }
);

export const submitReviewThunk = createAsyncThunk(
  'mentoring/submitReview',
  async ({ bookingId, reviewData }, { rejectWithValue }) => {
    try {
      const { data } = await mentoringApi.submitReview(bookingId, reviewData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to submit review');
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  mentors: [],           // Public listing of mentors
  currentMentor: null,   // Selected mentor (for viewing profile)
  myMentorProfile: null, // Current user's mentor profile (if applicable)
  bookings: [],          // My bookings (as mentor or student)
  currentBooking: null,  // Selected booking details
  availability: [],      // Viewed mentor's schedule array
  reviews: [],           // Viewed mentor's reviews
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  
  loading: false,        // For data fetching
  actionLoading: false,  // For mutations (create, update, delete)
  error: null,
};

// ── Slice ───────────────────────────────────────────────────────────────────

const mentoringSlice = createSlice({
  name: 'mentoring',
  initialState,
  reducers: {
    clearMentoringError: (state) => {
      state.error = null;
    },
    clearCurrentMentor: (state) => {
      state.currentMentor = null;
      state.availability = [];
      state.reviews = [];
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMentors
      .addCase(fetchMentors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.loading = false;
        state.mentors = action.payload.docs || [];
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.totalDocs,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchMentorById
      .addCase(fetchMentorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMentorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMentor = action.payload;
      })
      .addCase(fetchMentorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchMyMentorProfile
      .addCase(fetchMyMentorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyMentorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myMentorProfile = action.payload;
      })
      .addCase(fetchMyMentorProfile.rejected, (state, action) => {
        state.loading = false;
        // Don't show error if they are just not a mentor yet
        if (!action.payload?.includes('Not found')) {
          state.error = action.payload;
        }
      })
      
      // registerAsMentorThunk
      .addCase(registerAsMentorThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(registerAsMentorThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myMentorProfile = action.payload; // Usually pending status
      })
      .addCase(registerAsMentorThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // updateMentorProfile
      .addCase(updateMentorProfile.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateMentorProfile.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myMentorProfile = action.payload;
      })
      .addCase(updateMentorProfile.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      
      // fetchMentorAvailability
      .addCase(fetchMentorAvailability.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMentorAvailability.fulfilled, (state, action) => {
        state.availability = action.payload || { availability: [], bookedSlots: [] };
      })
      .addCase(fetchMentorAvailability.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // fetchMyBookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.docs || [];
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Status Changes (confirm/cancel/complete)
      .addCase(confirmBookingThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        state.bookings = state.bookings.map(b => b._id === updated._id ? updated : b);
        if (state.currentBooking?._id === updated._id) state.currentBooking = updated;
      })
      .addCase(cancelBookingThunk.fulfilled, (state, action) => {
        const bookingId = action.payload.bookingId || action.payload._id;
        state.bookings = state.bookings.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b);
        if (state.currentBooking?._id === bookingId) state.currentBooking.status = 'cancelled';
      })
      .addCase(completeBookingThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        state.bookings = state.bookings.map(b => b._id === updated._id ? updated : b);
        if (state.currentBooking?._id === updated._id) state.currentBooking = updated;
      });
  },
});

export const { 
  clearMentoringError, 
  clearCurrentMentor, 
  clearCurrentBooking,
} = mentoringSlice.actions;

// Selectors
export const selectAllMentors = (state) => state.mentoring.mentors;
export const selectCurrentMentor = (state) => state.mentoring.currentMentor;
export const selectMyMentorProfile = (state) => state.mentoring.myMentorProfile;
export const selectMentorAvailability = (state) => state.mentoring.availability;
export const selectMentorReviews = (state) => state.mentoring.reviews;
export const selectMyBookings = (state) => state.mentoring.bookings;
export const selectCurrentBooking = (state) => state.mentoring.currentBooking;
export const selectMentoringLoading = (state) => state.mentoring.loading;
export const selectMentoringActionLoading = (state) => state.mentoring.actionLoading;
export const selectMentoringError = (state) => state.mentoring.error;

export default mentoringSlice.reducer;
