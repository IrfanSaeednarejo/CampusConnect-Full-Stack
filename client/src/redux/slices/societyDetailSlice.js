import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSocietyById, getSocietyMembers } from '../../api/societyApi';

// Fetch society detail from real backend
export const fetchSocietyDetail = createAsyncThunk(
  'societyDetail/fetchSocietyDetail',
  async (societyId, { rejectWithValue }) => {
    try {
      const response = await getSocietyById(societyId);
      // Backend returns ApiResponse: { statusCode, data, message }
      const society = response.data || response;
      return society;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch society');
    }
  }
);

// Fetch members for a society from real backend
export const fetchSocietyMembers = createAsyncThunk(
  'societyDetail/fetchMembers',
  async (societyId, { rejectWithValue }) => {
    try {
      const response = await getSocietyMembers(societyId);
      const data = response.data || response;
      // Backend may return paginated { docs: [...] } or direct array
      return Array.isArray(data) ? data : (data.docs || data.members || []);
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch members');
    }
  }
);

const societyDetailSlice = createSlice({
  name: 'societyDetail',
  initialState: {
    detail: null,
    members: [],
    membersStatus: 'idle',
    status: 'idle',
    error: null,
  },
  reducers: {
    clearSocietyDetail: (state) => {
      state.detail = null;
      state.members = [];
      state.status = 'idle';
      state.membersStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocietyDetail.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSocietyDetail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.detail = action.payload;
      })
      .addCase(fetchSocietyDetail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchSocietyMembers.pending, (state) => {
        state.membersStatus = 'loading';
      })
      .addCase(fetchSocietyMembers.fulfilled, (state, action) => {
        state.membersStatus = 'succeeded';
        state.members = action.payload;
      })
      .addCase(fetchSocietyMembers.rejected, (state, action) => {
        state.membersStatus = 'failed';
      });
  },
});

export const { clearSocietyDetail } = societyDetailSlice.actions;

export const selectSocietyDetail = (state) => state.societyDetail.detail;
export const selectSocietyDetailStatus = (state) => state.societyDetail.status;
export const selectSocietyDetailError = (state) => state.societyDetail.error;
export const selectSocietyMembers = (state) => state.societyDetail.members;
export const selectSocietyMembersStatus = (state) => state.societyDetail.membersStatus;

export default societyDetailSlice.reducer;
