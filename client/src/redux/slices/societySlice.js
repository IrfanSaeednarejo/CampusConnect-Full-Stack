import { createSlice } from '@reduxjs/toolkit';

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
      const index = state.societies.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.societies[index] = { ...state.societies[index], ...action.payload };
      }
    },
    removeSociety: (state, action) => {
      state.societies = state.societies.filter((s) => s.id !== action.payload);
    },
    joinSociety: (state, action) => {
      const society = state.societies.find((s) => s.id === action.payload);
      if (society && !state.registeredSocieties.find((s) => s.id === action.payload)) {
        state.registeredSocieties.push(society);
      }
    },
    leaveSociety: (state, action) => {
      state.registeredSocieties = state.registeredSocieties.filter(
        (s) => s.id !== action.payload
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
      state.memberRequests = state.memberRequests.filter((r) => r.id !== action.payload);
    },
    approveMemberRequest: (state, action) => {
      state.memberRequests = state.memberRequests.filter((r) => r.id !== action.payload);
    },
    rejectMemberRequest: (state, action) => {
      state.memberRequests = state.memberRequests.filter((r) => r.id !== action.payload);
    },
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
  state.societies.societies.find((society) => society.id === societyId);

// Reducer
export default societySlice.reducer;
