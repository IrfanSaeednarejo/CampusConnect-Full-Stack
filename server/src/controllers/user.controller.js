import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as userService from "../services/user.service.js";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

const registerUser = asyncHandler(async (req, res) => {
    const created = await userService.register(req.body, req.files);
    return res.status(201).json(
        new ApiResponse(201, created, "Account created. Check your email to verify before logging in.")
    );
});

const sendEmailVerification = asyncHandler(async (req, res) => {
    await userService.sendVerification(req.user._id);
    return res.status(200).json(new ApiResponse(200, null, "Verification email sent — check your inbox"));
});

const verifyEmail = asyncHandler(async (req, res) => {
    await userService.verifyEmail(req.params.token);
    return res.status(200).json(
        new ApiResponse(200, null, "Email verified. You can now log in.")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
    const { user, accessToken, refreshToken } = await userService.login(req.body, ip);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(new ApiResponse(200, { user, accessToken, refreshToken }, "Logged in successfully"));
});

const logOutUser = asyncHandler(async (req, res) => {
    await userService.logout(req.user._id);
    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const { accessToken } = await userService.refreshToken(incomingToken);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    await userService.forgotPassword(req.body.email);
    return res
        .status(200)
        .json(new ApiResponse(200, null, "If that email is registered, a reset link has been sent"));
});

const resetPassword = asyncHandler(async (req, res) => {
    await userService.resetPassword(req.params.token, req.body);
    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successful — please log in with your new password")
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    await userService.changePassword(req.user._id, req.body);
    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, null, "Password changed successfully — please log in again"));
});

// ─── PROFILE ─────────────────────────────────────────────────────────────────

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await userService.getCurrentUser(req.user._id);
    return res.status(200).json(new ApiResponse(200, user, "Current user fetched"));
});

const getUserProfile = asyncHandler(async (req, res) => {
    const profile = await userService.getProfile(req.params.userId, req.user);
    return res.status(200).json(new ApiResponse(200, profile, "Profile fetched"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const updated = await userService.updateAccount(req.user._id, req.user, req.body);
    return res.status(200).json(new ApiResponse(200, updated, "Profile updated"));
});

const updateAcademicInfo = asyncHandler(async (req, res) => {
    const updated = await userService.updateAcademic(req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, updated, "Academic info updated"));
});

const updatePreferences = asyncHandler(async (req, res) => {
    const updated = await userService.updatePreferences(req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, updated, "Preferences updated"));
});

const updateSocialLinks = asyncHandler(async (req, res) => {
    const updated = await userService.updateSocial(req.user._id, req.body.socialLinks);
    return res.status(200).json(new ApiResponse(200, updated, "Social links updated"));
});

const updateInterests = asyncHandler(async (req, res) => {
    const updated = await userService.updateInterests(req.user._id, req.body.interests);
    return res.status(200).json(new ApiResponse(200, updated, "Interests updated"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const updated = await userService.updateAvatar(req.user._id, req.user, req.file?.path);
    return res.status(200).json(new ApiResponse(200, updated, "Avatar updated"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const updated = await userService.updateCoverImage(req.user._id, req.user, req.file?.path);
    return res.status(200).json(new ApiResponse(200, updated, "Cover image updated"));
});

// ─── ACCOUNT LIFECYCLE ────────────────────────────────────────────────────────

const softDeleteAccount = asyncHandler(async (req, res) => {
    await userService.softDelete(req.user._id, req.body.password);
    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, null, "Account deleted successfully"));
});

// ─── DISCOVERY ────────────────────────────────────────────────────────────────

const getUserSocieties = asyncHandler(async (req, res) => {
    const targetId = req.params.userId || req.user._id;
    const societies = await userService.getSocieties(targetId);
    return res.status(200).json(
        new ApiResponse(
            200,
            societies,
            `Found ${societies.length} societ${societies.length === 1 ? "y" : "ies"}`
        )
    );
});

const searchUsers = asyncHandler(async (req, res) => {
    const result = await userService.search(req.user, req.query);
    return res.status(200).json(
        new ApiResponse(200, result, `${result.pagination.total} result${result.pagination.total === 1 ? "" : "s"} found`)
    );
});

export {
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
};