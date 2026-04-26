import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    sendMessage,
    createConversation,
    getConversations,
    getConversation,
    removeConversation,
    getActionLog,
    generateDraft,
    // Post AI
    draftPostHandler,
    improvePostHandler,
    suggestHashtagsHandler,
    generatePollHandler,
    moderatePostHandler,
} from "../controllers/ai.controller.js";
import {
    aiProfileBioHandler,
    aiImproveExperienceHandler,
    aiProfileHeadlineHandler,
} from "../controllers/profile.controller.js";

const router = Router();

// All Nexus routes require authentication
router.use(verifyJWT);

// ── Chat & Drafting ─────────────────────────────
// POST /api/v1/nexus/chat
router.post("/chat", sendMessage);

// POST /api/v1/nexus/draft
router.post("/draft", generateDraft);

// ── Conversations ─────────────────────────────
// POST /api/v1/nexus/conversations  → start new thread
// GET  /api/v1/nexus/conversations  → list all threads
router.route("/conversations")
    .post(createConversation)
    .get(getConversations);

// GET    /api/v1/nexus/conversations/:id  → get with full history
// DELETE /api/v1/nexus/conversations/:id  → delete thread
router.route("/conversations/:id")
    .get(getConversation)
    .delete(removeConversation);

// ── Audit Log ─────────────────────────────────
// GET /api/v1/nexus/actions
router.get("/actions", getActionLog);

// ── Post AI Assist ────────────────────────────────────────────────────────────
// POST /api/v1/nexus/post/draft     → draft a post from a topic/idea
router.post("/post/draft",    draftPostHandler);

// POST /api/v1/nexus/post/improve   → rewrite post body in a given tone
router.post("/post/improve",  improvePostHandler);

// POST /api/v1/nexus/post/hashtags  → suggest 3–7 hashtags from post body
router.post("/post/hashtags", suggestHashtagsHandler);

// POST /api/v1/nexus/post/poll      → generate 4 poll options from a question
router.post("/post/poll",     generatePollHandler);

// POST /api/v1/nexus/post/moderate  → pre-submission content safety check
router.post("/post/moderate", moderatePostHandler);

// ── Profile AI ────────────────────────────────────────────────────────────────
// POST /api/v1/nexus/profile/bio              → generate bio suggestion
router.post("/profile/bio",               aiProfileBioHandler);
// POST /api/v1/nexus/profile/improve-experience → rewrite experience description
router.post("/profile/improve-experience", aiImproveExperienceHandler);
// POST /api/v1/nexus/profile/headline         → generate headline suggestion
router.post("/profile/headline",           aiProfileHeadlineHandler);

export default router;

