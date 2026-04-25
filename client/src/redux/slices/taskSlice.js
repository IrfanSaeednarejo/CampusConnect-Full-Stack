import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskApi from '../../api/taskApi';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchTasksThunk = createAsyncThunk(
  'tasks/fetchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await taskApi.getTasks(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createTaskThunk = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const { data } = await taskApi.createTask(taskData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateTaskThunk = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data: updateData }, { rejectWithValue }) => {
    try {
      const { data } = await taskApi.updateTask(id, updateData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const completeTaskThunk = createAsyncThunk(
  'tasks/completeTask',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await taskApi.completeTask(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteTaskThunk = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  tasks: [],
  total: 0,
  page: 1,
  loading: false,
  submitting: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchTasks ────────────────────────────────────────────────────────
    builder
      .addCase(fetchTasksThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasksThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.docs || [];
        state.total = action.payload.pagination?.total || 0;
        state.page = action.payload.pagination?.page || 1;
      })
      .addCase(fetchTasksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── createTask ────────────────────────────────────────────────────────
    builder
      .addCase(createTaskThunk.pending, (state) => { state.submitting = true; })
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.tasks.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    // ── updateTask ────────────────────────────────────────────────────────
    builder
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      });

    // ── completeTask ──────────────────────────────────────────────────────
    builder
      .addCase(completeTaskThunk.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      });

    // ── deleteTask ────────────────────────────────────────────────────────
    builder
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { clearTaskError } = taskSlice.actions;

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllTasks = (state) => state.tasks.tasks;
export const selectTaskLoading = (state) => state.tasks.loading;
export const selectTaskSubmitting = (state) => state.tasks.submitting;
export const selectTaskError = (state) => state.tasks.error;
export const selectTaskTotal = (state) => state.tasks.total;
export const selectPendingTasks = (state) => state.tasks.tasks.filter((t) => t.status === 'pending');
export const selectCompletedTasks = (state) => state.tasks.tasks.filter((t) => t.status === 'completed');
export const selectAiTasks = (state) => state.tasks.tasks.filter((t) => t.source === 'ai');

export default taskSlice.reducer;
