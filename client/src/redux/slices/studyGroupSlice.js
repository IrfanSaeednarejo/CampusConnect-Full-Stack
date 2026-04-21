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

export const updateStudyGroupThunk = createAsyncThunk(
  'studyGroups/update',
  async ({ id, data: updateData }, { rejectWithValue }) => {
    try {
      const { data } = await studyGroupApi.updateStudyGroup(id, updateData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update study group');
    }
  }
);

export const deleteStudyGroupThunk = createAsyncThunk(
  'studyGroups/delete',
  async (id, { rejectWithValue }) => {
    try {
      await studyGroupApi.deleteStudyGroup(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete study group');
    }
  }
);

export const approveMemberThunk = createAsyncThunk(
  'studyGroups/approveMember',
  async ({ groupId, memberUserId }, { rejectWithValue }) => {
    try {
      const { data } = await studyGroupApi.approveMember(groupId, memberUserId);
      return { groupId, memberUserId, ...data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to approve member');
    }
  }
);

export const rejectMemberThunk = createAsyncThunk(
  'studyGroups/rejectMember',
  async ({ groupId, memberUserId }, { rejectWithValue }) => {
    try {
      const { data } = await studyGroupApi.rejectMember(groupId, memberUserId);
      return { groupId, memberUserId, ...data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to reject join request');
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
    },
    setGroupResources: (state, action) => {
      const { groupId, resources } = action.payload;
      state.resources = resources;
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

      .addCase(addResourceThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })

      // updateStudyGroupThunk
      .addCase(updateStudyGroupThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(updateStudyGroupThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        const id = updated._id || updated.id;
        state.groups = state.groups.map(g => (g._id || g.id) === id ? updated : g);
        state.myGroups = state.myGroups.map(g => (g._id || g.id) === id ? updated : g);
        if (state.selectedGroup?._id === id || state.selectedGroup?.id === id) {
          state.selectedGroup = updated;
        }
      })
      .addCase(updateStudyGroupThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })

      // deleteStudyGroupThunk
      .addCase(deleteStudyGroupThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(deleteStudyGroupThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.payload;
        state.groups = state.groups.filter(g => (g._id || g.id) !== id);
        state.myGroups = state.myGroups.filter(g => (g._id || g.id) !== id);
        if (state.selectedGroup?._id === id || state.selectedGroup?.id === id) {
          state.selectedGroup = null;
        }
      })
      .addCase(deleteStudyGroupThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })

      // approveMemberThunk
      .addCase(approveMemberThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(approveMemberThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { memberUserId } = action.payload;
        if (state.selectedGroup) {
          const index = state.selectedGroup.groupMembers.findIndex(m => (m.memberId._id || m.memberId) === memberUserId);
          if (index !== -1) {
            state.selectedGroup.groupMembers[index].status = 'approved';
            state.selectedGroup.memberCount += 1;
          }
        }
      })
      .addCase(approveMemberThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })

      // rejectMemberThunk
      .addCase(rejectMemberThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(rejectMemberThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { memberUserId } = action.payload;
        if (state.selectedGroup) {
          state.selectedGroup.groupMembers = state.selectedGroup.groupMembers.filter(m => (m.memberId._id || m.memberId) !== memberUserId);
        }
      })
      .addCase(rejectMemberThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
  },
});

export const { 
  clearSelectedGroup, 
  clearError,
  addLocalMessage,
  setGroupResources,
} = studyGroupSlice.actions;

export const joinGroup = joinStudyGroupThunk;
export const updateStudyGroup = updateStudyGroupThunk;
export const deleteStudyGroup = deleteStudyGroupThunk;

export const selectAllStudyGroups = (state) => state.studyGroups.groups;
export const selectMyStudyGroups = (state) => state.studyGroups.myGroups;
export const selectSelectedStudyGroup = (state) => state.studyGroups.selectedGroup;
export const selectStudyGroupLoading = (state) => state.studyGroups.loading;
export const selectStudyGroupActionLoading = (state) => state.studyGroups.actionLoading;
export const selectStudyGroupError = (state) => state.studyGroups.error;
export const selectStudyGroupPagination = (state) => state.studyGroups.pagination;

export const selectStudyGroupById = (id) => (state) => 
  state.studyGroups.groups.find(g => String(g._id || g.id) === String(id)) || 
  state.studyGroups.myGroups.find(g => String(g._id || g.id) === String(id)) ||
  (state.studyGroups.selectedGroup?._id === id || state.studyGroups.selectedGroup?.id === id ? state.studyGroups.selectedGroup : null);

export const selectGroupResources = (id) => (state) => state.studyGroups.resources;

export default studyGroupSlice.reducer;
