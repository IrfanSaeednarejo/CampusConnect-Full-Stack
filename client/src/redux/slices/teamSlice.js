import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as eventApi from '../../api/eventApi';

// Async Thunks
export const fetchTeams = createAsyncThunk(
  'team/fetchTeams',
  async ({ eventId, params }, { rejectWithValue }) => {
    try {
      const response = await eventApi.getTeams(eventId, params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMyTeam = createAsyncThunk(
  'team/fetchMyTeam',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventApi.getMyTeam(eventId);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createTeamThunk = createAsyncThunk(
  'team/createTeam',
  async ({ eventId, data }, { rejectWithValue }) => {
    try {
      const response = await eventApi.createTeam(eventId, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const joinTeamThunk = createAsyncThunk(
  'team/joinTeam',
  async ({ eventId, teamId, data }, { rejectWithValue }) => {
    try {
      const response = await eventApi.joinTeam(eventId, teamId, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const leaveTeamThunk = createAsyncThunk(
  'team/leaveTeam',
  async ({ eventId, teamId }, { rejectWithValue }) => {
    try {
      await eventApi.leaveTeam(eventId, teamId);
      return teamId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const kickMemberThunk = createAsyncThunk(
  'team/kickMember',
  async ({ eventId, teamId, userId }, { rejectWithValue }) => {
    try {
      await eventApi.kickMember(eventId, teamId, userId);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const transferLeadershipThunk = createAsyncThunk(
  'team/transferLeadership',
  async ({ eventId, teamId, newLeaderId }, { rejectWithValue }) => {
    try {
      const response = await eventApi.transferLeadership(eventId, teamId, { newLeaderId });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const disqualifyTeamThunk = createAsyncThunk(
  'team/disqualifyTeam',
  async ({ eventId, teamId }, { rejectWithValue }) => {
    try {
      const response = await eventApi.disqualifyTeam(eventId, teamId, { disqualified: true });
      return response.data.data; // usually updated team or id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice
const teamSlice = createSlice({
  name: 'team',
  initialState: {
    teams: [],
    myTeam: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTeamError: (state) => {
      state.error = null;
    },
    resetTeamState: (state) => {
      state.teams = [];
      state.myTeam = null;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teams
      .addCase(fetchTeams.pending, (state) => { state.loading = true; })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
        state.error = null;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch My Team
      .addCase(fetchMyTeam.pending, (state) => { state.loading = true; })
      .addCase(fetchMyTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeam = action.payload;
        state.error = null;
      })
      .addCase(fetchMyTeam.rejected, (state, action) => {
        state.loading = false;
        // Setting myTeam null heavily since this endpoint 404s if user has no team
        state.myTeam = null; 
      })

      // Create Team
      .addCase(createTeamThunk.pending, (state) => { state.loading = true; })
      .addCase(createTeamThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeam = action.payload;
        state.teams.push(action.payload);
        state.error = null;
      })
      .addCase(createTeamThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Join Team
      .addCase(joinTeamThunk.pending, (state) => { state.loading = true; })
      .addCase(joinTeamThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeam = action.payload;
        
        // Update it in the teams list as well
        const idx = state.teams.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.teams[idx] = action.payload;
        
        state.error = null;
      })
      .addCase(joinTeamThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Leave Team
      .addCase(leaveTeamThunk.pending, (state) => { state.loading = true; })
      .addCase(leaveTeamThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeam = null;
        state.error = null;
      })
      .addCase(leaveTeamThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Kick Member
      .addCase(kickMemberThunk.pending, (state) => { state.loading = true; })
      .addCase(kickMemberThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (state.myTeam) {
           state.myTeam.members = state.myTeam.members.filter(m => (m.user?._id || m.userId) !== action.payload);
        }
        state.error = null;
      })
      .addCase(kickMemberThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Transfer Leadership
      .addCase(transferLeadershipThunk.pending, (state) => { state.loading = true; })
      .addCase(transferLeadershipThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeam = action.payload; // Endpoint returns updated team
        state.error = null;
      })
      .addCase(transferLeadershipThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Disqualify Team
      .addCase(disqualifyTeamThunk.pending, (state) => { state.loading = true; })
      .addCase(disqualifyTeamThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the teams list if it's cached in this slice, but Team Management Flow fetches all via fetchTeams.
        state.error = null;
      })
      .addCase(disqualifyTeamThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearTeamError, resetTeamState } = teamSlice.actions;

export const selectTeams = (state) => state.teams.teams;
export const selectMyTeam = (state) => state.teams.myTeam;
export const selectTeamLoading = (state) => state.teams.loading;
export const selectTeamError = (state) => state.teams.error;

export default teamSlice.reducer;
