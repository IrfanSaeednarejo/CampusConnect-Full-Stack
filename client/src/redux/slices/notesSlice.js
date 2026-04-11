import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notesApi } from '../../api/notesApi';

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async () => {
    const response = await notesApi.getAll();
    return response;
  }
);

export const uploadNote = createAsyncThunk(
  'notes/uploadNote',
  async (payload) => {
    const response = await notesApi.upload(payload);
    return response;
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (noteId) => {
    await notesApi.delete(noteId);
    return noteId;
  }
);

export const toggleNoteShare = createAsyncThunk(
  'notes/toggleNoteShare',
  async (noteId) => {
    await notesApi.toggleShare(noteId);
    return noteId;
  }
);

const initialState = {
  items: [],
  filteredItems: [],
  status: 'idle',
  uploadStatus: 'idle',
  error: null,
  filters: {
    search: '',
    subject: 'All',
    fileType: 'All',
    sortBy: 'newest',
  },
};

const applyFilters = (items, filters) => {
  let result = [...items];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q) ||
      n.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  if (filters.subject !== 'All') {
    result = result.filter(n => n.subject === filters.subject);
  }

  if (filters.fileType !== 'All') {
    const map = {
      'PDF': 'pdf',
      'Document': 'doc',
      'Presentation': 'ppt',
      'Image': 'img',
      'Other': 'other'
    };
    result = result.filter(n => n.fileType === map[filters.fileType]);
  }

  result.sort((a, b) => {
    if (filters.sortBy === 'newest') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    if (filters.sortBy === 'oldest') return new Date(a.uploadedAt) - new Date(b.uploadedAt);
    if (filters.sortBy === 'most-downloaded') return (b.downloadCount || 0) - (a.downloadCount || 0);
    return 0;
  });

  return result;
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNoteFilter: (state, action) => {
      const { field, value } = action.payload;
      state.filters[field] = value;
      state.filteredItems = applyFilters(state.items, state.filters);
    },
    // FIX [Bug 7]: Add action to increment download count
    incrementDownloadCount: (state, action) => {
      const note = state.items.find(n => n.id === action.payload);
      if (note) note.downloadCount = (note.downloadCount || 0) + 1;

      const filtered = state.filteredItems.find(n => n.id === action.payload);
      if (filtered) filtered.downloadCount = (filtered.downloadCount || 0) + 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.filteredItems = applyFilters(state.items, state.filters);
      })
      .addCase(uploadNote.pending, (state) => {
        state.uploadStatus = 'uploading';
      })
      .addCase(uploadNote.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.items = [action.payload, ...state.items];
        state.filteredItems = applyFilters(state.items, state.filters);
      })
      .addCase(uploadNote.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.items = state.items.filter(n => n.id !== action.payload && n._id !== action.payload);
        state.filteredItems = applyFilters(state.items, state.filters);
      })
      .addCase(toggleNoteShare.fulfilled, (state, action) => {
        const note = state.items.find(n => n.id === action.payload || n._id === action.payload);
        if (note) note.isShared = !note.isShared;
        state.filteredItems = applyFilters(state.items, state.filters);
      });
  },
});

export const { setNoteFilter, incrementDownloadCount } = notesSlice.actions;

export const selectAllNotes = (state) => state.notes.items;
export const selectFilteredNotes = (state) => state.notes.filteredItems;
export const selectUploadStatus = (state) => state.notes.uploadStatus;
export const selectNotesFilters = (state) => state.notes.filters;

export default notesSlice.reducer;
