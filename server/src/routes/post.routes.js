import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload }    from "../middlewares/multer.middleware.js";
import {
    getFeed,
    createPost,
    getPostById,
    updatePost,
    deletePost,
    reactToPost,
    repostPost,
    voteOnPoll,
    getComments,
    getCommentReplies,
    addComment,
    deleteComment,
    getPostsByHashtag,
    getUserPosts,
    searchPosts,
    getTrendingHashtags,
} from "../controllers/post.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// ── Discovery (before /:postId to avoid param conflicts) ──────────────────────
router.get("/feed",                  getFeed);
router.get("/search",                searchPosts);
router.get("/hashtags/trending",     getTrendingHashtags);
router.get("/hashtag/:tag",          getPostsByHashtag);
router.get("/user/:userId",          getUserPosts);

// ── Core CRUD ─────────────────────────────────────────────────────────────────
router.post("/",  upload.array("images", 4), createPost);
router.get("/:postId",               getPostById);
router.patch("/:postId",             updatePost);
router.delete("/:postId",            deletePost);

// ── Engagement ────────────────────────────────────────────────────────────────
router.post("/:postId/react",        reactToPost);
router.post("/:postId/repost",       repostPost);
router.post("/:postId/poll/vote",    voteOnPoll);

// ── Comments ──────────────────────────────────────────────────────────────────
router.get("/:postId/comments",                         getComments);
router.post("/:postId/comments",                        addComment);
router.get("/:postId/comments/:commentId/replies",      getCommentReplies);
router.delete("/:postId/comments/:commentId",           deleteComment);

export default router;
