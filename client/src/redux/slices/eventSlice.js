import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as eventApi from '../../api/eventApi';

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.getCompetitions(params);
      return data.data; // Usually { data, pagination, ... } or just array
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch events');
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.getCompetitionById(eventId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch event details');
    }
  }
);

export const createEventThunk = createAsyncThunk(
  'events/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.createCompetition(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create event');
    }
  }
);

export const updateEventThunk = createAsyncThunk(
  'events/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.updateCompetition(id, formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update event');
    }
  }
);

export const deleteEventThunk = createAsyncThunk(
  'events/delete',
  async (eventId, { rejectWithValue }) => {
    try {
      await eventApi.deleteCompetition(eventId);
      return eventId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete event');
    }
  }
);

// Admin Control Thunks
export const transitionStateThunk = createAsyncThunk(
  'events/transitionState',
  async ({ id, stateData }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.transitionState(id, stateData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to transition event state');
    }
  }
);

export const publishLeaderboardThunk = createAsyncThunk(
  'events/publishLeaderboard',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.publishLeaderboard(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to publish leaderboard');
    }
  }
);

export const postAnnouncementThunk = createAsyncThunk(
  'events/postAnnouncement',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.postAnnouncement(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to post announcement');
    }
  }
);

export const updateJudgesThunk = createAsyncThunk(
  'events/updateJudges',
  async ({ id, judgeIds }, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.updateJudges(id, { judgeIds });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update judges');
    }
  }
);

export const fetchAnnouncementsThunk = createAsyncThunk(
  'events/fetchAnnouncements',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await eventApi.getAnnouncements(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch announcements');
    }
  }
);

const initialState = {
  events: [],
  upcomingEvents: [],
  registeredEvents: [],
  selectedEvent: null,
  announcements: [],
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUpcomingEvents: (state, action) => {
      state.upcomingEvents = action.payload;
    },
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    socketAddAnnouncement: (state, action) => {
      const newAnn = action.payload;
      if (state.announcements && !state.announcements.some(a => a._id === newAnn._id || a === newAnn)) {
        state.announcements = [newAnn, ...state.announcements];
      }
    },
    socketUpdateEventStatus: (state, action) => {
      if (state.selectedEvent && state.selectedEvent._id === action.payload.eventId) {
        state.selectedEvent.status = action.payload.status;
      }
    },
    socketUpdateLeaderboard: (state, action) => {
      // Trigger a soft-refresh tag or directly update state if we cached the leaderboard locally
      // For now, if a leaderboard update hits, we might just want to refetch the leaderboard dynamically from the component
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        // Depending on backend payload, if it's paginated it might be action.payload.items
        state.events = action.payload.items || action.payload || [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createEventThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEventThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(createEventThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateEventThunk.fulfilled, (state, action) => {
        const idx = state.events.findIndex(e => e._id === action.payload._id || e.id === action.payload.id);
        if (idx !== -1) {
          state.events[idx] = action.payload;
        }
        if (state.selectedEvent?._id === action.payload._id) {
          state.selectedEvent = action.payload;
        }
      })

      // Delete
      .addCase(deleteEventThunk.fulfilled, (state, action) => {
        state.events = state.events.filter(e => e._id !== action.payload && e.id !== action.payload);
      })

      // Admin Transitions
      .addCase(transitionStateThunk.pending, (state) => { state.loading = true; })
      .addCase(transitionStateThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedEvent && (state.selectedEvent._id === action.payload._id || state.selectedEvent.id === action.payload.id)) {
          state.selectedEvent = action.payload; // Update live view
        }
      })
      .addCase(transitionStateThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(publishLeaderboardThunk.pending, (state) => { state.loading = true; })
      .addCase(publishLeaderboardThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedEvent && (state.selectedEvent._id === action.payload._id || state.selectedEvent.id === action.payload.id)) {
          state.selectedEvent = action.payload; // Update live view to show published
        }
      })
      .addCase(publishLeaderboardThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Announcements
      .addCase(postAnnouncementThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally inject into list if returned 
      })
      .addCase(fetchAnnouncementsThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchAnnouncementsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload || [];
      })
      .addCase(fetchAnnouncementsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Assign Judges
      .addCase(updateJudgesThunk.pending, (state) => { state.loading = true; })
      .addCase(updateJudgesThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedEvent && (state.selectedEvent._id === action.payload._id || state.selectedEvent.id === action.payload.id)) {
          state.selectedEvent = action.payload;
        }
      })
      .addCase(updateJudgesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSelectedEvent,
  clearError,
  setUpcomingEvents,
  setEvents,
  socketAddAnnouncement,
  socketUpdateEventStatus,
  socketUpdateLeaderboard
} = eventSlice.actions;

export const selectAllEvents = (state) => state.events.events;
export const selectUpcomingEvents = (state) => state.events.upcomingEvents;
export const selectRegisteredEvents = (state) => state.events.registeredEvents;
export const selectSelectedEvent = (state) => state.events.selectedEvent;
export const selectEventAnnouncements = (state) => state.events.announcements;
export const selectEventLoading = (state) => state.events.loading;
export const selectEventError = (state) => state.events.error;
export const selectEventById = (eventId) => (state) =>
  state.events.events.find((event) => event._id === eventId || event.id === eventId);

export default eventSlice.reducer;
