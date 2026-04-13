import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllStudyGroups,
  getStudyGroupById,
  createStudyGroup as createStudyGroupApi,
  joinStudyGroup as joinStudyGroupApi,
  leaveStudyGroup as leaveStudyGroupApi,
  deleteStudyGroup as deleteStudyGroupApi,
  getStudyGroupResources,
  updateStudyGroup as updateStudyGroupApi,
  getStudyGroupMembers,
  getStudyGroupDiscussions,
  postDiscussionMessage as postDiscussionMessageApi,
} from '../../api/studyGroupApi';

// ─── Async Thunks (now calling real backend at /api/v1/study-groups) ─────────

export const fetchStudyGroups = createAsyncThunk('studyGroups/fetchAll', async (filters = {}, { rejectWithValue }) => {
  try {
    const response = await getAllStudyGroups(filters);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch study groups');
  }
});

export const fetchMyStudyGroups = createAsyncThunk('studyGroups/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const response = await getAllStudyGroups({ my: true });
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch my study groups');
  }
});

export const fetchStudyGroupById = createAsyncThunk('studyGroups/fetchById', async (groupId, { rejectWithValue }) => {
  try {
    const response = await getStudyGroupById(groupId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch study group');
  }
});

export const createStudyGroupThunk = createAsyncThunk('studyGroups/create', async (groupData, { rejectWithValue }) => {
  try {
    const response = await createStudyGroupApi(groupData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to create study group');
  }
});

export const updateStudyGroup = createAsyncThunk('studyGroups/update', async ({ id, ...groupData }, { rejectWithValue }) => {
  try {
    const response = await updateStudyGroupApi(id, groupData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to update study group');
  }
});

export const joinStudyGroupThunk = createAsyncThunk('studyGroups/join', async (groupId, { rejectWithValue }) => {
  try {
    await joinStudyGroupApi(groupId);
    return groupId;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to join study group');
  }
});

export const leaveStudyGroupThunk = createAsyncThunk('studyGroups/leave', async (groupId, { rejectWithValue }) => {
  try {
    await leaveStudyGroupApi(groupId);
    return groupId;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to leave study group');
  }
});

export const deleteStudyGroupThunk = createAsyncThunk('studyGroups/delete', async (groupId, { rejectWithValue }) => {
  try {
    await deleteStudyGroupApi(groupId);
    return groupId;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to delete study group');
  }
});

// Aliases for legacy component support
export const joinGroup = joinStudyGroupThunk;
export const leaveGroup = leaveStudyGroupThunk;
export const deleteGroup = deleteStudyGroupThunk;

export const fetchGroupResources = createAsyncThunk('studyGroups/fetchResources', async (groupId, { rejectWithValue }) => {
  try {
    const response = await getStudyGroupResources(groupId);
    return { groupId, resources: response.data };
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch resources');
  }
});

export const fetchGroupMembers = createAsyncThunk('studyGroups/fetchMembers', async (groupId, { rejectWithValue }) => {
  try {
    const response = await getStudyGroupMembers(groupId);
    return { groupId, members: response.data };
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch members');
  }
});

export const fetchGroupDiscussions = createAsyncThunk('studyGroups/fetchDiscussions', async (groupId, { rejectWithValue }) => {
  try {
    const response = await getStudyGroupDiscussions(groupId);
    return { groupId, discussions: response.data };
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch discussions');
  }
});

export const postDiscussionMessageThunk = createAsyncThunk('studyGroups/postMessage', async ({ groupId, message }, { rejectWithValue }) => {
  try {
    const response = await postDiscussionMessageApi(groupId, message);
    return { groupId, message: response.data };
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to post message');
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  groups: [],
  selectedGroup: null,
  myGroups: [],
  resources: {},
  messages: {},
  members: {},
  filter: 'all',
  sortBy: 'course',
  loading: false,
  error: null,
  actionLoading: {},
};

const studyGroupSlice = createSlice({
  name: 'studyGroups',
  initialState,
  reducers: {
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setStudyGroups: (state, action) => {
      state.groups = action.payload;
    },
    addStudyGroup: (state, action) => {
      state.groups.push(action.payload);
    },
    setGroupMembers: (state, action) => {
      const { groupId, members } = action.payload;
      state.members[groupId] = members;
    },
    setGroupResources: (state, action) => {
      const { groupId, resources } = action.payload;
      state.resources[groupId] = resources;
    },
    setGroupDiscussions: (state, action) => {
      const { groupId, discussions } = action.payload;
      state.discussions = state.discussions || {};
      state.discussions[groupId] = discussions;
    },
    // Keep these for socket-driven real-time updates
    setGroupMessages: (state, action) => {
      const { groupId, messages } = action.payload;
      state.messages[groupId] = messages;
    },
    addMessage: (state, action) => {
      const { groupId, message } = action.payload;
      if (!state.messages[groupId]) state.messages[groupId] = [];
      state.messages[groupId].push(message);
    },
    clearStudyGroupError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchStudyGroups
    builder
      .addCase(fetchStudyGroups.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStudyGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = Array.isArray(action.payload) ? action.payload : (action.payload?.docs || action.payload?.studyGroups || []);
      })
      .addCase(fetchStudyGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchMyStudyGroups
    builder
      .addCase(fetchMyStudyGroups.fulfilled, (state, action) => {
        state.myGroups = Array.isArray(action.payload) ? action.payload : (action.payload?.docs || action.payload?.studyGroups || []);
      });

    // fetchStudyGroupById
    builder
      .addCase(fetchStudyGroupById.fulfilled, (state, action) => {
        state.selectedGroup = action.payload;
      });

    // createStudyGroupThunk
    builder
      .addCase(createStudyGroupThunk.fulfilled, (state, action) => {
        state.groups.push(action.payload);
        state.myGroups.push(action.payload);
      });

    // joinStudyGroupThunk
    builder
      .addCase(joinStudyGroupThunk.pending, (state, action) => { state.actionLoading[action.meta.arg] = true; })
      .addCase(joinStudyGroupThunk.fulfilled, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        const group = state.groups.find(g => g._id === action.payload);
        if (group && !state.myGroups.find(g => g._id === action.payload)) {
          state.myGroups.push(group);
        }
      })
      .addCase(joinStudyGroupThunk.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.error = action.payload;
      });

    // leaveStudyGroupThunk
    builder
      .addCase(leaveStudyGroupThunk.pending, (state, action) => { state.actionLoading[action.meta.arg] = true; })
      .addCase(leaveStudyGroupThunk.fulfilled, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.myGroups = state.myGroups.filter(g => g._id !== action.payload);
      })
      .addCase(leaveStudyGroupThunk.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.error = action.payload;
      });

    // deleteStudyGroupThunk
    builder
      .addCase(deleteStudyGroupThunk.fulfilled, (state, action) => {
        state.groups = state.groups.filter(g => g._id !== action.payload);
        state.myGroups = state.myGroups.filter(g => g._id !== action.payload);
      });

    // fetchGroupResources
    builder
      .addCase(fetchGroupResources.fulfilled, (state, action) => {
        state.resources[action.payload.groupId] = action.payload.resources;
      });

    // updateStudyGroup
    builder
      .addCase(updateStudyGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(g => g._id === action.payload._id);
        if (index !== -1) state.groups[index] = action.payload;
        if (state.selectedGroup?._id === action.payload._id) state.selectedGroup = action.payload;
      });

    // fetchGroupMembers
    builder
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        state.members[action.payload.groupId] = action.payload.members;
      });

    // fetchGroupDiscussions
    builder
      .addCase(fetchGroupDiscussions.fulfilled, (state, action) => {
        state.discussions = state.discussions || {};
        state.discussions[action.payload.groupId] = action.payload.discussions;
      });

    // postDiscussionMessageThunk
    builder
      .addCase(postDiscussionMessageThunk.fulfilled, (state, action) => {
        const { groupId, message } = action.payload;
        if (!state.discussions) state.discussions = {};
        if (!state.discussions[groupId]) state.discussions[groupId] = [];
        state.discussions[groupId].push(message);
      });
  },
});

