import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as studyGroupApi from '../../api/studyGroupApi';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchStudyGroups = createAsyncThunk(
  'studyGroups/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await studyGroupApi.getStudyGroups(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch study groups');
    }
  }
);

export const fetchMyStudyGroups = createAsyncThunk(
  'studyGroups/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await studyGroupApi.getMyStudyGroups();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch your study groups');
    }
  }
);

export const fetchStudyGroupById = createAsyncThunk(
  'studyGroups/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await studyGroupApi.getStudyGroupById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch study group');
    }
  }
);

export const createStudyGroupThunk = createAsyncThunk(
  'studyGroups/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await studyGroupApi.createStudyGroup(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create study group');
    }
  }
);

export const joinStudyGroupThunk = createAsyncThunk(
  'studyGroups/join',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await studyGroupApi.joinStudyGroup(id);
      return { id, ...data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to join group');
    }
  }
);

export const leaveStudyGroupThunk = createAsyncThunk(
  'studyGroups/leave',
  async (id, { rejectWithValue }) => {
    try {
      await studyGroupApi.leaveStudyGroup(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to leave group');
    }
  }
);

export const addResourceThunk = createAsyncThunk(
  'studyGroups/addResource',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await studyGroupApi.addResource(id, formData);
      return data.data; // This is the new resource object
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to upload resource');
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  groups: [],
  selectedGroup: null,
  myGroups: [],
  resources: [],
  messages: [],
  pagination: { page: 1, total: 0, pages: 1 },
  loading: false,
  actionLoading: false,
  error: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const studyGroupSlice = createSlice({
  name: 'studyGroups',
  initialState,
  reducers: {
    clearSelectedGroup: (state) => { state.selectedGroup = null; state.messages = []; state.resources = []; },
    clearError: (state) => { state.error = null; },
    addLocalMessage: (state, action) => {
      state.messages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      // fetchStudyGroups
      .addCase(fetchStudyGroups.pending, pending)
      .addCase(fetchStudyGroups.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.groups = action.payload;
        } else {
          state.groups = action.payload?.docs ?? action.payload?.groups ?? [];
          state.pagination = action.payload?.pagination ?? state.pagination;
        }
      })
      .addCase(fetchStudyGroups.rejected, rejected)

      // fetchMyStudyGroups
      .addCase(fetchMyStudyGroups.fulfilled, (state, action) => {
        state.myGroups = Array.isArray(action.payload) ? action.payload : (action.payload?.docs || []);
      })

      // fetchStudyGroupById
      .addCase(fetchStudyGroupById.pending, pending)
      .addCase(fetchStudyGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGroup = action.payload;
      })
      .addCase(fetchStudyGroupById.rejected, rejected)

      // createStudyGroupThunk
      .addCase(createStudyGroupThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(createStudyGroupThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.groups.unshift(action.payload);
        state.myGroups.unshift(action.payload);
        state.selectedGroup = action.payload;
      })
      .addCase(createStudyGroupThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })

      // joinStudyGroupThunk
      .addCase(joinStudyGroupThunk.fulfilled, (state, action) => {
        const id = action.payload.id;
        const group = state.groups.find(g => (g._id || g.id) === id);
        if (group && !state.myGroups.some(g => (g._id || g.id) === id)) {
          state.myGroups.push({ ...group, isMember: true });
        }
        if (state.selectedGroup?._id === id) {
          state.selectedGroup = { ...state.selectedGroup, isMember: true };
        }
      })

      // leaveStudyGroupThunk
      .addCase(leaveStudyGroupThunk.fulfilled, (state, action) => {
        const id = action.payload;
        state.myGroups = state.myGroups.filter(g => (g._id || g.id) !== id);
        if (state.selectedGroup?._id === id) {
          state.selectedGroup = { ...state.selectedGroup, isMember: false };
        }
      })

      // addResourceThunk
      .addCase(addResourceThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(addResourceThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.selectedGroup) {
          if (!state.selectedGroup.groupResources) state.selectedGroup.groupResources = [];
          state.selectedGroup.groupResources.push(action.payload);
        }
      })
      .addCase(addResourceThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
  },
});

export const { 
  clearSelectedGroup, 
  clearError,
  addLocalMessage
} = studyGroupSlice.actions;

export const selectAllStudyGroups = (state) => state.studyGroups.groups;
export const selectMyStudyGroups = (state) => state.studyGroups.myGroups;
export const selectSelectedStudyGroup = (state) => state.studyGroups.selectedGroup;
export const selectStudyGroupLoading = (state) => state.studyGroups.loading;
export const selectStudyGroupActionLoading = (state) => state.studyGroups.actionLoading;
export const selectStudyGroupError = (state) => state.studyGroups.error;
export const selectStudyGroupPagination = (state) => state.studyGroups.pagination;

export default studyGroupSlice.reducer;
