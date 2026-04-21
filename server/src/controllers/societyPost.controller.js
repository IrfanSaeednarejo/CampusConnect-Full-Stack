import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as societyPostService from "../services/societyPost.service.js";

// ── Announcements ─────────────────────────────────────────────────────────────

const getPosts = asyncHandler(async (req, res) => {
    const result = await societyPostService.getPosts(req.params.id, req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Posts fetched successfully"));
});

const createPost = asyncHandler(async (req, res) => {
    const post = await societyPostService.createPost(
        req.params.id,
        req.body,
        req.files,
        req.user
    );
    return res.status(201).json(new ApiResponse(201, post, "Announcement posted successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
    const result = await societyPostService.deletePost(req.params.id, req.params.postId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Post deleted successfully"));
});

// ── Society Events ────────────────────────────────────────────────────────────

const getSocietyEvents = asyncHandler(async (req, res) => {
    const result = await societyPostService.getSocietyEvents(req.params.id);
    return res.status(200).json(new ApiResponse(200, result, "Society events fetched successfully"));
});

export { getPosts, createPost, deletePost, getSocietyEvents };
