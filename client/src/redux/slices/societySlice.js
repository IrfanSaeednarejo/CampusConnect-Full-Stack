import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as societyApi from '../../api/societyApi';

// Thunks
export const fetchSocieties = createAsyncThunk(
  'societies/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.getSocieties();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch societies');
    }
  }
);

export const createSocietyThunk = createAsyncThunk(
  'societies/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.createSociety(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create society');
    }
  }
);

export const fetchSocietyById = createAsyncThunk(
  'societies/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.getSocietyById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch society details');
    }
  }
);

export const joinSocietyThunk = createAsyncThunk(
  'societies/join',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.joinSociety(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to join society');
    }
  }
);

const initialState = {
  societies: [],
  registeredSocieties: [],
  selectedSociety: null,
  memberRequests: [],
  loading: false,
  error: null,
};

const societySlice = createSlice({
  name: 'societies',
  initialState,
  reducers: {
    clearSelectedSociety: (state) => {
      state.selectedSociety = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setRegisteredSocieties: (state, action) => {
      state.registeredSocieties = action.payload;
    },
    setSocieties: (state, action) => {
      state.societies = action.payload;
    },
    setSelectedSociety: (state, action) => {
      state.selectedSociety = action.payload;
    },
    updateSociety: (state, action) => {
      const index = state.societies.findIndex((s) => s.id === action.payload.id || s._id === action.payload._id);
      if (index !== -1) {
        state.societies[index] = { ...state.societies[index], ...action.payload };
      }
    },
    setMemberRequests: (state, action) => {
      state.memberRequests = action.payload;
    },
    approveMemberRequest: (state, action) => {
      state.memberRequests = state.memberRequests.filter(req => req.id !== action.payload);
    },
    rejectMemberRequest: (state, action) => {
      state.memberRequests = state.memberRequests.filter(req => req.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocieties.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSocieties.fulfilled, (state, action) => {
        state.loading = false;
        state.societies = action.payload;
      })
      .addCase(fetchSocieties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSocietyThunk.fulfilled, (state, action) => {
        state.societies.push(action.payload);
      })
      .addCase(fetchSocietyById.fulfilled, (state, action) => {
        state.selectedSociety = action.payload;
      })
      .addCase(joinSocietyThunk.fulfilled, (state, action) => {
        // Logic to update user societies would go here
      });
  },
});

export const { 
  clearSelectedSociety, 
  clearError, 
  setRegisteredSocieties, 
  setSocieties, 
  setSelectedSociety, 
  updateSociety,
  setMemberRequests,
  approveMemberRequest,
  rejectMemberRequest
} = societySlice.actions;

export const selectAllSocieties = (state) => state.societies.societies;
export const selectRegisteredSocieties = (state) => state.societies.registeredSocieties;
export const selectSelectedSociety = (state) => state.societies.selectedSociety;
export const selectMemberRequests = (state) => state.societies.memberRequests;
export const selectSocietyLoading = (state) => state.societies.loading;
export const selectSocietyError = (state) => state.societies.error;
export const selectSocietyById = (id) => (state) => 
  state.societies.societies.find((s) => s.id === id || s._id === id);

export default societySlice.reducer;
