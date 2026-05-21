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

export const fetchUnreadCountThunk = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread-count`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch unread count");
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
      const response = await axios.patch(`${API_URL}/notifications/read-all`, {}, {
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
      const incoming = action.payload;
      const index = state.items.findIndex((notification) => notification._id === incoming._id);

      if (index !== -1) {
        const previous = state.items[index];
        const wasUnread = !previous.read;
        const isUnread = !incoming.read;

        state.items.splice(index, 1);
        state.items.unshift({ ...previous, ...incoming });

        if (!wasUnread && isUnread) {
          state.unreadCount += 1;
        } else if (wasUnread && !isUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      } else {
        state.items.unshift(incoming);
        if (!incoming.read) {
          state.unreadCount += 1;
        }
      }

      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
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
        const unreadFromPage = action.payload.docs.filter((notification) => !notification.read).length;
        state.unreadCount = Math.max(state.unreadCount, unreadFromPage);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Unread Count
      .addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unreadCount;
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
