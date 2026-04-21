import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as eventApi from '../../api/eventApi';

// ── Helpers ───────────────────────────────────────────────────────────────────
const errMsg = (err) => err.response?.data?.message || err.message || 'Unknown error';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchEvents = createAsyncThunk('events/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.getCompetitions(params);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const fetchEventById = createAsyncThunk('events/fetchById',
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.getCompetitionById(eventId);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const createEventThunk = createAsyncThunk('events/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.createCompetition(formData);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const updateEventThunk = createAsyncThunk('events/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.updateCompetition(id, formData);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const deleteEventThunk = createAsyncThunk('events/delete',
  async (eventId, { rejectWithValue }) => {
    try {
      await eventApi.deleteCompetition(eventId);
      return eventId;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const transitionStateThunk = createAsyncThunk('events/transitionState',
  async ({ id, stateData }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.transitionState(id, stateData);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const publishLeaderboardThunk = createAsyncThunk('events/publishLeaderboard',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.publishLeaderboard(id);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const registerForEventThunk = createAsyncThunk('events/register',
  async ({ eventId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.registerForEvent(eventId, formData);
      return { eventId, registration: data.data };
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const fetchRegistrationsThunk = createAsyncThunk('events/fetchRegistrations',
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.getEventRegistrations(eventId);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const approveRegistrationThunk = createAsyncThunk('events/approveRegistration',
  async ({ eventId, userId }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.approveRegistration(eventId, userId);
      return { eventId, userId, registration: data.data };
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const rejectRegistrationThunk = createAsyncThunk('events/rejectRegistration',
  async ({ eventId, userId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.rejectRegistration(eventId, userId, reason);
      return { eventId, userId, registration: data.data };
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const fetchAnnouncementsThunk = createAsyncThunk('events/fetchAnnouncements',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.getAnnouncements(id);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const postAnnouncementThunk = createAsyncThunk('events/postAnnouncement',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.postAnnouncement(id, payload);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const fetchLeaderboardThunk = createAsyncThunk('events/fetchLeaderboard',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.getLeaderboard(id);
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

export const updateJudgesThunk = createAsyncThunk('events/updateJudges',
  async ({ id, judgeIds }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.updateJudges(id, { judgeIds });
      return data.data;
    } catch (err) { return rejectWithValue(errMsg(err)); }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  events:        [],
  currentEvent:  null,
  registrations: [],
  myEvents:      [],        // derived client-side or separate fetch
  announcements: [],
  leaderboard:   [],
  pagination:    { page: 1, total: 0, hasMore: false },
  loading:       false,
  actionLoading: false,     // for mutations (create/update/delete/transition)
  error:         null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.announcements = [];
      state.leaderboard = [];
    },
    clearError: (state) => { state.error = null; },
    setEvents:  (state, action) => { state.events = action.payload; },

    // Real-time socket updates
    socketAddAnnouncement: (state, action) => {
      const ann = action.payload;
      if (!state.announcements.some(a => a._id === ann._id)) {
        state.announcements.unshift(ann);
      }
    },
    socketUpdateEventStatus: (state, action) => {
      const { eventId, status } = action.payload;
      if (state.currentEvent?._id === eventId) state.currentEvent.status = status;
      const idx = state.events.findIndex(e => e._id === eventId);
      if (idx !== -1) state.events[idx] = { ...state.events[idx], status };
    },
    socketUpdateLeaderboard: (state, action) => {
      // Caller should re-fetch leaderboard on this event
      if (state.currentEvent?._id === action.payload.eventId) {
        state.leaderboard = action.payload.leaderboard ?? state.leaderboard;
      }
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    // fetchEvents
    builder
      .addCase(fetchEvents.pending, pending)
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.events = payload;
        } else {
          state.events = payload?.docs ?? payload?.items ?? payload?.events ?? [];
          state.pagination = payload?.pagination ?? state.pagination;
        }
      })
      .addCase(fetchEvents.rejected, rejected);

    // fetchEventById
    builder
      .addCase(fetchEventById.pending, pending)
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, rejected);

    // createEventThunk
    builder
      .addCase(createEventThunk.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createEventThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.events.unshift(action.payload);
        state.currentEvent = action.payload;
      })
      .addCase(createEventThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // updateEventThunk
    builder
      .addCase(updateEventThunk.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(updateEventThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        const idx = state.events.findIndex(e => e._id === updated._id);
        if (idx !== -1) state.events[idx] = updated;
        if (state.currentEvent?._id === updated._id) state.currentEvent = updated;
      })
      .addCase(updateEventThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // deleteEventThunk
    builder
      .addCase(deleteEventThunk.fulfilled, (state, action) => {
        state.events = state.events.filter(e => e._id !== action.payload);
        if (state.currentEvent?._id === action.payload) state.currentEvent = null;
      });

    // transitionStateThunk
    builder
      .addCase(transitionStateThunk.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(transitionStateThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        if (state.currentEvent?._id === updated._id) state.currentEvent = updated;
        const idx = state.events.findIndex(e => e._id === updated._id);
        if (idx !== -1) state.events[idx] = updated;
      })
      .addCase(transitionStateThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // publishLeaderboard
    builder
      .addCase(publishLeaderboardThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(publishLeaderboardThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.currentEvent?._id === action.payload._id) state.currentEvent = action.payload;
      })
      .addCase(publishLeaderboardThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // registerForEventThunk
    builder
      .addCase(registerForEventThunk.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(registerForEventThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Optionally update the event status/registrations if needed
        // but typically the UI will wait for redirect or showing success
        if (state.currentEvent?._id === action.payload.eventId) {
          state.currentEvent.registrations.push(action.payload.registration);
        }
      })
      .addCase(registerForEventThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // fetchRegistrationsThunk
    builder
      .addCase(fetchRegistrationsThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRegistrationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.registrations = action.payload;
      })
      .addCase(fetchRegistrationsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // approveRegistrationThunk
    builder
      .addCase(approveRegistrationThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(approveRegistrationThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload.registration;
        const idx = state.registrations.findIndex(r => r.userId?._id === updated.userId?._id || r.userId === updated.userId);
        if (idx !== -1) state.registrations[idx] = updated;
      })
      .addCase(approveRegistrationThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // rejectRegistrationThunk
    builder
      .addCase(rejectRegistrationThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(rejectRegistrationThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload.registration;
        const idx = state.registrations.findIndex(r => r.userId?._id === updated.userId?._id || r.userId === updated.userId);
        if (idx !== -1) state.registrations[idx] = updated;
      })
      .addCase(rejectRegistrationThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // fetchAnnouncementsThunk
    builder
      .addCase(fetchAnnouncementsThunk.pending, (state) => { /* do not set global loading */ })
      .addCase(fetchAnnouncementsThunk.fulfilled, (state, action) => {
        state.announcements = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAnnouncementsThunk.rejected, (state) => { /* do not set global loading */ });

    // postAnnouncementThunk
    builder
      .addCase(postAnnouncementThunk.fulfilled, (state, action) => {
        if (action.payload) state.announcements.unshift(action.payload);
      });

    // fetchLeaderboardThunk
    builder
      .addCase(fetchLeaderboardThunk.fulfilled, (state, action) => {
        state.leaderboard = Array.isArray(action.payload) ? action.payload : [];
      });

    // updateJudgesThunk
    builder
      .addCase(updateJudgesThunk.pending, (state) => { state.actionLoading = true; })
      .addCase(updateJudgesThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.currentEvent?._id === action.payload._id) state.currentEvent = action.payload;
      })
      .addCase(updateJudgesThunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
  },
});

export const {
  clearCurrentEvent,
  clearError,
  setEvents,
  socketAddAnnouncement,
  socketUpdateEventStatus,
  socketUpdateLeaderboard,
} = eventSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllEvents         = (state) => state.events.events;
export const selectCurrentEvent      = (state) => state.events.currentEvent;
export const selectMyEvents          = (state) => state.events.myEvents;
export const selectRegistrations     = (state) => state.events.registrations;
export const selectEventAnnouncements = (state) => state.events.announcements;
export const selectLeaderboard       = (state) => state.events.leaderboard;
export const selectEventPagination   = (state) => state.events.pagination;
export const selectEventLoading      = (state) => state.events.loading;
export const selectEventActionLoading = (state) => state.events.actionLoading;
export const selectEventError        = (state) => state.events.error;

// Legacy compat aliases
export const selectSelectedEvent     = selectCurrentEvent;
export const selectUpcomingEvents    = selectAllEvents;
export const selectRegisteredEvents  = selectMyEvents;

export default eventSlice.reducer;
