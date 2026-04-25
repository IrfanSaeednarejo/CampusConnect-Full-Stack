import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Note } from "../models/note.model.js";
import { paginate } from "../utils/paginate.js";

/**
 * Create a new note for the requesting user.
 * @param {object} data - Note fields.
 * @param {object} requestUser - Authenticated user from verifyJWT.
 */
export const createNote = async (data, requestUser) => {
    const { title, content, type, courseId, tags, attachments, source } = data;

    if (!title?.trim()) throw new ApiError(400, "Title is required");
    if (!content?.trim()) throw new ApiError(400, "Content is required");

    const note = await Note.create({
        title: title.trim(),
        content: content.trim(),
        type: type || "personal",
        courseId: courseId?.trim() || undefined,
        tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
        attachments: Array.isArray(attachments) ? attachments : [],
        source: source || "manual",
        userId: requestUser._id,
        campusId: requestUser.campusId,
    });

    return note;
};

/**
 * Get all non-archived notes for the requesting user.
 */
export const getMyNotes = async (queryParams, requestUser) => {
    const { type, courseId, search, page = 1, limit = 50 } = queryParams;

    const filter = { userId: requestUser._id, isArchived: false };

    if (type && ["personal", "academic", "shared"].includes(type)) {
        filter.type = type;
    }
    if (courseId?.trim()) {
        filter.courseId = courseId.trim();
    }
    if (search?.trim()) {
        filter.$or = [
            { title: { $regex: search.trim(), $options: "i" } },
            { content: { $regex: search.trim(), $options: "i" } },
        ];
    }

    // Use paginate for consistency, but allow large limit for notes (default 50)
    return await paginate(Note, filter, {
        page,
        limit,
        sort: { updatedAt: -1 },
        populate: [{ path: "attachments" }],
    });
};

/**
 * Get a single note by ID — enforces ownership.
 */
export const getNoteById = async (noteId, requestUser) => {
    if (!mongoose.isValidObjectId(noteId)) {
        throw new ApiError(400, "Invalid note ID format");
    }

    const note = await Note.findById(noteId).populate("attachments");
    if (!note) throw new ApiError(404, "Note not found");

    if (note.userId.toString() !== requestUser._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    return note;
};

/**
 * Update a note — enforces ownership. Partial patch.
 */
export const updateNote = async (noteId, data, requestUser) => {
    // Ownership check via getNoteById
    await getNoteById(noteId, requestUser);

    const allowedFields = ["title", "content", "type", "courseId", "tags", "attachments", "isArchived"];
    const updates = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates[field] = data[field];
        }
    }

    if (updates.title !== undefined) updates.title = updates.title.trim();
    if (updates.content !== undefined) updates.content = updates.content.trim();

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided to update");
    }

    return await Note.findByIdAndUpdate(
        noteId,
        { $set: updates },
        { new: true, runValidators: true }
    );
};

/**
 * Hard delete a note — enforces ownership.
 */
export const deleteNote = async (noteId, requestUser) => {
    await getNoteById(noteId, requestUser);
    await Note.findByIdAndDelete(noteId);
    return true;
};

/**
 * Search a user's notes by text — used by Nexus AI for context gathering.
 * Returns lightweight results (title + content snippet).
 * @param {string} query - Search term.
 * @param {object} requestUser - Authenticated user.
 * @param {number} [limit=5] - Max results.
 */
export const searchNotesForContext = async (query, requestUser, limit = 5) => {
    if (!query?.trim()) return [];

    return await Note.find({
        userId: requestUser._id,
        isArchived: false,
        $or: [
            { title: { $regex: query.trim(), $options: "i" } },
            { content: { $regex: query.trim(), $options: "i" } },
            { tags: { $regex: query.trim(), $options: "i" } },
        ],
    })
        .select("title content tags courseId type createdAt")
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();
};

/**
 * Get the most recent N notes for a user — used by Nexus for general context.
 * @param {object} requestUser
 * @param {number} [limit=5]
 */
export const getRecentNotesForContext = async (requestUser, limit = 5) => {
    return await Note.find({ userId: requestUser._id, isArchived: false })
        .select("title content tags courseId type createdAt")
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();
};
