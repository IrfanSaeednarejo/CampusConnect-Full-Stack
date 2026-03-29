import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationApi from '../../api/notificationApi';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await notificationApi.getMyNotifications(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      return data.data.unreadCount;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationApi.markAsRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeNotification = createAsyncThunk(
  'notifications/remove',
  async (id, { rejectWithValue }) => {
    try {
      await notificationApi.deleteNotification(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: { page: 1, totalPages: 1 },
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    acknowledgeNotification: (state, action) => {
      const id = action.payload;
      const n = state.notifications.find((n) => n._id === id);
      if (n) n.read = true;
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    clearAllNotifications: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const result = action.payload;
        state.notifications = result.docs || result;
        state.pagination = {
          page: result.page || 1,
          totalPages: result.totalPages || 1,
        };
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });

    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const id = action.payload;
      const n = state.notifications.find((n) => n._id === id);
      if (n) n.read = true;
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    });

    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    });

    builder.addCase(removeNotification.fulfilled, (state, action) => {
      const id = action.payload;
      const n = state.notifications.find((n) => n._id === id);
      if (n && !n.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((notif) => notif._id !== id);
    });
  },
});

export const {
  addNotification,
  acknowledgeNotification,
  clearAllNotifications,
  setUnreadCount,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationLoading = (state) => state.notifications.loading;

export default notificationSlice.reducer;
