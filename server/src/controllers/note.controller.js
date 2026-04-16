import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Note } from "../models/note.model.js";

const createNote = asyncHandler(async (req, res) => {
    const { title, content, type, courseId, tags, attachments } = req.body;

    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const note = await Note.create({
        title,
        content,
        type,
        courseId,
        tags,
        attachments,
        userId: req.user._id,
        campusId: req.user.campusId,
    });

    return res.status(201).json(new ApiResponse(201, note, "Note created successfully"));
});

const getMyNotes = asyncHandler(async (req, res) => {
    const { type, courseId, search } = req.query;
    const filter = { userId: req.user._id, isArchived: false };

    if (type) filter.type = type;
    if (courseId) filter.courseId = courseId;
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
        ];
    }

    const notes = await Note.find(filter).sort({ updatedAt: -1 }).populate("attachments");

    return res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id).populate("attachments");

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    if (note.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    return res.status(200).json(new ApiResponse(200, note, "Note fetched successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
    const { title, content, type, courseId, tags, attachments, isArchived } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    if (note.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                title,
                content,
                type,
                courseId,
                tags,
                attachments,
                isArchived,
            },
        },
        { new: true, runValidators: true }
    );

    return res.status(200).json(new ApiResponse(200, updatedNote, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    if (note.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    await Note.findByIdAndDelete(req.params.id);

    return res.status(200).json(new ApiResponse(200, null, "Note deleted successfully"));
});

export { createNote, getMyNotes, getNoteById, updateNote, deleteNote };