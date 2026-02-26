import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    toggleTaskComplete: (state, action) => {
      const task = state.tasks.find((t) => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    setTaskLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTaskError: (state, action) => {
      state.error = action.payload;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
});

// Actions
export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  setTaskLoading,
  setTaskError,
  clearTaskError,
} = taskSlice.actions;

// Selectors
export const selectAllTasks = (state) => state.tasks.tasks;
export const selectTaskLoading = (state) => state.tasks.loading;
export const selectTaskError = (state) => state.tasks.error;
export const selectCompletedTasks = (state) =>
  state.tasks.tasks.filter((t) => t.completed);
export const selectIncompleteTasks = (state) =>
  state.tasks.tasks.filter((t) => !t.completed);
export const selectTasksByCategory = (category) => (state) =>
  category === 'all'
    ? state.tasks.tasks
    : state.tasks.tasks.filter((t) => t.category === category);
export const selectTasksByPriority = (priority) => (state) =>
  priority === 'all'
    ? state.tasks.tasks
    : state.tasks.tasks.filter((t) => t.priority === priority);

// Reducer
export default taskSlice.reducer;
