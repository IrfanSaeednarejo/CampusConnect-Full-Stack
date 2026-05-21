import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getBadgeById,
    getCampusLeaderboardController,
    getCertificateById,
    getGlobalLeaderboardController,
    getModuleLeaderboardController,
    getMyBadges,
    getMyCertificates,
    getMyProgress,
    getMyStreaks,
    getMySummary,
    getMyTransactions,
    getUserBadges,
    listBadges,
    verifyCertificateController,
} from "../controllers/gamification.controller.js";

const router = Router();

router.get("/certificates/verify/:code", verifyCertificateController);

router.use(verifyJWT);

router.get("/me/summary", getMySummary);
router.get("/me/transactions", getMyTransactions);
router.get("/me/badges", getMyBadges);
router.get("/me/streaks", getMyStreaks);
router.get("/me/certificates", getMyCertificates);
router.get("/me/progress", getMyProgress);

router.get("/leaderboards/global", getGlobalLeaderboardController);
router.get("/leaderboards/campus/:campusId", getCampusLeaderboardController);
router.get("/leaderboards/module/:module", getModuleLeaderboardController);

router.get("/badges", listBadges);
router.get("/badges/:badgeId", getBadgeById);
router.get("/users/:userId/badges", getUserBadges);

router.get("/certificates/:certificateId", getCertificateById);

export default router;
