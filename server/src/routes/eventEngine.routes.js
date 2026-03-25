/**
 * eventEngine.routes.js
 *
 * Mount in app.js:
 *   import competitionRouter from "./src/routes/eventEngine.routes.js";
 *   app.use("/api/v1/competitions", competitionRouter);
 */

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openAuth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { EventTeam } from "../models/eventTeam.model.js";
import { Event } from "../models/event.model.js";

import {
    createCompetition,
    getCompetitions,
    getCompetitionById,
    updateCompetition,
    deleteCompetition,
    transitionState,
    postAnnouncement,
    getAnnouncements,
    getLeaderboard,
    publishLeaderboard,
    updateJudges,
} from "../controllers/event.controller.js";

import {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
    kickMember,
    disqualifyTeam,
    transferLeadership,
} from "../controllers/eventTeam.controller.js";

import {
    upsertSubmission,
    getSubmissions,
    getMySubmission,
    getSubmissionById,
    addFileToSubmission,
    removeFileFromSubmission,
} from "../controllers/eventsSubmission.controller.js";

import {
    scoreSubmission,
    getSubmissionScores,
    retractScore,
    getJudgingProgress,
    getMyJudgingQueue,
} from "../controllers/eventScore.controller.js";

const router = Router();
router
    .route("/")
    .get(checkUser, getCompetitions)
    .post(
        verifyJWT,
        authorize("society_head", "admin"),
        upload.single("coverImage"),
        createCompetition
    );

router
    .route("/:eventId")
    .get(checkUser, getCompetitionById)
    .patch(
        verifyJWT,
        authorize("society_head", "admin"),
        upload.single("coverImage"),
        updateCompetition
    )
    .delete(
        verifyJWT,
        authorize("society_head", "admin"),
        deleteCompetition
    );
router.patch(
    "/:eventId/transition",
    verifyJWT,
    authorize("society_head", "admin"),
    transitionState
);
router.patch(
    "/:eventId/judges",
    verifyJWT,
    authorize("society_head", "admin"),
    updateJudges
);
router
    .route("/:eventId/announcements")
    .get(checkUser, getAnnouncements)
    .post(
        verifyJWT,
        authorize("society_head", "admin"),
        postAnnouncement
    );

router.get("/:eventId/leaderboard", checkUser, getLeaderboard);

router.patch(
    "/:eventId/leaderboard/publish",
    verifyJWT,
    authorize("society_head", "admin"),
    publishLeaderboard
);


router
    .route("/:eventId/teams")
    .get(verifyJWT, getTeams)
    .post(verifyJWT, createTeam);

// NOTE: /my-team before /:teamId to avoid collision
router.get("/:eventId/teams/my", verifyJWT, async (req, res, next) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Competition not found" });
    const team = await EventTeam.findUserTeam(event._id, req.user._id);
    const { ApiResponse } = await import("../utils/ApiResponse.js");
    return res.status(200).json(new ApiResponse(200, team, team ? "Team found" : "Not in a team"));
});

router
    .route("/:eventId/teams/:teamId")
    .get(verifyJWT, getTeamById)
    .patch(verifyJWT, updateTeam)
    .delete(verifyJWT, deleteTeam);

router.post("/:eventId/teams/:teamId/join", verifyJWT, joinTeam);
router.post("/:eventId/teams/:teamId/leave", verifyJWT, leaveTeam);

router.delete(
    "/:eventId/teams/:teamId/members/:userId",
    verifyJWT,
    kickMember
);

router.patch(
    "/:eventId/teams/:teamId/transfer",
    verifyJWT,
    transferLeadership
);

router.patch(
    "/:eventId/teams/:teamId/disqualify",
    verifyJWT,
    authorize("society_head", "admin"),
    disqualifyTeam
);

// NOTE: /my before /:subId to avoid collision
router.get("/:eventId/submissions/my", verifyJWT, getMySubmission);
router.get("/:eventId/submissions", verifyJWT, getSubmissions);
router.post("/:eventId/submissions", verifyJWT, upsertSubmission);
router.post(
    "/:eventId/submissions/files",
    verifyJWT,
    upload.single("file"),
    addFileToSubmission
);

router.delete(
    "/:eventId/submissions/files/:fileId",
    verifyJWT,
    removeFileFromSubmission
);
router.get("/:eventId/submissions/:subId", verifyJWT, getSubmissionById);

router.get(
    "/:eventId/judging/progress",
    verifyJWT,
    authorize("society_head", "admin"),
    getJudgingProgress
);

router.get("/:eventId/judging/my-queue", verifyJWT, getMyJudgingQueue);

router.post(
    "/:eventId/submissions/:subId/score",
    verifyJWT,
    scoreSubmission
);

router.get(
    "/:eventId/submissions/:subId/scores",
    verifyJWT,
    getSubmissionScores
);

router.delete(
    "/:eventId/submissions/:subId/scores/my",
    verifyJWT,
    retractScore
);

export default router;