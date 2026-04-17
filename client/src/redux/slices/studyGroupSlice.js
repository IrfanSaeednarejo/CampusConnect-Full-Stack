import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as agentApi from '../../api/agentApi'; // Assuming study group APIs might be here or in a separate file, but using placeholder to define structure

// Mock API calls for now if specific API file not found, but defining thunks
export const fetchStudyGroups = createAsyncThunk('studyGroups/fetchAll', async (_, { rejectWithValue }) => {
  try { return []; } catch (err) { return rejectWithValue(err.message); }
});

export const fetchMyStudyGroups = createAsyncThunk('studyGroups/fetchMy', async (_, { rejectWithValue }) => {
  try { return []; } catch (err) { return rejectWithValue(err.message); }
});

export const fetchStudyGroupById = createAsyncThunk('studyGroups/fetchById', async (id, { rejectWithValue }) => {
  try { return null; } catch (err) { return rejectWithValue(err.message); }
});

export const createStudyGroup = createAsyncThunk('studyGroups/create', async (data, { rejectWithValue }) => {
  try { return data; } catch (err) { return rejectWithValue(err.message); }
});

export const joinStudyGroup = createAsyncThunk('studyGroups/join', async (id, { rejectWithValue }) => {
  try { return id; } catch (err) { return rejectWithValue(err.message); }
});

export const leaveStudyGroup = createAsyncThunk('studyGroups/leave', async (id, { rejectWithValue }) => {
  try { return id; } catch (err) { return rejectWithValue(err.message); }
});

const initialState = {
  groups: [],
  selectedGroup: null,
  myGroups: [],
  resources: {},
  messages: {},
  discussions: {},
  members: {},
  filter: 'all',
  sortBy: 'course',
  loading: false,
  error: null,
};

const studyGroupSlice = createSlice({
  name: 'studyGroups',
  initialState,
  reducers: {
    setStudyGroups: (state, action) => {
      state.groups = action.payload;
    },
    addStudyGroup: (state, action) => {
      state.groups.push(action.payload);
    },
    updateStudyGroup: (state, action) => {
      const index = state.groups.findIndex((g) => g.id === action.payload.id || g._id === action.payload._id);
      if (index !== -1) {
        state.groups[index] = { ...state.groups[index], ...action.payload };
      }
    },
    removeStudyGroup: (state, action) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload && g._id !== action.payload);
    },
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },
    setMyGroups: (state, action) => {
      state.myGroups = action.payload;
    },
    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudyGroups.pending, (state) => { state.loading = true; })
      .addCase(fetchStudyGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload || [];
      })
      .addCase(fetchStudyGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyStudyGroups.fulfilled, (state, action) => {
        state.myGroups = action.payload || [];
      })
      .addCase(fetchStudyGroupById.fulfilled, (state, action) => {
        state.selectedGroup = action.payload;
      })
      .addCase(createStudyGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
        state.myGroups.push(action.payload);
      })
      .addCase(joinStudyGroup.fulfilled, (state, action) => {
        const group = state.groups.find(g => g.id === action.payload || g._id === action.payload);
        if (group && !state.myGroups.some(g => g.id === action.payload || g._id === action.payload)) {
           state.myGroups.push(group);
        }
      })
      .addCase(leaveStudyGroup.fulfilled, (state, action) => {
        state.myGroups = state.myGroups.filter(g => g.id !== action.payload && g._id !== action.payload);
      });
  },
});

export const { 
  setStudyGroups, 
  addStudyGroup, 
  updateStudyGroup, 
  removeStudyGroup, 
  setSelectedGroup, 
  setMyGroups, 
  clearSelectedGroup, 
  clearError 
} = studyGroupSlice.actions;

export const selectAllStudyGroups = (state) => state.studyGroups.groups;
export const selectMyStudyGroups = (state) => state.studyGroups.myGroups;
export const selectSelectedStudyGroup = (state) => state.studyGroups.selectedGroup;
export const selectStudyGroupLoading = (state) => state.studyGroups.loading;
export const selectStudyGroupError = (state) => state.studyGroups.error;
export const selectStudyGroupById = (id) => (state) => 
  state.studyGroups.groups.find(g => g.id === id || g._id === id) || 
  state.studyGroups.myGroups.find(g => g.id === id || g._id === id);

export const selectGroupMessages = (groupId) => (state) =>
  state.studyGroups.messages[groupId] || [];

export const selectGroupDiscussions = (groupId) => (state) =>
  state.studyGroups.discussions[groupId] || [];

export const selectGroupMembers = (groupId) => (state) =>
  state.studyGroups.members[groupId] || [];

export const selectFilteredStudyGroups = (state) => {
  const { groups, filter } = state.studyGroups;
  if (filter === 'all') return groups;
  return groups.filter((group) => group.category === filter);
};

export const selectSortedStudyGroups = (state) => {
  const filtered = selectFilteredStudyGroups(state);
  const { sortBy } = state.studyGroups;

  return [...filtered].sort((a, b) => {
    if (sortBy === 'course') return a.course?.localeCompare(b.course || "") || 0;
    if (sortBy === 'popularity') return (b.members || 0) - (a.members || 0);
    return 0;
  });
};

export default studyGroupSlice.reducer;
