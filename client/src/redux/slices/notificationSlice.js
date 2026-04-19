import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// --- Async Thunks ---

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        params,
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const markReadThunk = createAsyncThunk(
  "notifications/markRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark notification as read");
    }
  }
);

export const markAllReadThunk = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/notifications/mark-all-read`, {}, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all as read");
    }
  }
);

// --- Slice ---

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    pagination: {
      total: 0,
      page: 1,
      pages: 1,
    },
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      // Prevent duplicates
      const exists = state.items.some(n => n._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
        // Keep list reasonable sized in memory
        if (state.items.length > 50) state.items.pop();
      }
    },
    acknowledgeNotification: (state, action) => {
      const index = state.items.findIndex(n => n._id === action.payload);
      if (index !== -1 && !state.items[index].read) {
        state.items[index].read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearAllNotifications: (state) => {
      state.items.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.docs;
        state.pagination = {
          total: action.payload.totalDocs,
          page: action.payload.page,
          pages: action.payload.totalPages,
        };
        // Also update unread count based on current list if possible, 
        // or just rely on a separate count fetch if needed.
        // For now, assume backend provides a summary or we count locally
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark Read
      .addCase(markReadThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(n => n._id === action.payload._id);
        if (index !== -1 && !state.items[index].read) {
          state.items[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark All Read
      .addCase(markAllReadThunk.fulfilled, (state) => {
        state.items.forEach(n => n.read = true);
        state.unreadCount = 0;
      });
  }
});

export const { 
  addNotification, 
  acknowledgeNotification, 
  clearAllNotifications, 
  setUnreadCount, 
  clearError 
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationLoading = (state) => state.notifications.loading;

export default notificationSlice.reducer;
