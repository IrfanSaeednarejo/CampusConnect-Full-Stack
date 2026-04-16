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

const initialState = {
  events: [],
  upcomingEvents: [],
  registeredEvents: [],
  selectedEvent: null,
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
      });
  },
});

export const { clearSelectedEvent, clearError } = eventSlice.actions;

export const selectAllEvents = (state) => state.events.events;
export const selectUpcomingEvents = (state) => state.events.upcomingEvents;
export const selectRegisteredEvents = (state) => state.events.registeredEvents;
export const selectSelectedEvent = (state) => state.events.selectedEvent;
export const selectEventLoading = (state) => state.events.loading;
export const selectEventError = (state) => state.events.error;
export const selectEventById = (eventId) => (state) =>
  state.events.events.find((event) => event._id === eventId || event.id === eventId);

export default eventSlice.reducer;
