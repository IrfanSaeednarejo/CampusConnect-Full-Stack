import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(credentials);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(userData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.checkAuth();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Not authenticated');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (err) {
      return rejectWithValue(err.message || 'Logout failed');
    }
  }
);

export const completeOnboardingThunk = createAsyncThunk(
  'auth/completeOnboarding',
  async (onboardingData, { rejectWithValue }) => {
    try {
      const { data } = await authApi.updateOnboarding(onboardingData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update onboarding');
    }
  }
);

const initialState = {
  isAuthenticated: false,
  user: null,
  role: null,
  loading: true,
  error: null,
  onboardingCompleted: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.loading = false;
      state.error = null;
      state.onboardingCompleted = false;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    completeOnboarding: (state) => {
      state.onboardingCompleted = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.user = user;
        state.role = user?.roles?.[0] || null;
        state.onboardingCompleted = user?.onboarding?.isComplete || false;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.user = user;
        state.role = user?.roles?.[0] || null;
        state.onboardingCompleted = user?.onboarding?.isComplete || false;
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        const user = action.payload;
        state.isAuthenticated = true;
        state.user = user;
        state.role = user?.roles?.[0] || null;
        state.onboardingCompleted = user?.onboarding?.isComplete || false;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.loading = false;
      });

    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.loading = false;
        state.onboardingCompleted = false;
      });

    builder
      .addCase(completeOnboardingThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeOnboardingThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.onboardingCompleted = action.payload?.onboarding?.isComplete || false;
        state.loading = false;
      })
      .addCase(completeOnboardingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  logout,
  setRole,
  completeOnboarding,
  clearError,
  updateUser,
} = authSlice.actions;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectOnboardingCompleted = (state) => state.auth.onboardingCompleted;

export default authSlice.reducer;