// Actions
export const {
  setSelectedGroup,
  setFilter,
  setSortBy,
  setStudyGroups,
  addStudyGroup,
  setGroupMembers,
  setGroupResources,
  setGroupDiscussions,
  setGroupMessages,
  addMessage,
  clearStudyGroupError,
} = studyGroupSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAllStudyGroups = (state) => state.studyGroups?.groups || [];
export const selectMyStudyGroups = (state) => state.studyGroups?.myGroups || [];
export const selectSelectedGroup = (state) => state.studyGroups?.selectedGroup || null;
export const selectStudyGroupFilter = (state) => state.studyGroups?.filter || 'all';
export const selectStudyGroupSortBy = (state) => state.studyGroups?.sortBy || 'course';
export const selectStudyGroupLoading = (state) => state.studyGroups?.loading || false;
export const selectStudyGroupError = (state) => state.studyGroups?.error || null;

export const selectStudyGroupById = (groupId) => (state) =>
  (state.studyGroups?.groups || []).find((group) => group._id === groupId);

export const selectGroupResources = (groupId) => (state) =>
  state.studyGroups?.resources?.[groupId] || [];

export const selectGroupMembers = (groupId) => (state) =>
  state.studyGroups?.members?.[groupId] || [];

export const selectGroupDiscussions = (groupId) => (state) =>
  state.studyGroups?.discussions?.[groupId] || [];

export const selectGroupMessages = (groupId) => (state) =>
  state.studyGroups?.messages?.[groupId] || [];

export const selectFilteredStudyGroups = (state) => {
  const groups = state.studyGroups?.groups || [];
  const filter = state.studyGroups?.filter || 'all';
  if (filter === 'all') return groups;
  return groups.filter((group) => group.subject === filter || group.category === filter);
};

export const selectSortedStudyGroups = (state) => {
  const filtered = selectFilteredStudyGroups(state);
  const sortBy = state.studyGroups?.sortBy || 'course';
  return [...filtered].sort((a, b) => {
    if (sortBy === 'course') return (a.course || '').localeCompare(b.course || '');
    if (sortBy === 'popularity') return (b.memberCount || 0) - (a.memberCount || 0);
    return 0;
  });
};

export default studyGroupSlice.reducer;
