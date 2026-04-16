import { createSlice } from '@reduxjs/toolkit';

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
      const index = state.groups.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = { ...state.groups[index], ...action.payload };
      }
    },
    removeStudyGroup: (state, action) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
    },
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },
    setMyGroups: (state, action) => {
      state.myGroups = action.payload;
    },
    joinGroup: (state, action) => {
      const group = state.groups.find((g) => g.id === action.payload);
      if (group && !state.myGroups.find((g) => g.id === action.payload)) {
        state.myGroups.push(group);
        group.members = (group.members || 0) + 1;
      }
    },
    leaveGroup: (state, action) => {
      state.myGroups = state.myGroups.filter((g) => g.id !== action.payload);
      const group = state.groups.find((g) => g.id === action.payload);
      if (group && group.members > 0) {
        group.members -= 1;
      }
    },
    setGroupResources: (state, action) => {
      const { groupId, resources } = action.payload;
      state.resources[groupId] = resources;
    },
    addResource: (state, action) => {
      const { groupId, resource } = action.payload;
      if (!state.resources[groupId]) {
    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchStudyGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudyGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchStudyGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My
      .addCase(fetchMyStudyGroups.fulfilled, (state, action) => {
        state.myGroups = action.payload;
      })
      // Fetch By Id
      .addCase(fetchStudyGroupById.fulfilled, (state, action) => {
        state.selectedGroup = action.payload;
      })
      // Create
      .addCase(createStudyGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
        state.myGroups.push(action.payload);
      })
      // Join
      .addCase(joinStudyGroup.fulfilled, (state, action) => {
        state.myGroups.push(action.payload);
      })
      // Leave
      .addCase(leaveStudyGroup.fulfilled, (state, action) => {
        state.myGroups = state.myGroups.filter(g => g.id !== action.payload && g._id !== action.payload);
      });
  },
});

export const { clearSelectedGroup, clearError } = studyGroupSlice.actions;

export const selectAllStudyGroups = (state) => state.studyGroups.groups;
export const selectMyStudyGroups = (state) => state.studyGroups.myGroups;
export const selectSelectedStudyGroup = (state) => state.studyGroups.selectedGroup;
export const selectStudyGroupLoading = (state) => state.studyGroups.loading;
export const selectStudyGroupError = (state) => state.studyGroups.error;

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
    if (sortBy === 'course') return a.course.localeCompare(b.course);
    if (sortBy === 'popularity') return b.members - a.members;
    return 0;
  });
};

export default studyGroupSlice.reducer;
