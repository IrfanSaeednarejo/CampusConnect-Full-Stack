import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';
import * as userApi from '../../api/userApi';

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
      const { data } = await userApi.updateOnboarding(onboardingData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update onboarding');
    }
  }
);

// Self-profile updates (moves to auth user)
export const updateAccountThunk = createAsyncThunk(
  'auth/updateAccount',
  async (updateData, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updateAccount(updateData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);

export const updateAcademicThunk = createAsyncThunk(
  'auth/updateAcademic',
  async (updateData, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updateAcademic(updateData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);

export const updatePreferencesThunk = createAsyncThunk(
  'auth/updatePreferences',
  async (updateData, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updatePreferences(updateData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);

export const updateSocialLinksThunk = createAsyncThunk(
  'auth/updateSocialLinks',
  async (links, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updateSocialLinks(links);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);

export const updateInterestsThunk = createAsyncThunk(
  'auth/updateInterests',
  async (interests, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updateInterests(interests);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);

export const updateAvatarThunk = createAsyncThunk(
  'auth/updateAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updateAvatar(file);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);

export const updateCoverThunk = createAsyncThunk(
  'auth/updateCover',
  async (file, { rejectWithValue }) => {
    try {
      const { data } = await userApi.updateCoverImage(file);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);

export const sendVerificationEmailThunk = createAsyncThunk(
  'auth/sendVerificationEmail',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await userApi.sendVerificationEmail();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send email');
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await userApi.changePassword(passwordData);
      dispatch(logout()); // backend clears cookies
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to change password');
    }
  }
);

export const deleteAccountThunk = createAsyncThunk(
  'auth/deleteAccount',
  async (passwordData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await userApi.deleteAccount(passwordData.password);
      dispatch(logout()); // backend clears cookies
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete account');
    }
  }
);


const initialState = {
  isAuthenticated: false,
  user: null,
  roles: [],        // full roles array from user.roles[]
  role: null,       // primary role (roles[0]) kept for compatibility
  loading: true,
  error: null,
  onboardingCompleted: false,
};

const updateUserState = (state, action) => {
  const user = action.payload;
  state.isAuthenticated = true;
  state.user = user;
  state.roles = user?.roles ?? [];
  state.role = user?.roles?.[0] || null;
  state.onboardingCompleted = user?.onboarding?.isComplete || false;
  state.error = null;
  state.loading = false;
};

const handleUpdatePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleUpdateRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.roles = [];
      state.role = null;
      state.loading = false;
      state.error = null;
      state.onboardingCompleted = false;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, handleUpdatePending)
      .addCase(loginUser.fulfilled, (state, action) => {
        const user = action.payload.user || action.payload;
        updateUserState(state, { payload: user });
      })
      .addCase(loginUser.rejected, handleUpdateRejected);

    builder
      .addCase(registerUser.pending, handleUpdatePending)
      .addCase(registerUser.fulfilled, (state, action) => {
        const user = action.payload.user || action.payload;
        updateUserState(state, { payload: user });
      })
      .addCase(registerUser.rejected, handleUpdateRejected);

    builder
      .addCase(checkAuth.pending, (state) => {
        if (!state.user) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, updateUserState)
      .addCase(checkAuth.rejected, (state) => {
        // RACE CONDITION PROTECTION: Never clear auth state if we've already 
        // established a session via Register or Login in between!
        if (state.isAuthenticated && state.user) {
          state.loading = false;
          return;
        }
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.role = null;
        state.loading = false;
        state.onboardingCompleted = false;
      });

    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.roles = [];
        state.role = null;
        state.loading = false;
        state.onboardingCompleted = false;
      });

    // Unified payload assigner for all update thunks
    const updateThunks = [
      completeOnboardingThunk,
      updateAccountThunk,
      updateAcademicThunk,
      updatePreferencesThunk,
      updateSocialLinksThunk,
      updateInterestsThunk,
      updateAvatarThunk,
      updateCoverThunk
    ];

    updateThunks.forEach(thunk => {
      builder
        .addCase(thunk.pending, handleUpdatePending)
        .addCase(thunk.fulfilled, updateUserState)
        .addCase(thunk.rejected, handleUpdateRejected);
    });

    builder
      .addCase(changePasswordThunk.pending, handleUpdatePending)
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePasswordThunk.rejected, handleUpdateRejected);

    builder
      .addCase(deleteAccountThunk.pending, handleUpdatePending)
      .addCase(deleteAccountThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteAccountThunk.rejected, handleUpdateRejected);
  },
});

export const {
  logout,
  setRole,
  clearError,
} = authSlice.actions;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;            // primary role (roles[0])
export const selectUserRoles = (state) => state.auth.roles ?? []; // full roles array
export const selectHasRole = (role) => (state) => (state.auth.roles ?? []).includes(role);
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectOnboardingCompleted = (state) => state.auth.onboardingCompleted;

export default authSlice.reducer;
