import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as noteService from "../services/note.service.js";

const createNote = asyncHandler(async (req, res) => {
    const note = await noteService.createNote(req.body, req.user);
    return res.status(201).json(new ApiResponse(201, note, "Note created successfully"));
});

const getMyNotes = asyncHandler(async (req, res) => {
    const result = await noteService.getMyNotes(req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Notes fetched successfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
    const note = await noteService.getNoteById(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, note, "Note fetched successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
    const note = await noteService.updateNote(req.params.id, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, note, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
    await noteService.deleteNote(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, null, "Note deleted successfully"));
});

export { createNote, getMyNotes, getNoteById, updateNote, deleteNote };