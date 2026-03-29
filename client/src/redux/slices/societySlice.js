import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllSocieties, getSocietyById, createSociety, deleteSociety, joinSociety as joinSocietyApi, leaveSociety as leaveSocietyApi, getSocietyMembers, getUserSocieties, getMemberRequests } from '../../api/societyApi';

// ===== ASYNC THUNKS — connect to real backend API =====

export const fetchSocieties = createAsyncThunk(
  'societies/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getAllSocieties(filters);
      const data = response.data?.docs || response.data?.societies || response.data || [];
      return Array.isArray(data) ? data : (data.docs || []);
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch societies');
    }
  }
);

export const fetchSocietyById = createAsyncThunk(
  'societies/fetchById',
  async (societyId, { rejectWithValue }) => {
    try {
      const response = await getSocietyById(societyId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch society');
    }
  }
);

export const fetchUserSocieties = createAsyncThunk(
  'societies/fetchUserSocieties',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getUserSocieties(userId);
      const data = response.data?.docs || response.data?.societies || response.data || [];
      return Array.isArray(data) ? data : (data.docs || []);
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch user societies');
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  'societies/fetchPendingRequests',
  async (societyId, { rejectWithValue }) => {
    try {
      const response = await getMemberRequests(societyId);
      const data = response.data || response;
      // Inject the societyId into each pending member so the dashboard knows which society to approve for
      if (Array.isArray(data)) {
        return data.map(member => ({ ...member, societyId }));
      }
      return data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch member requests');
    }
  }
);

export const createNewSociety = createAsyncThunk(
  'societies/create',
  async (societyData, { rejectWithValue }) => {
    try {
      const response = await createSociety(societyData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to create society');
    }
  }
);

export const deleteSocietyById = createAsyncThunk(
  'societies/delete',
  async (societyId, { rejectWithValue }) => {
    try {
      await deleteSociety(societyId);
      return societyId;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to delete society');
    }
  }
);

export const joinSocietyById = createAsyncThunk(
  'societies/join',
  async (societyId, { rejectWithValue }) => {
    try {
      const response = await joinSocietyApi(societyId);
      return { societyId, data: response.data || response };
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to join society');
    }
  }
);

export const leaveSocietyById = createAsyncThunk(
  'societies/leave',
  async (societyId, { rejectWithValue }) => {
    try {
      await leaveSocietyApi(societyId);
      return societyId;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to leave society');
    }
  }
);

// ===== SLICE =====

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
    setSocieties: (state, action) => {
      state.societies = action.payload;
    },
    setRegisteredSocieties: (state, action) => {
      state.registeredSocieties = action.payload;
    },
    addSociety: (state, action) => {
      state.societies.push(action.payload);
    },
    updateSociety: (state, action) => {
      const index = state.societies.findIndex((s) => s._id === action.payload._id || s.id === action.payload.id);
      if (index !== -1) {
        state.societies[index] = { ...state.societies[index], ...action.payload };
      }
    },
    removeSociety: (state, action) => {
      state.societies = state.societies.filter((s) => s._id !== action.payload && s.id !== action.payload);
    },
    joinSociety: (state, action) => {
      const society = state.societies.find((s) => s._id === action.payload || s.id === action.payload);
      if (society && !state.registeredSocieties.find((s) => s._id === action.payload || s.id === action.payload)) {
        state.registeredSocieties.push(society);
      }
    },
    leaveSociety: (state, action) => {
      state.registeredSocieties = state.registeredSocieties.filter(
        (s) => s._id !== action.payload && s.id !== action.payload
      );
    },
    setSelectedSociety: (state, action) => {
      state.selectedSociety = action.payload;
    },
    setSocietyLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSocietyError: (state, action) => {
      state.error = action.payload;
    },
    clearSocietyError: (state) => {
      state.error = null;
    },
    setMemberRequests: (state, action) => {
      state.memberRequests = action.payload;
    },
    addMemberRequest: (state, action) => {
      state.memberRequests.push(action.payload);
    },
    removeMemberRequest: (state, action) => {
      state.memberRequests = state.memberRequests.filter((r) => {
        const reqId = r.memberId?._id || r.id || r._id;
        return reqId !== action.payload;
      });
    },
    approveMemberRequest: (state, action) => {
      state.memberRequests = state.memberRequests.filter((r) => r.id !== action.payload);
    },
    rejectMemberRequest: (state, action) => {
      state.memberRequests = state.memberRequests.filter((r) => r.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // fetchSocieties
    builder
      .addCase(fetchSocieties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocieties.fulfilled, (state, action) => {
        state.loading = false;
        state.societies = action.payload;
      })
      .addCase(fetchSocieties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchSocietyById
      .addCase(fetchSocietyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocietyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSociety = action.payload;
      })
      .addCase(fetchSocietyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchUserSocieties
      .addCase(fetchUserSocieties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSocieties.fulfilled, (state, action) => {
        state.loading = false;
        state.registeredSocieties = action.payload;
      })
      .addCase(fetchUserSocieties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchPendingRequests
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        // Append the fetched requests. 
        // We'll reset the array beforehand in the component, or just append unique ones.
        const newRequests = action.payload;
        if (Array.isArray(newRequests)) {
          const existingIds = new Set(state.memberRequests.map(r => r.memberId?._id || r.id));
          const uniqueNew = newRequests.filter(r => !existingIds.has(r.memberId?._id || r.id));
          state.memberRequests = [...state.memberRequests, ...uniqueNew];
        }
      })
      // createNewSociety
      .addCase(createNewSociety.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewSociety.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure state arrays exist before pushing
        if (!Array.isArray(state.societies)) state.societies = [];
        if (!Array.isArray(state.registeredSocieties)) state.registeredSocieties = [];

        state.societies.push(action.payload);
        state.registeredSocieties.push(action.payload);
      })
      .addCase(createNewSociety.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteSocietyById
      .addCase(deleteSocietyById.fulfilled, (state, action) => {
        state.societies = state.societies.filter((s) => s._id !== action.payload && s.id !== action.payload);
      })
      // joinSocietyById
      .addCase(joinSocietyById.fulfilled, (state, action) => {
        const society = state.societies.find((s) => s._id === action.payload.societyId || s.id === action.payload.societyId);
        if (society && !state.registeredSocieties.find((s) => s._id === action.payload.societyId)) {
          state.registeredSocieties.push(society);
        }
      })
      // leaveSocietyById
      .addCase(leaveSocietyById.fulfilled, (state, action) => {
        state.registeredSocieties = state.registeredSocieties.filter(
          (s) => s._id !== action.payload && s.id !== action.payload
        );
      });
  },
});

// Actions
export const {
  setSocieties,
  setRegisteredSocieties,
  addSociety,
  updateSociety,
  removeSociety,
  joinSociety,
  leaveSociety,
  setSelectedSociety,
  setSocietyLoading,
  setSocietyError,
  clearSocietyError,
  setMemberRequests,
  addMemberRequest,
  removeMemberRequest,
  approveMemberRequest,
  rejectMemberRequest,
} = societySlice.actions;

// Selectors
export const selectAllSocieties = (state) => state.societies.societies;
export const selectRegisteredSocieties = (state) => state.societies.registeredSocieties;
export const selectSelectedSociety = (state) => state.societies.selectedSociety;
export const selectMemberRequests = (state) => state.societies.memberRequests;
export const selectSocietyLoading = (state) => state.societies.loading;
export const selectSocietyError = (state) => state.societies.error;
export const selectSocietyById = (societyId) => (state) =>
  state.societies.societies.find((society) => society._id === societyId || society.id === societyId);

// Reducer
export default societySlice.reducer;
