import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as notesApi from "../../api/notesApi";

export const fetchNotes = createAsyncThunk(
    "notes/fetchNotes",
    async (params, { rejectWithValue }) => {
        try {
            const { data } = await notesApi.getMyNotes(params);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const createNoteThunk = createAsyncThunk(
    "notes/createNote",
    async (noteData, { rejectWithValue }) => {
        try {
            const { data } = await notesApi.createNote(noteData);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateNoteThunk = createAsyncThunk(
    "notes/updateNote",
    async ({ id, data: noteData }, { rejectWithValue }) => {
        try {
            const { data } = await notesApi.updateNote(id, noteData);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const deleteNoteThunk = createAsyncThunk(
    "notes/deleteNote",
    async (id, { rejectWithValue }) => {
        try {
            await notesApi.deleteNote(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const initialState = {
    notes: [],
    loading: false,
    error: null,
    selectedNote: null,
};

const notesSlice = createSlice({
    name: "notes",
    initialState,
    reducers: {
        setSelectedNote: (state, action) => {
            state.selectedNote = action.payload;
        },
        clearNoteError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.notes = action.payload;
                state.loading = false;
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })
            .addCase(createNoteThunk.fulfilled, (state, action) => {
                state.notes.unshift(action.payload);
            })
            .addCase(updateNoteThunk.fulfilled, (state, action) => {
                const idx = state.notes.findIndex((n) => n._id === action.payload._id);
                if (idx !== -1) {
                    state.notes[idx] = action.payload;
                }
            })
            .addCase(deleteNoteThunk.fulfilled, (state, action) => {
                state.notes = state.notes.filter((n) => n._id !== action.payload);
            });
    },
});

export const { setSelectedNote, clearNoteError } = notesSlice.actions;

export const selectAllNotes = (state) => state.notes.notes;
export const selectNotesLoading = (state) => state.notes.loading;
export const selectNoteError = (state) => state.notes.error;

export default notesSlice.reducer;
