import { User } from "../models/user.model.js";
import { Society } from "../models/society.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

// ────────────── PLATFORM STATS ──────────────
export const getPlatformStats = async () => {
    const [totalUsers, totalMentors, totalSocietyHeads, totalSocieties, totalEvents] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ roles: "mentor" }),
        User.countDocuments({ roles: "society_head" }),
        Society.countDocuments(),
        mongoose.connection.db.collection("events").countDocuments().catch(() => 0),
    ]);

    const totalStudents = totalUsers - totalMentors - totalSocietyHeads;

    const pendingMentors = await User.countDocuments({
        "mentorVerification.isVerified": false,
        roles: { $ne: "mentor" },
        "onboarding.roleSelected": "mentor",
    }).catch(() => 0);

    const pendingSocietyHeads = await User.countDocuments({
        "societyHeadVerification.isVerified": false,
        roles: { $ne: "society_head" },
        "onboarding.roleSelected": "society_head",
    }).catch(() => 0);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    return {
        totalUsers,
        totalStudents: totalStudents > 0 ? totalStudents : totalUsers,
        totalMentors,
        totalSocietyHeads,
        totalSocieties,
        totalEvents,
        pendingMentors,
        pendingSocietyHeads,
        recentRegistrations,
    };
};

// ────────────── USER MANAGEMENT ──────────────
export const getAllUsersAdmin = async (queryParams) => {
    const { page = 1, limit = 20, search, role, status } = queryParams;
    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
        filter.$or = [
            { email: { $regex: search, $options: "i" } },
            { "profile.displayName": { $regex: search, $options: "i" } },
            { "profile.firstName": { $regex: search, $options: "i" } },
            { "profile.lastName": { $regex: search, $options: "i" } },
        ];
    }

    if (role) {
        filter.roles = role;
    }

    if (status === "suspended") {
        filter.status = "suspended";
    } else if (status === "active") {
        filter.status = { $ne: "suspended" };
    }

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("email roles profile academic createdAt emailVerified status suspendedAt suspendReason")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        User.countDocuments(filter),
    ]);

    return {
        users,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

export const getUserByIdAdmin = async (userId) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const user = await User.findById(userId)
        .select("-password -refreshToken -passwordResetToken -passwordResetExpiry -emailVerificationToken -emailVerificationExpiry")
        .lean();

    if (!user) throw new ApiError(404, "User not found");
    return user;
};

export const updateUserRoles = async (userId, roles) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const validRoles = ["student", "mentor", "society_head", "admin"];
    for (const role of roles) {
        if (!validRoles.includes(role)) throw new ApiError(400, `Invalid role: ${role}`);
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { roles } },
        { new: true, runValidators: true }
    ).select("email roles profile.displayName");

    if (!user) throw new ApiError(404, "User not found");
    return user;
};

export const suspendUserAdmin = async (userId, reason) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                status: "suspended",
                suspendReason: reason || "Suspended by admin",
                suspendedAt: new Date(),
            },
        },
        { new: true }
    ).select("email roles profile.displayName status suspendReason suspendedAt");

    if (!user) throw new ApiError(404, "User not found");
    return user;
};

export const unsuspendUserAdmin = async (userId) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                status: "active",
                suspendReason: "",
                suspendedAt: null,
            },
        },
        { new: true }
    ).select("email roles profile.displayName status");

    if (!user) throw new ApiError(404, "User not found");
    return user;
};

export const deleteUserAdmin = async (userId) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (user.roles.includes("admin")) throw new ApiError(403, "Cannot delete an admin account");

    await User.findByIdAndDelete(userId);
    return { message: "User deleted successfully" };
};

// ────────────── MENTOR VERIFICATION ──────────────
export const getPendingMentorApprovals = async () => {
    // Find users who selected 'mentor' in onboarding but haven't been verified yet
    const pendingMentors = await User.find({
        $or: [
            { "onboarding.roleSelected": "mentor", "mentorVerification.isVerified": { $ne: true } },
            { roles: "mentor", "mentorVerification.isVerified": { $ne: true } },
        ],
    })
        .select("email profile academic mentorVerification onboarding createdAt")
        .sort({ createdAt: -1 })
        .lean();

    return pendingMentors;
};

export const approveMentor = async (userId, adminId) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Add mentor role if not present
    if (!user.roles.includes("mentor")) {
        user.roles.push("mentor");
    }

    user.mentorVerification = {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId,
    };

    await user.save({ validateBeforeSave: false });
    return user;
};

export const rejectMentor = async (userId, reason) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    user.mentorVerification = {
        isVerified: false,
        rejectedAt: new Date(),
        rejectedReason: reason || "Application rejected by admin",
    };

    // Remove mentor role if present
    user.roles = user.roles.filter((r) => r !== "mentor");

    await user.save({ validateBeforeSave: false });
    return user;
};

// ────────────── SOCIETY HEAD VERIFICATION ──────────────
export const getPendingSocietyHeadApprovals = async () => {
    const pendingSocietyHeads = await User.find({
        $or: [
            { "onboarding.roleSelected": "society_head", "societyHeadVerification.isVerified": { $ne: true } },
            { roles: "society_head", "societyHeadVerification.isVerified": { $ne: true } },
        ],
    })
        .select("email profile academic societyHeadVerification onboarding createdAt")
        .sort({ createdAt: -1 })
        .lean();

    return pendingSocietyHeads;
};

export const approveSocietyHead = async (userId, adminId) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (!user.roles.includes("society_head")) {
        user.roles.push("society_head");
    }

    user.societyHeadVerification = {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId,
    };

    await user.save({ validateBeforeSave: false });
    return user;
};

export const rejectSocietyHead = async (userId, reason) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    user.societyHeadVerification = {
        isVerified: false,
        rejectedAt: new Date(),
        rejectedReason: reason || "Application rejected by admin",
    };

    user.roles = user.roles.filter((r) => r !== "society_head");

    await user.save({ validateBeforeSave: false });
    return user;
};

// ────────────── SOCIETY OVERSIGHT ──────────────
export const getAllSocietiesAdmin = async (queryParams) => {
    const { page = 1, limit = 20, search } = queryParams;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { tag: { $regex: search, $options: "i" } },
        ];
    }

    const [societies, total] = await Promise.all([
        Society.find(filter)
            .populate("createdBy", "email profile.displayName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Society.countDocuments(filter),
    ]);

    return {
        societies,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    };
};

export const deleteSocietyAdmin = async (societyId) => {
    if (!mongoose.isValidObjectId(societyId)) throw new ApiError(400, "Invalid society ID");

    const society = await Society.findByIdAndDelete(societyId);
    if (!society) throw new ApiError(404, "Society not found");

    return { message: `Society "${society.name}" deleted successfully` };
};
