import crypto from "crypto";
import fs from "fs";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Society } from "../models/society.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
// import { sendEmail } from "../utils/mailer.js"; // Uncomment when mailer is implemented

export const SAFE_SELECT =
    "-password -refreshToken -tokenVersion " +
    "-emailVerificationToken -emailVerificationExpiry " +
    "-passwordResetToken -passwordResetExpiry -lastLoginIp";

const uploadFile = async (localPath) => {
    if (!localPath) return null;
    try {
        return await uploadOnCloudinary(localPath);
    } finally {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
};

export const issueTokens = async (user) => {
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

export const register = async (data, files) => {
    const { firstName, lastName, displayName, email, password, role, roles } = data;

    if (
        ![firstName, displayName, email, password].every(
            (f) => typeof f === "string" && f.trim()
        )
    ) {
        [files?.avatar?.[0]?.path, files?.coverImage?.[0]?.path]
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
        [files?.avatar?.[0]?.path, files?.coverImage?.[0]?.path]
            .filter(Boolean)
            .forEach((p) => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        throw new ApiError(409, "An account with that email or display name already exists");
    }

    const avatarLocalPath = files?.avatar?.[0]?.path;
    let avatarUrl = "https://res.cloudinary.com/dj2i23nm2/image/upload/v1727976856/default_avatar.png";
    let avatarPublicId = "";

    if (avatarLocalPath) {
        const avatarUpload = await uploadFile(avatarLocalPath);
        if (avatarUpload?.secure_url) {
            avatarUrl = avatarUpload.secure_url;
            avatarPublicId = avatarUpload.public_id;
        }
    }

    const coverLocalPath = files?.coverImage?.[0]?.path;
    const cover = coverLocalPath ? await uploadFile(coverLocalPath) : null;

    const requestedRole = roles || role;
    const assignedRoles = requestedRole && ["student", "mentor", "society_head", "admin"].includes(requestedRole)
        ? [requestedRole.toLowerCase()]
        : ["student"];

    const user = await User.create({
        email: emailLower,
        password,
        roles: assignedRoles,
        profile: {
            firstName: firstName.trim().toLowerCase(),
            lastName: lastName.trim().toLowerCase(),
            displayName: displayNameLower,
            avatar: avatarUrl,
            avatarPublicId: avatarPublicId,
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
    return created;
};

export const sendVerification = async (userId) => {
    const user = await User.findById(userId);

    if (user.emailVerified) {
        throw new ApiError(400, "Email address is already verified");
    }

    const rawToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // TODO: await sendEmail({ to: user.email, template: "emailVerification", data: { token: rawToken } });
    return true;
};

export const verifyEmail = async (token) => {
    if (!token) throw new ApiError(400, "Verification token is required");

    const user = await User.findByVerificationToken(token);
    if (!user) throw new ApiError(400, "Token is invalid or has expired — please request a new one");

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return true;
};

export const login = async (data, ip) => {
    const { email, displayName, password } = data;

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

    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    user.loginCount = (user.loginCount ?? 0) + 1;

    const { accessToken, refreshToken } = await issueTokens(user);
    const loggedIn = await User.findById(user._id).select(SAFE_SELECT);

    return { user: loggedIn, accessToken, refreshToken };
};

export const logout = async (userId) => {
    await User.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );
    return true;
};

export const refreshToken = async (incomingToken) => {
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
    return { accessToken };
};

export const forgotPassword = async (email) => {
    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user) {
        const rawToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // TODO: await sendEmail
    }
    return true;
};

export const resetPassword = async (token, passwords) => {
    const { password, confirmPassword } = passwords;

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
    return true;
};

export const changePassword = async (userId, passwords) => {
    const { oldPassword, newPassword, confirmPassword } = passwords;

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

    const user = await User.findById(userId).select("+password");
    const isCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isCorrect) throw new ApiError(400, "Current password is incorrect");

    user.password = newPassword;
    user.tokenVersion += 1;
    user.refreshToken = undefined;
    await user.save();
    return true;
};

export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select(SAFE_SELECT).lean();
    return user;
};

export const getProfile = async (targetId, requestUser) => {
    const target = await User.findById(targetId)
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
        const isSelf = requestUser?._id?.toString() === target._id?.toString();
        const isSameCampus = requestUser?.campusId?.toString() === target.campusId?.toString();
        if (!isSelf && !isSameCampus) {
            throw new ApiError(403, "This profile is only visible to campus members");
        }
    }

    const filtered = applyPrivacyFilter(target, requestUser?._id);
    return filtered;
};

export const updateAccount = async (userId, userObj, updatesData) => {
    const { firstName, lastName, displayName, bio, phone, email, campusId } = updatesData;

    const updates = {};

    if (firstName) updates["profile.firstName"] = firstName.trim().toLowerCase();
    if (lastName) updates["profile.lastName"] = lastName.trim().toLowerCase();
    if (bio !== undefined) updates["profile.bio"] = bio.trim();
    if (phone !== undefined) updates["profile.phone"] = phone.trim();
    if (campusId) updates.campusId = campusId;

    if (displayName) {
        const dn = displayName.trim().toLowerCase();
        if (dn !== userObj.profile.displayName) {
            const taken = await User.findOne({ "profile.displayName": dn });
            if (taken) throw new ApiError(409, "Display name is already taken");
        }
        updates["profile.displayName"] = dn;
    }

    if (email) {
        const em = email.trim().toLowerCase();
        if (em !== userObj.email) {
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
        userId,
        { $set: updates },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return updated;
};

export const updateAcademic = async (userId, updatesData) => {
    const {
        degree, department, semester,
        enrollmentYear, expectedGraduation,
        cgpa, gpaScale, studentId,
    } = updatesData;

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
        userId,
        { $set: updates },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return updated;
};

export const updatePreferences = async (userId, preferencesData) => {
    const { notifications, privacy, theme, language } = preferencesData;

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
        userId,
        { $set: updates },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return updated;
};

export const updateSocial = async (userId, socialLinks) => {
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
        userId,
        { $set: { socialLinks } },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return updated;
};

export const updateInterests = async (userId, interests) => {
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
        userId,
        { $set: { interests: clean } },
        { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    return updated;
};

export const updateAvatar = async (userId, userObj, localPath) => {
    if (!localPath) throw new ApiError(400, "Avatar file is missing");

    const uploaded = await uploadFile(localPath);
    if (!uploaded?.secure_url) throw new ApiError(500, "Avatar upload failed — please try again");

    const oldPublicId = userObj.profile?.avatarPublicId;
    if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) =>
            console.error("[Cloudinary] Failed to delete old avatar:", err)
        );
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                "profile.avatar": uploaded.secure_url,
                "profile.avatarPublicId": uploaded.public_id,
            },
        },
        { new: true }
    ).select(SAFE_SELECT);

    return updated;
};

