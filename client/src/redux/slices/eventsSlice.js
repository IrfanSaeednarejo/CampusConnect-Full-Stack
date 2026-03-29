import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllEvents, getEventById } from '../../api/eventApi';

// Thunks — now calling the real backend at /api/v1/competitions
export const fetchEvents = createAsyncThunk('events/fetchAll', async (filters = {}, { rejectWithValue }) => {
  try {
    const response = await getAllEvents(filters);
    // Backend returns ApiResponse: { statusCode, data, message, success }
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch events');
  }
});

export const fetchEventById = createAsyncThunk('events/fetchById', async (eventId, { rejectWithValue }) => {
  try {
    const response = await getEventById(eventId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch event');
  }
});

// Register for an event — creates a solo team (backend uses team-based model)
export const registerForEvent = createAsyncThunk('events/register', async (eventId, { rejectWithValue }) => {
  try {
    const { createTeam } = await import('../../api/eventApi');
    const response = await createTeam(eventId, { name: `Solo-${Date.now()}` });
    return { eventId, team: response.data || response };
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to register for event');
  }
});

// Cancel event registration — leave the team
export const cancelEventRegistration = createAsyncThunk('events/cancelRegistration', async ({ eventId, teamId }, { rejectWithValue }) => {
  try {
    const { leaveTeam } = await import('../../api/eventApi');
    await leaveTeam(eventId, teamId);
    return { eventId };
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to cancel registration');
  }
});


// Slice
const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    currentEvent: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    actionLoading: {},
  },
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
  },
  extraReducers: (builder) => {
    // fetchEvents
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Backend returns paginated object with `docs` or sometimes an array directly
        const pl = action.payload || {};
        state.items = Array.isArray(pl) ? pl : (pl.docs || pl.events || pl.items || []);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });

    // fetchEventById
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.actionLoading.currentEvent = true;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.actionLoading.currentEvent = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.actionLoading.currentEvent = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const { clearCurrentEvent } = eventsSlice.actions;
export default eventsSlice.reducer;

import { createSelector } from '@reduxjs/toolkit';

export const selectAllEvents = (state) => state.eventsLegacy?.items || state.events?.items || [];
export const selectCurrentEvent = (state) => state.eventsLegacy?.currentEvent || state.events?.currentEvent || null;
export const selectEventsStatus = (state) => state.eventsLegacy?.status || state.events?.status || 'idle';
export const selectEventsError = (state) => state.eventsLegacy?.error || state.events?.error || null;

export const selectUpcomingEvents = createSelector(
  [selectAllEvents],
  (events) => {
    const now = new Date();
    return events.filter(e => new Date(e.startAt) > now);
  }
);

export const selectPastEvents = createSelector(
  [selectAllEvents],
  (events) => {
    const now = new Date();
    return events.filter(e => new Date(e.endAt) < now);
  }
);

export const selectOngoingEvents = createSelector(
  [selectAllEvents],
  (events) => {
    const now = new Date();
    return events.filter(e => new Date(e.startAt) <= now && new Date(e.endAt) >= now);
  }
);

export const selectEventActionLoading = (state, eventId) => !!(state.eventsLegacy?.actionLoading?.[eventId] || state.events?.actionLoading?.[eventId]);
