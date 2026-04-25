import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    sendMessage,
    createConversation,
    getConversations,
    getConversation,
    removeConversation,
    getActionLog,
} from "../controllers/ai.controller.js";

const router = Router();

// All Nexus routes require authentication
router.use(verifyJWT);

// ── Chat ──────────────────────────────────────
// POST /api/v1/nexus/chat
router.post("/chat", sendMessage);

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

export default router;
