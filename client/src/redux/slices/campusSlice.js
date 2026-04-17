import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as campusApi from '../../api/campusApi';

export const fetchCampuses = createAsyncThunk(
  'campus/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await campusApi.getAllCampuses(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCampusBySlug = createAsyncThunk(
  'campus/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await campusApi.getCampusBySlug(slug);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCampusById = createAsyncThunk(
  'campus/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await campusApi.getCampusById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCampusThunk = createAsyncThunk(
  'campus/update',
  async ({ slug, data }, { rejectWithValue }) => {
    try {
      const response = await campusApi.updateCampus(slug, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  campuses: [],
  activeCampus: null,
  loading: false,
  error: null,
};

const campusSlice = createSlice({
  name: 'campus',
  initialState,
  reducers: {
    setActiveCampus: (state, action) => {
      state.activeCampus = action.payload;
    },
    clearCampusError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampuses.pending, (state) => { state.loading = true; })
      .addCase(fetchCampuses.fulfilled, (state, action) => {
        state.campuses = action.payload?.docs || action.payload || [];
        state.loading = false;
      })
      .addCase(fetchCampuses.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
    builder
      .addCase(fetchCampusBySlug.pending, (state) => { state.loading = true; })
      .addCase(fetchCampusBySlug.fulfilled, (state, action) => {
        state.activeCampus = action.payload;
        state.loading = false;
      })
      .addCase(fetchCampusBySlug.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
    builder
      .addCase(fetchCampusById.pending, (state) => { state.loading = true; })
      .addCase(fetchCampusById.fulfilled, (state, action) => {
        state.activeCampus = action.payload;
        state.loading = false;
      })
      .addCase(fetchCampusById.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
    builder
      .addCase(updateCampusThunk.pending, (state) => { state.loading = true; })
      .addCase(updateCampusThunk.fulfilled, (state, action) => {
        state.activeCampus = action.payload;
        state.loading = false;
        // Also update in list if present
        const index = state.campuses.findIndex(c => c.slug === action.payload.slug);
        if (index !== -1) state.campuses[index] = action.payload;
      })
      .addCase(updateCampusThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { setActiveCampus, clearCampusError } = campusSlice.actions;

export const selectCampuses = (state) => state.campus.campuses;
export const selectActiveCampus = (state) => state.campus.activeCampus;
export const selectSelectedCampus = selectActiveCampus; // Alias for consistency in components
export const selectCampusLoading = (state) => state.campus.loading;
export const selectCampusError = (state) => state.campus.error;

export default campusSlice.reducer;
