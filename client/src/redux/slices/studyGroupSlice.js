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
        state.resources[groupId] = [];
      }
      state.resources[groupId].push(resource);
    },
    removeResource: (state, action) => {
      const { groupId, resourceId } = action.payload;
      if (state.resources[groupId]) {
        state.resources[groupId] = state.resources[groupId].filter(
          (r) => r.id !== resourceId
        );
      }
    },
    setGroupMessages: (state, action) => {
      const { groupId, messages } = action.payload;
      state.messages[groupId] = messages;
    },
    addMessage: (state, action) => {
      const { groupId, message } = action.payload;
      if (!state.messages[groupId]) {
        state.messages[groupId] = [];
      }
      state.messages[groupId].push(message);
    },
    setGroupDiscussions: (state, action) => {
      const { groupId, discussions } = action.payload;
      state.discussions[groupId] = discussions;
    },
    addDiscussion: (state, action) => {
      const { groupId, discussion } = action.payload;
      if (!state.discussions[groupId]) {
        state.discussions[groupId] = [];
      }
      state.discussions[groupId].push(discussion);
    },
    setGroupMembers: (state, action) => {
      const { groupId, members } = action.payload;
      state.members[groupId] = members;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setStudyGroupLoading: (state, action) => {
      state.loading = action.payload;
    },
    setStudyGroupError: (state, action) => {
      state.error = action.payload;
    },
    clearStudyGroupError: (state) => {
      state.error = null;
    },
  },
});

// Actions
export const {
  setStudyGroups,
  addStudyGroup,
  updateStudyGroup,
  removeStudyGroup,
  setSelectedGroup,
  setMyGroups,
  joinGroup,
  leaveGroup,
  setGroupResources,
  addResource,
  removeResource,
  setGroupMessages,
  addMessage,
  setGroupDiscussions,
  addDiscussion,
  setGroupMembers,
  setFilter,
  setSortBy,
  setStudyGroupLoading,
  setStudyGroupError,
  clearStudyGroupError,
} = studyGroupSlice.actions;

// Selectors
export const selectAllStudyGroups = (state) => state.studyGroups.groups;
export const selectMyStudyGroups = (state) => state.studyGroups.myGroups;
export const selectSelectedGroup = (state) => state.studyGroups.selectedGroup;
export const selectStudyGroupFilter = (state) => state.studyGroups.filter;
export const selectStudyGroupSortBy = (state) => state.studyGroups.sortBy;
export const selectStudyGroupLoading = (state) => state.studyGroups.loading;
export const selectStudyGroupError = (state) => state.studyGroups.error;

export const selectStudyGroupById = (groupId) => (state) =>
  state.studyGroups.groups.find((group) => group.id === parseInt(groupId));

export const selectGroupResources = (groupId) => (state) =>
  state.studyGroups.resources[groupId] || [];

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

// Reducer
export default studyGroupSlice.reducer;
