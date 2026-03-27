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
      .addCase(fetchCampusBySlug.fulfilled, (state, action) => {
        state.activeCampus = action.payload;
      });
  },
});

export const { setActiveCampus, clearCampusError } = campusSlice.actions;
export const selectCampuses = (state) => state.campus.campuses;
export const selectActiveCampus = (state) => state.campus.activeCampus;
export const selectCampusLoading = (state) => state.campus.loading;

export default campusSlice.reducer;
