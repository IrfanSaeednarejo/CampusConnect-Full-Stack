import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as societyApi from '../../api/societyApi';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchSocieties = createAsyncThunk(
  'societies/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.getSocieties(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch societies');
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
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch society');
    }
  }
);

export const fetchMySocieties = createAsyncThunk(
  'societies/fetchMine',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.getMySocieties(userId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch your societies');
    }
  }
);

export const fetchSocietyMembers = createAsyncThunk(
  'societies/fetchMembers',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.getSocietyMembers(id, params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch members');
    }
  }
);

export const fetchSocietyStats = createAsyncThunk(
  'societies/fetchStats',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.getSocietyStats(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch stats');
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
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create society');
    }
  }
);

export const updateSocietyThunk = createAsyncThunk(
  'societies/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.updateSociety(id, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update society');
    }
  }
);

export const deleteSocietyThunk = createAsyncThunk(
  'societies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await societyApi.deleteSociety(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete society');
    }
  }
);

export const joinSocietyThunk = createAsyncThunk(
  'societies/join',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.joinSociety(id);
      return { id, ...data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to join society');
    }
  }
);

export const leaveSocietyThunk = createAsyncThunk(
  'societies/leave',
  async (id, { rejectWithValue }) => {
    try {
      await societyApi.leaveSociety(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to leave society');
    }
  }
);

export const approveMemberThunk = createAsyncThunk(
  'societies/approveMember',
  async ({ societyId, memberId }, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.approveMember(societyId, memberId);
      return { societyId, memberId, member: data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to approve member');
    }
  }
);

export const rejectMemberThunk = createAsyncThunk(
  'societies/rejectMember',
  async ({ societyId, memberId }, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.rejectMember(societyId, memberId);
      return { societyId, memberId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to reject member');
    }
  }
);

export const removeMemberThunk = createAsyncThunk(
  'societies/removeMember',
  async ({ societyId, memberId }, { rejectWithValue }) => {
    try {
      await societyApi.removeMemberFromSociety(societyId, memberId);
      return { societyId, memberId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to remove member');
    }
  }
);

export const updateMemberRoleThunk = createAsyncThunk(
  'societies/updateMemberRole',
  async ({ societyId, memberId, role }, { rejectWithValue }) => {
    try {
      const { data } = await societyApi.updateMemberRole(societyId, memberId, { role });
      return { societyId, memberId, member: data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update member role');
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  societies: [],
  currentSociety: null,
  mySocieties: [],       // societies the logged-in user belongs to
  members: [],           // members of currentSociety
  memberRequests: [],    // pending members of currentSociety
  stats: null,           // stats for currentSociety
  pagination: { page: 1, total: 0, hasMore: false },
  loading: false,
  membersLoading: false,
  error: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const pending = (state) => { state.loading = true; state.error = null; };
const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

// ── Slice ─────────────────────────────────────────────────────────────────────

const societySlice = createSlice({
  name: 'societies',
  initialState,
  reducers: {
    clearCurrentSociety: (state) => { state.currentSociety = null; state.members = []; state.stats = null; },
    clearError: (state) => { state.error = null; },
    // Optimistic member management (for quick UI feedback)
    removeMemberLocally: (state, action) => {
      state.members = state.members.filter(m => (m._id || m.id) !== action.payload);
    },
  },
  extraReducers: (builder) => {

    // fetchSocieties
    builder
      .addCase(fetchSocieties.pending, pending)
      .addCase(fetchSocieties.fulfilled, (state, action) => {
        state.loading = false;
        // Backend may return array or { societies, pagination }
        if (Array.isArray(action.payload)) {
          state.societies = action.payload;
        } else {
          state.societies = action.payload?.societies ?? action.payload ?? [];
          state.pagination = action.payload?.pagination ?? state.pagination;
        }
      })
      .addCase(fetchSocieties.rejected, rejected);

    // fetchSocietyById
    builder
      .addCase(fetchSocietyById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSocietyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSociety = action.payload;
      })
      .addCase(fetchSocietyById.rejected, rejected);

    // fetchMySocieties
    builder
      .addCase(fetchMySocieties.pending, pending)
      .addCase(fetchMySocieties.fulfilled, (state, action) => {
        state.loading = false;
        state.mySocieties = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMySocieties.rejected, rejected);

    // fetchSocietyMembers — splits pending/approved automatically
    builder
      .addCase(fetchSocietyMembers.pending, (state) => { state.membersLoading = true; })
      .addCase(fetchSocietyMembers.fulfilled, (state, action) => {
        state.membersLoading = false;
        const all = Array.isArray(action.payload) ? action.payload : [];
        state.members = all.filter(m => m.status === 'approved' || m.status === 'active' || !m.status);
        state.memberRequests = all.filter(m => m.status === 'pending');
      })
      .addCase(fetchSocietyMembers.rejected, (state) => { state.membersLoading = false; });

    // fetchSocietyStats
    builder
      .addCase(fetchSocietyStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // createSocietyThunk
    builder
      .addCase(createSocietyThunk.pending, pending)
      .addCase(createSocietyThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.societies.unshift(action.payload);
        state.currentSociety = action.payload;
      })
      .addCase(createSocietyThunk.rejected, rejected);

    // updateSocietyThunk
    builder
      .addCase(updateSocietyThunk.pending, pending)
      .addCase(updateSocietyThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const idx = state.societies.findIndex(s => s._id === updated._id);
        if (idx !== -1) state.societies[idx] = updated;
        if (state.currentSociety?._id === updated._id) state.currentSociety = updated;
      })
      .addCase(updateSocietyThunk.rejected, rejected);

    // deleteSocietyThunk
    builder
      .addCase(deleteSocietyThunk.fulfilled, (state, action) => {
        state.societies = state.societies.filter(s => s._id !== action.payload);
        if (state.currentSociety?._id === action.payload) state.currentSociety = null;
      });

    // joinSocietyThunk
    builder
      .addCase(joinSocietyThunk.pending, pending)
      .addCase(joinSocietyThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Mark in societies list
        const idx = state.societies.findIndex(s => s._id === action.payload.id);
        if (idx !== -1) state.societies[idx] = { ...state.societies[idx], isMember: true };
        if (state.currentSociety?._id === action.payload.id) {
          state.currentSociety = { ...state.currentSociety, isMember: true };
        }
      })
      .addCase(joinSocietyThunk.rejected, rejected);

    // leaveSocietyThunk
    builder
      .addCase(leaveSocietyThunk.pending, pending)
      .addCase(leaveSocietyThunk.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.mySocieties = state.mySocieties.filter(s => s._id !== id);
        const idx = state.societies.findIndex(s => s._id === id);
        if (idx !== -1) state.societies[idx] = { ...state.societies[idx], isMember: false };
        if (state.currentSociety?._id === id) {
          state.currentSociety = { ...state.currentSociety, isMember: false };
        }
      })
      .addCase(leaveSocietyThunk.rejected, rejected);

    // approveMemberThunk
    builder
      .addCase(approveMemberThunk.fulfilled, (state, action) => {
        const { memberId } = action.payload;
        // Move from requests → members
        const req = state.memberRequests.find(m => (m._id || m.id) === memberId);
        state.memberRequests = state.memberRequests.filter(m => (m._id || m.id) !== memberId);
        if (req) state.members.push({ ...req, status: 'approved' });
      });

    // rejectMemberThunk
    builder
      .addCase(rejectMemberThunk.fulfilled, (state, action) => {
        const { memberId } = action.payload;
        state.memberRequests = state.memberRequests.filter(m => (m._id || m.id) !== memberId);
      });

    // removeMemberThunk
    builder
      .addCase(removeMemberThunk.fulfilled, (state, action) => {
        const { memberId } = action.payload;
        state.members = state.members.filter(m => (m._id || m.id) !== memberId);
      });

    // updateMemberRoleThunk
    builder
      .addCase(updateMemberRoleThunk.fulfilled, (state, action) => {
        const { memberId, member } = action.payload;
        const idx = state.members.findIndex(m => (m._id || m.id) === memberId);
        if (idx !== -1) state.members[idx] = { ...state.members[idx], ...member };
      });
  },
});

export const { clearCurrentSociety, clearError, removeMemberLocally } = societySlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectAllSocieties     = (state) => state.societies.societies;
export const selectCurrentSociety   = (state) => state.societies.currentSociety;
export const selectMySocieties      = (state) => state.societies.mySocieties;
export const selectSocietyMembers   = (state) => state.societies.members;
export const selectMemberRequests   = (state) => state.societies.memberRequests;
export const selectSocietyStats     = (state) => state.societies.stats;
export const selectSocietyPagination = (state) => state.societies.pagination;
export const selectSocietyLoading   = (state) => state.societies.loading;
export const selectMembersLoading   = (state) => state.societies.membersLoading;
export const selectSocietyError     = (state) => state.societies.error;

export default societySlice.reducer;
