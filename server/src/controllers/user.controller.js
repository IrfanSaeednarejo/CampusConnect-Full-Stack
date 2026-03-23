import crypto from "crypto";
import fs from "fs";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Society } from "../models/society.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
// import { sendEmail } from "../utils/mailer.js"; // Uncomment when mailer is implemented

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
};

const SAFE_SELECT =
    "-password -refreshToken -tokenVersion " +
    "-emailVerificationToken -emailVerificationExpiry " +
    "-passwordResetToken -passwordResetExpiry -lastLoginIp";

// ─── Private helpers ─────────────────────────────────────────────────────────

const uploadFile = async (localPath) => {
    if (!localPath) return null;
    try {
        return await uploadOnCloudinary(localPath);
    } finally {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
};



const issueTokens = async (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};


const applyPrivacyFilter = (target, requestingUserId) => {
    const isSelf = target._id?.toString() === requestingUserId?.toString();
    if (isSelf) return target;

    const prefs = target.preferences?.privacy || {};
    const filtered = { ...target };

    if (!prefs.showEmail) delete filtered.email;
    if (!prefs.showPhone) delete filtered.profile?.phone;
    if (!prefs.showOnlineStatus) delete filtered.lastLoginAt;

    delete filtered.preferences;
    delete filtered.onboarding;

    return filtered;
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// POST /api/v1/users/register
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, displayName, email, password } = req.body;

    if (
        ![firstName, lastName, displayName, email, password].every(
            (f) => typeof f === "string" && f.trim()
        )
    ) {
        [req.files?.avatar?.[0]?.path, req.files?.coverImage?.[0]?.path]
            .filter(Boolean)
            .forEach((p) => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        throw new ApiError(400, "All fields are required");
    }

    const displayNameLower = displayName.trim().toLowerCase();
    const emailLower = email.trim().toLowerCase();

    const exists = await User.findOne({
        $or: [{ email: emailLower }, { "profile.displayName": displayNameLower }],
    });

    if (exists) {
        [req.files?.avatar?.[0]?.path, req.files?.coverImage?.[0]?.path]
            .filter(Boolean)
            .forEach((p) => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        throw new ApiError(409, "An account with that email or display name already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

    const avatar = await uploadFile(avatarLocalPath);
    if (!avatar?.secure_url) throw new ApiError(500, "Avatar upload failed — please try again");

    const coverLocalPath = req.files?.coverImage?.[0]?.path;
    const cover = coverLocalPath ? await uploadFile(coverLocalPath) : null;

    const user = await User.create({
        email: emailLower,
        password,
        profile: {
            firstName: firstName.trim().toLowerCase(),
            lastName: lastName.trim().toLowerCase(),
            displayName: displayNameLower,
            avatar: avatar.secure_url,
            avatarPublicId: avatar.public_id,
            coverImage: cover?.secure_url || "",
            coverImagePublicId: cover?.public_id || "",
        },
    });

    const rawVerifyToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // TODO: uncomment when mailer is wired up
    // await sendEmail({
    //     to: user.email,
    //     subject: "Verify your CampusConnect account",
    //     template: "emailVerification",
    //     data: { token: rawVerifyToken, firstName: user.profile.firstName },
    // });

    const created = await User.findById(user._id).select(SAFE_SELECT);

    return res.status(201).json(
        new ApiResponse(201, created, "Account created. Check your email to verify before logging in.")
    );
});

// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/users/send-verification-email  (auth required)
const sendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user.emailVerified) {
        throw new ApiError(400, "Email address is already verified");
    }

    const rawToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // TODO: await sendEmail({ to: user.email, template: "emailVerification", data: { token: rawToken } });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Verification email sent — check your inbox"));
});

// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/users/verify-email/:token  (public)
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    if (!token) throw new ApiError(400, "Verification token is required");

    const user = await User.findByVerificationToken(token);
    if (!user) throw new ApiError(400, "Token is invalid or has expired — please request a new one");

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, null, "Email verified. You can now log in.")
    );
});

// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/users/login
const loginUser = asyncHandler(async (req, res) => {
    const { email, displayName, password } = req.body;

    if (!password) throw new ApiError(400, "Password is required");
    if (!email && !displayName) throw new ApiError(400, "Email or display name is required");

    const filter = email
        ? { email: email.trim().toLowerCase() }
        : { "profile.displayName": displayName.trim().toLowerCase() };

    const user = await User.findOne(filter).select("+password +tokenVersion +refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (user.status === "suspended") {
        const reason = user.suspendReason ? `: ${user.suspendReason}` : "";
        throw new ApiError(403, `Account suspended${reason}`);
    }
    if (user.status === "deleted" || user.status === "deactivated") {
        throw new ApiError(403, "This account has been deactivated");
    }

    // Uncomment to enforce email verification before login:
    // if (!user.emailVerified) {
    //     throw new ApiError(403, "Please verify your email before logging in");
    // }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const ip = (
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "unknown"
    );
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    user.loginCount = (user.loginCount ?? 0) + 1;

    const { accessToken, refreshToken } = await issueTokens(user);

    const loggedIn = await User.findById(user._id).select(SAFE_SELECT);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(new ApiResponse(200, { user: loggedIn, accessToken, refreshToken }, "Logged in successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/users/logout  (auth required)
const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/users/refresh-token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingToken) throw new ApiError(401, "Refresh token is required");

    let decoded;
    try {
        decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        const msg = err.name === "TokenExpiredError"
            ? "Refresh token has expired — please log in again"
            : "Invalid refresh token";
        throw new ApiError(401, msg);
    }

    const user = await User.findById(decoded._id).select("+refreshToken +tokenVersion");
    if (!user) throw new ApiError(401, "User no longer exists");

    if (decoded.tokenVersion !== user.tokenVersion) {
        throw new ApiError(401, "Session has been revoked — please log in again");
    }

    const hashedIncoming = crypto
        .createHash("sha256")
        .update(incomingToken)
        .digest("hex");

    if (hashedIncoming !== user.refreshToken) {
        user.tokenVersion += 1;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(401, "Refresh token is invalid or has already been used — please log in again");
    }

    const accessToken = user.generateAccessToken();

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/users/forgot-password  (public)
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user) {
        const rawToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // TODO: await sendEmail({
        //     to: user.email,
        //     subject: "Reset your CampusConnect password",
        //     template: "passwordReset",
        //     data: { token: rawToken, firstName: user.profile.firstName },
        // });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "If that email is registered, a reset link has been sent"));
});

// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/users/reset-password/:token  (public)
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) throw new ApiError(400, "Reset token is required");
    if (!password || !confirmPassword) throw new ApiError(400, "Both password fields are required");
    if (password !== confirmPassword) throw new ApiError(400, "Passwords do not match");
    if (password.length < 8) throw new ApiError(400, "Password must be at least 8 characters");

    const user = await User.findByPasswordResetToken(token);
    if (!user) throw new ApiError(400, "Reset token is invalid or has expired — please request a new one");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.tokenVersion += 1;
    user.refreshToken = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successful — please log in with your new password")
    );
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/users/change-password  (auth required)
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All three password fields are required");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New passwords do not match");
    }
    if (newPassword.length < 8) {
        throw new ApiError(400, "New password must be at least 8 characters");
    }
    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different from the current one");
    }

    const user = await User.findById(req.user._id).select("+password");
    const isCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isCorrect) throw new ApiError(400, "Current password is incorrect");

    user.password = newPassword;
    user.tokenVersion += 1;
    user.refreshToken = undefined;
    await user.save();

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, null, "Password changed successfully — please log in again"));
});

// ─── PROFILE ─────────────────────────────────────────────────────────────────

