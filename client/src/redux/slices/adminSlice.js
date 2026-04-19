import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../api/adminApi';

// ── Existing Thunks (Preserved) ──────────────────────────────────────────────

export const fetchAllUsersThunk = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAdminUsers(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch users');
    }
  }
);

export const updateUserRoleThunk = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, roles }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateUserRole(userId, { roles });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update user role');
    }
  }
);

export const toggleUserSuspensionThunk = createAsyncThunk(
  'admin/toggleSuspension',
  async (userId, { rejectWithValue }) => {
    try {
      // Note: The upgraded API uses status update. This thunk is maintained for compatibility.
      const response = await adminApi.updateUserStatus(userId, { status: 'suspended' }); 
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to toggle suspension');
    }
  }
);

export const fetchPendingSocietiesThunk = createAsyncThunk(
  'admin/fetchPendingSocieties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingSocieties();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch pending societies');
    }
  }
);

export const updateSocietyStatusThunk = createAsyncThunk(
  'admin/updateSocietyStatus',
  async ({ societyId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateSocietyStatus(societyId, { status, reason });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update society status');
    }
  }
);

export const fetchPendingMentorsThunk = createAsyncThunk(
  'admin/fetchPendingMentors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingMentors();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch pending mentors');
    }
  }
);

export const approveMentorThunk = createAsyncThunk(
  'admin/approveMentor',
  async (mentorId, { rejectWithValue }) => {
    try {
      const response = await adminApi.verifyMentor(mentorId);
      return { mentorId, data: response.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve mentor');
    }
  }
);

// ── Admin Slice ───────────────────────────────────────────────────────────────

const MAX_LIVE_EVENTS = 50;

const initialState = {
    // Existing State
    users: [],
    pagination: null,
    pendingSocieties: [],
    pendingMentors: [],
    allMentors: [],
    loading: false,
    error: null,

    // New Integrated State
    liveEvents: [],          // [{ _id, type, title, campusId, timestamp }]
    pendingCounts: {
        mentors: 0,
        societies: 0,
    },
    systemStatus: {
        maintenanceMode: false,
        socketConnections: 0,
        connected: false,      // admin socket connection state
    },
    selectedCampusId: null,  // null = all campuses (super_admin only)
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        },
        /**
         * Push a new live event to the ring buffer.
         */
        pushLiveEvent(state, action) {
            const event = { ...action.payload, _id: action.payload._id || Date.now() };
            state.liveEvents = [event, ...state.liveEvents].slice(0, MAX_LIVE_EVENTS);
        },

        /**
         * Replace all pending counts in one shot.
         */
        setPendingCounts(state, action) {
            state.pendingCounts = {
                ...state.pendingCounts,
                ...action.payload,
            };
        },

        /** Decrement a specific pending count. */
        decrementPending(state, action) {
            const { key } = action.payload; // "mentors" | "societies"
            if (key in state.pendingCounts) {
                state.pendingCounts[key] = Math.max(0, state.pendingCounts[key] - 1);
            }
        },

        /** Update system status. */
        setSystemStatus(state, action) {
            state.systemStatus = { ...state.systemStatus, ...action.payload };
        },

        /** Set the campus filter for super_admin. */
        setSelectedCampus(state, action) {
            state.selectedCampusId = action.payload;
        },

        /** Reset entire admin state. */
        resetAdminState() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsersThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllUsersThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data.users;
                state.pagination = action.payload.data.pagination;
            })
            .addCase(fetchAllUsersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPendingSocietiesThunk.fulfilled, (state, action) => {
                state.pendingSocieties = action.payload.data;
            })
            .addCase(fetchPendingMentorsThunk.fulfilled, (state, action) => {
                state.pendingMentors = action.payload.data?.docs || action.payload.data || [];
            })
            .addCase(approveMentorThunk.fulfilled, (state, action) => {
                state.pendingMentors = state.pendingMentors.filter(m => m._id !== action.payload.mentorId);
                state.pendingCounts.mentors = Math.max(0, state.pendingCounts.mentors - 1);
            });
    }
});

export const {
    clearAdminError,
    pushLiveEvent,
    setPendingCounts,
    decrementPending,
    setSystemStatus,
    setSelectedCampus,
    resetAdminState,
} = adminSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectAdminUsers      = (state) => state.admin.users;
export const selectAdminPagination = (state) => state.admin.pagination;
export const selectPendingSocieties = (state) => state.admin.pendingSocieties;
export const selectPendingMentors   = (state) => state.admin.pendingMentors;
export const selectAdminLoading     = (state) => state.admin.loading;
export const selectAdminError       = (state) => state.admin.error;

export const selectLiveEvents      = (state) => state.admin.liveEvents;
export const selectPendingCounts   = (state) => state.admin.pendingCounts;
export const selectSystemStatus    = (state) => state.admin.systemStatus;
export const selectSelectedCampus  = (state) => state.admin.selectedCampusId;
export const selectTotalPending    = (state) =>
    Object.values(state.admin.pendingCounts).reduce((sum, v) => sum + v, 0);

export default adminSlice.reducer;
