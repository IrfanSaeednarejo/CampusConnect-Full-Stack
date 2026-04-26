import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openAuth.middleware.js";

import {
    registerUser,
    sendEmailVerification,
    verifyEmail,
    loginUser,
    logOutUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    changeCurrentPassword,
    getCurrentUser,
    getUserProfile,
    updateAccountDetails,
    updateAcademicInfo,
    updatePreferences,
    updateSocialLinks,
    updateInterests,
    updateUserAvatar,
    updateUserCoverImage,
    softDeleteAccount,
    getUserSocieties,
    searchUsers,
    updateOnboarding,
} from "../controllers/user.controller.js";

import {
    trackProfileView,
    getVisitors,
    addExperienceHandler,
    updateExperienceHandler,
    deleteExperienceHandler,
    addProjectHandler,
    updateProjectHandler,
    deleteProjectHandler,
    addEventParticipationHandler,
    updateEventParticipationHandler,
    deleteEventParticipationHandler,
} from "../controllers/profile.controller.js";

const router = Router();
router.route("/update-onboarding").patch(verifyJWT, updateOnboarding);

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/verify-email/:token").get(verifyEmail);

router
    .route("/profile/:userId")
    .get(checkUser, getUserProfile);



router.route("/logout").post(verifyJWT, logOutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);

router
    .route("/send-verification-email")
    .post(verifyJWT, sendEmailVerification);

router
    .route("/change-password")
    .patch(verifyJWT, changeCurrentPassword);

router
    .route("/update-account")
    .patch(verifyJWT, updateAccountDetails);

router
    .route("/update-academic")
    .patch(verifyJWT, updateAcademicInfo);

router
    .route("/update-preferences")
    .patch(verifyJWT, updatePreferences);

router
    .route("/update-social-links")
    .patch(verifyJWT, updateSocialLinks);

router
    .route("/update-interests")
    .patch(verifyJWT, updateInterests);

router
    .route("/avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
    .route("/cover-image")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router
    .route("/delete-account")
    .delete(verifyJWT, softDeleteAccount);

router
    .route("/search")
    .get(verifyJWT, searchUsers);

router
    .route("/:userId/societies")
    .get(verifyJWT, getUserSocieties);

router
    .route("/me/societies")
    .get(verifyJWT, getUserSocieties);

// ── Profile View Tracking ─────────────────────────────────────────────────────
// POST /api/v1/users/profile/:userId/view  → record a visit
router.post("/profile/:userId/view",      verifyJWT, trackProfileView);
// GET  /api/v1/users/profile/:userId/visitors → who viewed my profile (owner only)
router.get("/profile/:userId/visitors",   verifyJWT, getVisitors);

// ── Experience CRUD ───────────────────────────────────────────────────────────
router.post("/me/experience",                      verifyJWT, addExperienceHandler);
router.patch("/me/experience/:entryId",            verifyJWT, updateExperienceHandler);
router.delete("/me/experience/:entryId",           verifyJWT, deleteExperienceHandler);

// ── Projects CRUD ────────────────────────────────────────────────────────────
router.post("/me/projects",                        verifyJWT, upload.array("images", 3), addProjectHandler);
router.patch("/me/projects/:projectId",            verifyJWT, upload.array("images", 3), updateProjectHandler);
router.delete("/me/projects/:projectId",           verifyJWT, deleteProjectHandler);

// ── Event Participation CRUD ──────────────────────────────────────────────────
router.post("/me/event-participation",             verifyJWT, addEventParticipationHandler);
router.patch("/me/event-participation/:entryId",   verifyJWT, updateEventParticipationHandler);
router.delete("/me/event-participation/:entryId",  verifyJWT, deleteEventParticipationHandler);

export default router;