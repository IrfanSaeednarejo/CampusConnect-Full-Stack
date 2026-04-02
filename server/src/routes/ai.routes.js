import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { handleChat } from "../controllers/ai.controller.js";

const router = Router();

// Secure the route with JWT
router.use(verifyJWT);

// Unified endpoint for any agent type
router.post("/chat", handleChat);

export default router;
