import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getUserNotifications,
  markNotificationAsRead as markAsReadApi,
  markAllNotificationsAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
  getUnreadCount as getUnreadCountApi,
} from '../../api/notificationApi';

// ─── Async Thunks (calling real backend at /api/v1/notifications) ─────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserNotifications();
      // response is the ApiResponse body: { success, data: { docs, pagination }, ... }
      return response.data?.docs || [];
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notifId, { rejectWithValue }) => {
    try {
      await markAsReadApi(notifId);
      return notifId;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to mark as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllAsReadApi();
      return true;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notifId, { rejectWithValue }) => {
    try {
      await deleteNotificationApi(notifId);
      return notifId;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to delete notification');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
    // Synchronous optimists
    markAsRead: (state, action) => {
      const notif = state.items.find((n) => n._id === action.payload);
      if (notif) notif.read = true;
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter((n) => n._id !== action.payload);
    },
    // For Socket.io real-time push
    receiveNotification: (state, action) => {
      // Avoid duplicates
      const exists = state.items.find(n => n._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.items.find((n) => n._id === action.payload);
        if (notif) notif.read = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.read = true;
        });
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
      });
  },
});

export const {
  setNotifications,
  clearAllNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  receiveNotification
} = notificationsSlice.actions;

// Selectors
export const selectAllNotifications = (state) => state.notifications?.items || [];
export const selectUnreadCount = (state) =>
  (state.notifications?.items || []).filter((n) => !n.read).length;
export const selectNotificationsByType = (state, type) =>
  (state.notifications?.items || []).filter((n) => n.type === type);

export default notificationsSlice.reducer;
