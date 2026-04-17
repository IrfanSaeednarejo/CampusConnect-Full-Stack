import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userApi from '../../api/userApi';

// Repurposed userSlice for viewing OTHER users and search features.
// Current logged-in user state is exclusively managed in authSlice.js.

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await userApi.getUserProfile(userId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch user profile');
    }
  }
);

export const searchUsersThunk = createAsyncThunk(
  'user/searchUsers',
  async ({ q, page, limit }, { rejectWithValue }) => {
    try {
      const { data } = await userApi.searchUsers(q, page, limit);
      return data.data; // { users: [], pagination: {} }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Search failed');
    }
  }
);

const initialState = {
  viewedProfile: null,
  searchResults: [],
  searchPagination: { total: 0, page: 1, pages: 1 },
  searchQuery: '',
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearViewedProfile: (state) => {
      state.viewedProfile = null;
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.searchPagination = initialState.searchPagination;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.viewedProfile = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.viewedProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(searchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.users;
        state.searchPagination = action.payload.pagination;
      })
      .addCase(searchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearViewedProfile, clearSearch, setSearchQuery } = userSlice.actions;

export const selectViewedProfile = (state) => state.user.viewedProfile;
export const selectSearchResults = (state) => state.user.searchResults;
export const selectSearchPagination = (state) => state.user.searchPagination;
export const selectSearchQuery = (state) => state.user.searchQuery;
export const selectUserViewLoading = (state) => state.user.loading;
export const selectUserViewError = (state) => state.user.error;

export default userSlice.reducer;
