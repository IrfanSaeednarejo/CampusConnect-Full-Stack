import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import * as postService from "../services/post.service.js";

// ── Feed ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/posts/feed?type=campus&page=1&limit=15
 */
export const getFeed = asyncHandler(async (req, res) => {
    const { type = "campus", page = 1, limit = 15 } = req.query;
    const result = await postService.getFeed(type, Number(page), Number(limit), req.user);
    return res.status(200).json(new ApiResponse(200, result, "Feed fetched successfully"));
});

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/posts
 * multipart/form-data — images[] (max 4)
 */
export const createPost = asyncHandler(async (req, res) => {
    const { body, type, visibility, poll, mentions } = req.body;

    const pollData = poll ? (typeof poll === "string" ? JSON.parse(poll) : poll) : undefined;
    const mentionsList = mentions ? (typeof mentions === "string" ? JSON.parse(mentions) : mentions) : [];

    const post = await postService.createPost(
        { body, type, visibility, poll: pollData, mentions: mentionsList },
        req.files || [],
        req.user
    );
    return res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
});

/**
 * GET /api/v1/posts/:postId
 */
export const getPostById = asyncHandler(async (req, res) => {
    const post = await postService.getPostById(req.params.postId, req.user._id);
    return res.status(200).json(new ApiResponse(200, post, "Post fetched"));
});

/**
 * PATCH /api/v1/posts/:postId
 */
export const updatePost = asyncHandler(async (req, res) => {
    const { body, visibility } = req.body;
    const post = await postService.updatePost(req.params.postId, req.user._id, { body, visibility });
    return res.status(200).json(new ApiResponse(200, post, "Post updated"));
});

/**
 * DELETE /api/v1/posts/:postId
 */
export const deletePost = asyncHandler(async (req, res) => {
    await postService.deletePost(req.params.postId, req.user);
    return res.status(200).json(new ApiResponse(200, null, "Post deleted"));
});

// ── Engagement ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/posts/:postId/react
 * body: { reactionType }
 */
export const reactToPost = asyncHandler(async (req, res) => {
    const { reactionType } = req.body;
    if (!reactionType) throw new Error("reactionType is required");
    const result = await postService.reactToPost(req.params.postId, req.user._id, reactionType);
    return res.status(200).json(new ApiResponse(200, result, "Reaction updated"));
});

/**
 * POST /api/v1/posts/:postId/repost
 * body: { comment }
 */
export const repostPost = asyncHandler(async (req, res) => {
    const { comment = "" } = req.body;
    const post = await postService.repostPost(req.params.postId, req.user, comment);
    return res.status(201).json(new ApiResponse(201, post, "Reposted successfully"));
});

/**
 * POST /api/v1/posts/:postId/poll/vote
 * body: { optionIndexes: [0, 2] }
 */
export const voteOnPoll = asyncHandler(async (req, res) => {
    const { optionIndexes } = req.body;
    const poll = await postService.voteOnPoll(req.params.postId, req.user._id, optionIndexes);
    return res.status(200).json(new ApiResponse(200, poll, "Vote recorded"));
});

// ── Comments ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/posts/:postId/comments?page=1&limit=20
 */
export const getComments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await postService.getComments(req.params.postId, { page: Number(page), limit: Number(limit), parentId: null });
    return res.status(200).json(new ApiResponse(200, result, "Comments fetched"));
});

/**
 * GET /api/v1/posts/:postId/comments/:commentId/replies
 */
export const getCommentReplies = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await postService.getComments(req.params.postId, {
        page: Number(page), limit: Number(limit), parentId: req.params.commentId,
    });
    return res.status(200).json(new ApiResponse(200, result, "Replies fetched"));
});

/**
 * POST /api/v1/posts/:postId/comments
 * body: { body, parentId?, mentions? }
 */
export const addComment = asyncHandler(async (req, res) => {
    const { body, parentId, mentions } = req.body;
    const comment = await postService.addComment(req.params.postId, req.user, { body, parentId, mentions });
    return res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});

/**
 * DELETE /api/v1/posts/:postId/comments/:commentId
 */
export const deleteComment = asyncHandler(async (req, res) => {
    await postService.deleteComment(req.params.commentId, req.user);
    return res.status(200).json(new ApiResponse(200, null, "Comment deleted"));
});

// ── Discovery ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/posts/hashtag/:tag?page=1&limit=15
 */
export const getPostsByHashtag = asyncHandler(async (req, res) => {
    const { page = 1, limit = 15 } = req.query;
    const result = await postService.getPostsByHashtag(req.params.tag, Number(page), Number(limit));
    return res.status(200).json(new ApiResponse(200, result, "Posts fetched"));
});

/**
 * GET /api/v1/posts/user/:userId?page=1&limit=15
 */
export const getUserPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 15 } = req.query;
    const result = await postService.getUserPosts(req.params.userId, Number(page), Number(limit));
    return res.status(200).json(new ApiResponse(200, result, "User posts fetched"));
});

/**
 * GET /api/v1/posts/search?q=...&campusId=...
 */
export const searchPosts = asyncHandler(async (req, res) => {
    const { q, campusId, page = 1, limit = 15 } = req.query;
    const result = await postService.searchPosts(q, campusId, Number(page), Number(limit));
    return res.status(200).json(new ApiResponse(200, result, "Search results fetched"));
});

/**
 * GET /api/v1/posts/hashtags/trending?limit=10
 */
export const getTrendingHashtags = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const campusId = req.user?.campusId;
    const result = await postService.getTrendingHashtags(campusId, Number(limit));
    return res.status(200).json(new ApiResponse(200, result, "Trending hashtags fetched"));
});
