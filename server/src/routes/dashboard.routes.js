import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getDashboardSummary,
    getDashboardTimeline
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/summary").get(getDashboardSummary);
router.route("/timeline").get(getDashboardTimeline);

export default router;