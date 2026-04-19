import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../api/adminApi';
import * as mentoringApi from '../../api/mentoringApi';

export const fetchAllUsersThunk = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllUsers(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch users');
    }
  }
);

export const updateUserRoleThunk = createAsyncThunk(
  'admin/updateUserRole',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateUserRole(data);
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
      const response = await adminApi.toggleUserSuspension(userId);
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

// ── Mentor Management Thunks ────────────────────────────────────────────────

export const fetchPendingMentorsThunk = createAsyncThunk(
  'admin/fetchPendingMentors',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch ALL mentors that are not yet verified (pending) — admin only
      const response = await mentoringApi.getMentors({ verified: false, limit: 50 });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending mentors');
    }
  }
);

export const fetchAllMentorsAdminThunk = createAsyncThunk(
  'admin/fetchAllMentors',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Fetch verified active, plus suspended (isActive=false)
      // The public endpoint returns verified=true mentors; for suspended we need a separate workaround.
      // We fetch verified mentors here; the backend getMentors with verified=true & isActive=true returns them.
      // For suspended (isActive=false), the admin knows via pendingMentors + approve/suspend state changes.
      const response = await mentoringApi.getMentors({ ...params, limit: 100 });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch mentors');
    }
  }
);

export const approveMentorThunk = createAsyncThunk(
  'admin/approveMentor',
  async (mentorId, { rejectWithValue }) => {
    try {
      const response = await mentoringApi.verifyMentor(mentorId);
      return { mentorId, data: response.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve mentor');
    }
  }
);

export const suspendMentorAdminThunk = createAsyncThunk(
  'admin/suspendMentor',
  async ({ mentorId, reason }, { rejectWithValue }) => {
    try {
      const response = await mentoringApi.suspendMentor(mentorId, { reason });
      return { mentorId, data: response.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to suspend mentor');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    pagination: null,
    pendingSocieties: [],
    pendingMentors: [],
    allMentors: [],
    mentorActionLoading: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
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
      // Update Role
      .addCase(updateUserRoleThunk.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
      })
      // Toggle Suspension
      .addCase(toggleUserSuspensionThunk.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
      })
      // Fetch Pending Societies
      .addCase(fetchPendingSocietiesThunk.fulfilled, (state, action) => {
        state.pendingSocieties = action.payload.data;
      })
      // Fetch Pending Mentors
      .addCase(fetchPendingMentorsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingMentorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingMentors = action.payload?.docs || [];
      })
      .addCase(fetchPendingMentorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Mentors (admin view)
      .addCase(fetchAllMentorsAdminThunk.fulfilled, (state, action) => {
        state.allMentors = action.payload?.docs || [];
      })
      // Approve Mentor
      .addCase(approveMentorThunk.pending, (state) => {
        state.mentorActionLoading = true;
      })
      .addCase(approveMentorThunk.fulfilled, (state, action) => {
        state.mentorActionLoading = false;
        // Remove from pending, add to allMentors
        state.pendingMentors = state.pendingMentors.filter(m => m._id !== action.payload.mentorId);
        state.allMentors = state.allMentors.map(m =>
          m._id === action.payload.mentorId ? { ...m, verified: true } : m
        );
      })
      .addCase(approveMentorThunk.rejected, (state, action) => {
        state.mentorActionLoading = false;
        state.error = action.payload;
      })
      // Suspend Mentor
      .addCase(suspendMentorAdminThunk.pending, (state) => {
        state.mentorActionLoading = true;
      })
      .addCase(suspendMentorAdminThunk.fulfilled, (state, action) => {
        state.mentorActionLoading = false;
        state.allMentors = state.allMentors.map(m =>
          m._id === action.payload.mentorId ? { ...m, isActive: false } : m
        );
        state.pendingMentors = state.pendingMentors.filter(m => m._id !== action.payload.mentorId);
      })
      .addCase(suspendMentorAdminThunk.rejected, (state, action) => {
        state.mentorActionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;

export const selectAdminUsers = (state) => state.admin.users;
export const selectAdminPagination = (state) => state.admin.pagination;
export const selectPendingSocieties = (state) => state.admin.pendingSocieties;
export const selectPendingMentors = (state) => state.admin.pendingMentors;
export const selectAllAdminMentors = (state) => state.admin.allMentors;
export const selectMentorActionLoading = (state) => state.admin.mentorActionLoading;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;

export default adminSlice.reducer;