// GET /api/v1/users/current-user  (auth required)
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(SAFE_SELECT).lean();
    return res.status(200).json(new ApiResponse(200, user, "Current user fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/users/profile/:userId
const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const target = await User.findById(userId)
        .select(
            "profile academic interests socialLinks roles campusId " +
            "preferences.privacy lastLoginAt status mentorVerification " +
            "societyHeadVerification createdAt"
        )
        .lean();

    if (!target || target.status === "deleted") {
        throw new ApiError(404, "User not found");
    }

    const prefs = target.preferences?.privacy || {};
    if (prefs.profileVisibility === "campus") {
        const isSelf = req.user?._id?.toString() === target._id?.toString();
        const isSameCampus = req.user?.campusId?.toString() === target.campusId?.toString();
        if (!isSelf && !isSameCampus) {
            throw new ApiError(403, "This profile is only visible to campus members");
        }
    }

    const filtered = applyPrivacyFilter(target, req.user?._id);
    return res.status(200).json(new ApiResponse(200, filtered, "Profile fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/users/update-account
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { firstName, lastName, displayName, bio, phone, email } = req.body;

    const updates = {};

    if (firstName) updates["profile.firstName"] = firstName.trim().toLowerCase();
    if (lastName) updates["profile.lastName"] = lastName.trim().toLowerCase();
    if (bio !== undefined) updates["profile.bio"] = bio.trim();
    if (phone !== undefined) updates["profile.phone"] = phone.trim();

    if (displayName) {
        const dn = displayName.trim().toLowerCase();
        if (dn !== req.user.profile.displayName) {
            const taken = await User.findOne({ "profile.displayName": dn });
            if (taken) throw new ApiError(409, "Display name is already taken");
        }
        updates["profile.displayName"] = dn;
    }

    if (email) {
        const em = email.trim().toLowerCase();
        if (em !== req.user.email) {
            const taken = await User.findOne({ email: em });
            if (taken) throw new ApiError(409, "Email is already registered to another account");
            updates.email = em;
            updates.emailVerified = false;
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided — nothing to update");
    }

    const updated = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return res.status(200).json(new ApiResponse(200, updated, "Profile updated"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/users/update-academic
const updateAcademicInfo = asyncHandler(async (req, res) => {
    const {
        degree, department, semester,
        enrollmentYear, expectedGraduation,
        cgpa, gpaScale, studentId,
    } = req.body;

    const updates = {};
    if (degree !== undefined) updates["academic.degree"] = degree.trim();
    if (department !== undefined) updates["academic.department"] = department.trim();
    if (semester !== undefined) updates["academic.semester"] = semester;
    if (enrollmentYear !== undefined) updates["academic.enrollmentYear"] = enrollmentYear;
    if (expectedGraduation !== undefined) updates["academic.expectedGraduation"] = expectedGraduation;
    if (cgpa !== undefined) updates["academic.cgpa"] = cgpa;
    if (gpaScale !== undefined) updates["academic.gpaScale"] = gpaScale;
    if (studentId !== undefined) updates["academic.studentId"] = studentId.trim();

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No academic fields provided");
    }

    const updated = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return res.status(200).json(new ApiResponse(200, updated, "Academic info updated"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/users/update-preferences
const updatePreferences = asyncHandler(async (req, res) => {
    const { notifications, privacy, theme, language } = req.body;

    const updates = {};

    if (theme !== undefined) updates["preferences.theme"] = theme;
    if (language !== undefined) updates["preferences.language"] = language;

    if (notifications) {
        const { email, push, inApp, digest } = notifications;
        if (email !== undefined) updates["preferences.notifications.email"] = email;
        if (push !== undefined) updates["preferences.notifications.push"] = push;
        if (inApp !== undefined) updates["preferences.notifications.inApp"] = inApp;
        if (digest !== undefined) updates["preferences.notifications.digest"] = digest;
    }

    if (privacy) {
        const { showEmail, showPhone, showOnlineStatus, profileVisibility } = privacy;
        if (showEmail !== undefined) updates["preferences.privacy.showEmail"] = showEmail;
        if (showPhone !== undefined) updates["preferences.privacy.showPhone"] = showPhone;
        if (showOnlineStatus !== undefined) updates["preferences.privacy.showOnlineStatus"] = showOnlineStatus;
        if (profileVisibility !== undefined) updates["preferences.privacy.profileVisibility"] = profileVisibility;
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No preference fields provided");
    }

    const updated = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return res.status(200).json(new ApiResponse(200, updated, "Preferences updated"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/users/update-social-links
const updateSocialLinks = asyncHandler(async (req, res) => {
    const { socialLinks } = req.body;

    if (!Array.isArray(socialLinks)) {
        throw new ApiError(400, "socialLinks must be an array");
    }
    if (socialLinks.length > 10) {
        throw new ApiError(400, "Maximum 10 social links allowed");
    }

    const VALID_PROVIDERS = ["github", "linkedin", "twitter", "instagram", "portfolio", "other"];
    for (const link of socialLinks) {
        if (!VALID_PROVIDERS.includes(link.provider)) {
            throw new ApiError(400, `Invalid provider: "${link.provider}"`);
        }
        if (link.url && !/^https?:\/\/.+/.test(link.url)) {
            throw new ApiError(400, `Invalid URL for provider "${link.provider}"`);
        }
    }

    const updated = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { socialLinks } },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return res.status(200).json(new ApiResponse(200, updated, "Social links updated"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/users/update-interests  (auth required)
const updateInterests = asyncHandler(async (req, res) => {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
        throw new ApiError(400, "interests must be an array of strings");
    }
    if (interests.length > 20) {
        throw new ApiError(400, "Maximum 20 interests allowed");
    }

    const clean = [...new Set(
        interests.map((i) => i.trim().toLowerCase()).filter(Boolean)
    )];

    const updated = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { interests: clean } },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return res.status(200).json(new ApiResponse(200, updated, "Interests updated"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/users/avatar  (auth required, multipart)
const updateUserAvatar = asyncHandler(async (req, res) => {
    const localPath = req.file?.path;
    if (!localPath) throw new ApiError(400, "Avatar file is missing");

    const uploaded = await uploadFile(localPath);
    if (!uploaded?.secure_url) throw new ApiError(500, "Avatar upload failed — please try again");

    const oldPublicId = req.user.profile?.avatarPublicId;
    if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) =>
            console.error("[Cloudinary] Failed to delete old avatar:", err)
        );
    }

    const updated = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                "profile.avatar": uploaded.secure_url,
                "profile.avatarPublicId": uploaded.public_id,
            },
        },
        { new: true }
    ).select(SAFE_SELECT);

    return res.status(200).json(new ApiResponse(200, updated, "Avatar updated"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/users/cover-image  (auth required, multipart)
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const localPath = req.file?.path;
    if (!localPath) throw new ApiError(400, "Cover image file is missing");

    const uploaded = await uploadFile(localPath);
    if (!uploaded?.secure_url) throw new ApiError(500, "Cover image upload failed — please try again");

    const oldPublicId = req.user.profile?.coverImagePublicId;
    if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) =>
            console.error("[Cloudinary] Failed to delete old cover image:", err)
        );
    }

    const updated = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                "profile.coverImage": uploaded.secure_url,
                "profile.coverImagePublicId": uploaded.public_id,
            },
        },
        { new: true }
    ).select(SAFE_SELECT);

    return res.status(200).json(new ApiResponse(200, updated, "Cover image updated"));
});

// ─── ACCOUNT LIFECYCLE ────────────────────────────────────────────────────────

// DELETE /api/v1/users/delete-account  (auth required)
// Soft-delete: marks the account as deleted but keeps the DB record for audit purposes.
const softDeleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) throw new ApiError(400, "Password confirmation is required to delete your account");

    const user = await User.findById(req.user._id).select("+password");
    const isCorrect = await user.isPasswordCorrect(password);
    if (!isCorrect) throw new ApiError(400, "Incorrect password");

    user.status = "deleted";
    user.deletedAt = new Date();
    user.tokenVersion += 1;
    user.refreshToken = undefined;
    // Anonymise the email to free it for potential re-registration
    user.email = `deleted_${user._id}_${user.email}`;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, null, "Account deleted successfully"));
});

// ─── DISCOVERY ────────────────────────────────────────────────────────────────

// GET /api/v1/users/:userId/societies  (auth required)
const getUserSocieties = asyncHandler(async (req, res) => {
    const targetId = req.params.userId || req.user._id;

    const societies = await Society.find({ "members.memberId": targetId })
        .select("name tag description createdBy status createdAt")
        .populate("createdBy", "profile.displayName profile.avatar")
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            societies,
            `Found ${societies.length} societ${societies.length === 1 ? "y" : "ies"}`
        )
    );
});

// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/users/search?q=&page=&limit=  (auth required)
const searchUsers = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
        throw new ApiError(400, "Search query must be at least 2 characters");
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;
    const escapedQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filter = {
        campusId: req.user.campusId,
        status: "active",
        $or: [
            { "profile.displayName": { $regex: escapedQ, $options: "i" } },
            { "profile.firstName": { $regex: escapedQ, $options: "i" } },
            { "profile.lastName": { $regex: escapedQ, $options: "i" } },
        ],
    };

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("profile.displayName profile.firstName profile.lastName profile.avatar roles campusId")
            .skip(skip)
            .limit(limitNum)
            .lean(),
        User.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            },
        }, `${total} result${total === 1 ? "" : "s"} found`)
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