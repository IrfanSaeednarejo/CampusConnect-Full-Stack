import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  members: [],
  filteredMembers: [],
  searchQuery: '',
  loading: false,
  error: null,
};

const memberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setMembers: (state, action) => {
      state.members = action.payload;
      state.filteredMembers = action.payload;
    },
    addMember: (state, action) => {
      state.members.push(action.payload);
      state.filteredMembers = state.members;
    },
    updateMember: (state, action) => {
      const index = state.members.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = { ...state.members[index], ...action.payload };
        state.filteredMembers = state.members;
      }
    },
    removeMember: (state, action) => {
      state.members = state.members.filter((m) => m.id !== action.payload);
      state.filteredMembers = state.members;
    },
    searchMembers: (state, action) => {
      state.searchQuery = action.payload;
      if (!action.payload) {
        state.filteredMembers = state.members;
      } else {
        const query = action.payload.toLowerCase();
        state.filteredMembers = state.members.filter(
          (member) =>
            member.name.toLowerCase().includes(query) ||
            member.role.toLowerCase().includes(query) ||
            member.interests.some((interest) =>
              interest.toLowerCase().includes(query)
            )
        );
      }
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.filteredMembers = state.members;
    },
    setMemberLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMemberError: (state, action) => {
      state.error = action.payload;
    },
    clearMemberError: (state) => {
      state.error = null;
    },
  },
});

// Actions
export const {
  setMembers,
  addMember,
  updateMember,
  removeMember,
  searchMembers,
  clearSearch,
  setMemberLoading,
  setMemberError,
  clearMemberError,
} = memberSlice.actions;

// Selectors
export const selectAllMembers = (state) => state.members.members;
export const selectFilteredMembers = (state) => state.members.filteredMembers;
export const selectSearchQuery = (state) => state.members.searchQuery;
export const selectMemberLoading = (state) => state.members.loading;
export const selectMemberError = (state) => state.members.error;
export const selectMemberById = (memberId) => (state) =>
  state.members.members.find((member) => member.id === memberId);

// Reducer
export default memberSlice.reducer;
