import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../api/adminApi';

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

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    pagination: null,
    pendingSocieties: [],
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
      });
  },
});

export const { clearAdminError } = adminSlice.actions;

export const selectAdminUsers = (state) => state.admin.users;
export const selectAdminPagination = (state) => state.admin.pagination;
export const selectPendingSocieties = (state) => state.admin.pendingSocieties;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;

export default adminSlice.reducer;
