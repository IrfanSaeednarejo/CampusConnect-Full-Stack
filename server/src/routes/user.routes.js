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
} from "../controllers/user.controller.js";

const router = Router();

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

export default router;