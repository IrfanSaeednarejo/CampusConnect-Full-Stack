import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  role: null, // 'student', 'mentor', 'society_head'
  token: null,
  loading: false,
  error: null,
  onboardingCompleted: false, // Track if user completed onboarding
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.token = null;
      state.onboardingCompleted = false;
      state.loading = false;
      state.error = null;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    completeOnboarding: (state) => {
      state.onboardingCompleted = true;
    },
    clearOnboarding: (state) => {
      state.onboardingCompleted = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setRole,
  completeOnboarding,
  clearOnboarding,
  clearError,
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;
export const selectToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectOnboardingCompleted = (state) => state.auth.onboardingCompleted;

// Reducer
export default authSlice.reducer;