export const updateCoverImage = async (userId, userObj, localPath) => {
    if (!localPath) throw new ApiError(400, "Cover image file is missing");

    const uploaded = await uploadFile(localPath);
    if (!uploaded?.secure_url) throw new ApiError(500, "Cover image upload failed — please try again");

    const oldPublicId = userObj.profile?.coverImagePublicId;
    if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) =>
            console.error("[Cloudinary] Failed to delete old cover image:", err)
        );
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                "profile.coverImage": uploaded.secure_url,
                "profile.coverImagePublicId": uploaded.public_id,
            },
        },
        { new: true }
    ).select(SAFE_SELECT);

    return updated;
};

export const softDelete = async (userId, password) => {
    if (!password) throw new ApiError(400, "Password confirmation is required to delete your account");

    const user = await User.findById(userId).select("+password");
    const isCorrect = await user.isPasswordCorrect(password);
    if (!isCorrect) throw new ApiError(400, "Incorrect password");

    user.status = "deleted";
    user.deletedAt = new Date();
    user.tokenVersion += 1;
    user.refreshToken = undefined;

    user.email = `deleted_${user._id}_${user.email}`;

    await user.save({ validateBeforeSave: false });
    return true;
};

export const getSocieties = async (targetId) => {
    const societies = await Society.find({
        $or: [
            { "members.memberId": targetId },
            { createdBy: targetId }
        ]
    })
        .select("name tag description createdBy status createdAt")
        .populate("createdBy", "profile.displayName profile.avatar")
        .lean();
    return societies;
};

export const search = async (requestUser, queryParams) => {
    const { q, page = 1, limit = 20 } = queryParams;

    const pageNum = Math.max(1, parseInt(page, 10));
    // Support limit=0 for fetching all records without pagination limits
    const limitNum = limit === "0" || limit === 0 ? 0 : Math.min(50, parseInt(limit, 10));
    const skip = limitNum === 0 ? 0 : (pageNum - 1) * limitNum;

    const filter = {
        campusId: requestUser.campusId,
        status: "active",
    };

    if (q && q.trim().length >= 2) {
        const escapedQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { "profile.displayName": { $regex: escapedQ, $options: "i" } },
            { "profile.firstName": { $regex: escapedQ, $options: "i" } },
            { "profile.lastName": { $regex: escapedQ, $options: "i" } },
        ];
    } else if (q && q.trim().length > 0 && q.trim().length < 2) {
        throw new ApiError(400, "Search query must be at least 2 characters if provided");
    }

    let query = User.find(filter).select("profile.displayName profile.firstName profile.lastName profile.avatar roles campusId");

    if (limitNum > 0) {
        query = query.skip(skip).limit(limitNum);
    }

    const [users, total] = await Promise.all([
        query.lean(),
        User.countDocuments(filter),
    ]);

    return {
        users,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
        },
    };
};
