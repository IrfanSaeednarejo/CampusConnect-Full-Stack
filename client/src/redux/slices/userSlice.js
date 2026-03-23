import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: {
    id: null,
    name: '',
    email: '',
    avatar: '',
    department: '',
    year: null,
    bio: '',
  },
  preferences: {
    notifications: true,
    emailUpdates: true,
    theme: 'dark',
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updateUserProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setUserPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setUserLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserError: (state, action) => {
      state.error = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
    resetUserState: (state) => {
      return initialState;
    },
  },
});

// Actions
export const {
  setUserProfile,
  updateUserProfile,
  setUserPreferences,
  setUserLoading,
  setUserError,
  clearUserError,
  resetUserState,
} = userSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.user.profile;
export const selectUserName = (state) => state.user.profile.name;
export const selectUserEmail = (state) => state.user.profile.email;
export const selectUserAvatar = (state) => state.user.profile.avatar;
export const selectUserDepartment = (state) => state.user.profile.department;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

// Reducer
export default userSlice.reducer;
