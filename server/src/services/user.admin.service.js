import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { AdminAuditLog, ADMIN_ACTIONS } from "../models/adminAuditLog.model.js";
import { SystemEvent } from "../models/systemEvent.model.js";
import { ApiError } from "../utils/ApiError.js";
import { paginate } from "../utils/paginate.js";
import { writeAuditLog } from "../utils/auditLog.js";
import { emitEvent } from "../utils/eventBus.js";
import { emitToUser } from "../sockets/index.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SAFE_SELECT =
    "-password -refreshToken -tokenVersion " +
    "-emailVerificationToken -emailVerificationExpiry " +
    "-passwordResetToken -passwordResetExpiry -lastLoginIp";

const findUserById = async (userId) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");
    const user = await User.findById(userId).select(SAFE_SELECT);
    if (!user || user.status === "deleted") throw new ApiError(404, "User not found");
    return user;
};

const assertCampusScope = (admin, targetUser) => {
    const isSuper = admin.roles?.includes("super_admin");
    if (isSuper) return;

    const adminCampus = admin.campusId?.toString();
    const userCampus = targetUser.campusId?.toString();

    if (adminCampus && userCampus && adminCampus !== userCampus) {
        throw new ApiError(403, "You can only manage users on your campus");
    }
};

const assertCanActOn = (admin, targetUser) => {
    const actorIsSuper = admin.roles?.includes("super_admin");
    const targetIsSuper = targetUser.roles?.includes("super_admin");
    if (targetIsSuper && !actorIsSuper) {
        throw new ApiError(403, "You cannot perform this action on a super_admin account");
    }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const listUsers = async (filter, options) => {
    return await paginate(User, filter, {
        page: options.page,
        limit: options.limit,
        select: "profile.displayName profile.firstName profile.lastName profile.avatar email roles status campusId lastLoginAt loginCount createdAt",
        sort: { createdAt: -1 },
        populate: [{ path: "campusId", select: "name code" }],
    });
};

export const getUserDetail = async (userId) => {
    const user = await User.findById(userId)
        .select(SAFE_SELECT)
        .populate("campusId", "name code city country")
        .populate("mentorProfile", "verified isActive tier totalSessions averageRating");

    if (!user || user.status === "deleted") throw new ApiError(404, "User not found");
    return user;
};

export const getUserActivity = async (userId) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const [adminActions, systemEvents] = await Promise.all([
        AdminAuditLog.find({ targetId: userId, targetModel: "User" })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("adminId", "profile.displayName")
            .lean(),
        SystemEvent.find({ actorId: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean(),
    ]);

    return [
        ...adminActions.map((e) => ({ ...e, _source: "admin_action" })),
        ...systemEvents.map((e) => ({ ...e, _source: "system_event" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100);
};

export const updateUserStatus = async (userId, status, reason, adminUser, req) => {
    if (userId === adminUser._id.toString()) {
        throw new ApiError(400, "You cannot suspend your own account");
    }

    const target = await findUserById(userId);
    assertCampusScope(adminUser, target);
    assertCanActOn(adminUser, target);

    if (target.status === status) {
        throw new ApiError(400, `User is already "${status}"`);
    }

    const previousStatus = target.status;
    const updates = {
        status,
        tokenVersion: (target.tokenVersion ?? 0) + 1,
        suspendReason: status === "suspended" ? (reason?.trim() || "") : "",
        suspendedAt: status === "suspended" ? new Date() : undefined,
        suspendedBy: status === "suspended" ? adminUser._id : undefined,
    };

    const updated = await User.findByIdAndUpdate(
        target._id,
        { $set: updates },
        { new: true }
    ).select("profile.displayName status roles campusId");

    const action = status === "suspended" ? ADMIN_ACTIONS.USER_SUSPENDED : ADMIN_ACTIONS.USER_REACTIVATED;

    await writeAuditLog({
        req,
        action,
        targetModel: "User",
        targetId: target._id,
        payload: { before: { status: previousStatus }, after: { status }, reason: reason?.trim() || "" },
    });

    await emitEvent(action + "@v1", {
        actorId: adminUser._id,
        targetId: target._id,
        payload: { status, reason: reason?.trim() || "" }
    });

    // Real-time Socket Trigger
    if (status === "suspended") {
        emitToUser(target._id, "user:suspension", { reason: reason?.trim() || "Administrative suspension" });
    }

    return updated;
};

export const updateUserRole = async (userId, roles, adminUser, req) => {
    const VALID_ROLES = ["student", "mentor", "society_head", "admin", "super_admin", "campus_admin", "read_only_admin"];
    const invalid = roles.filter((r) => !VALID_ROLES.includes(r));
    if (invalid.length > 0) {
        throw new ApiError(400, `Invalid roles: ${invalid.join(", ")}`);
    }

    const target = await findUserById(userId);

    if (roles.includes("super_admin") && !adminUser.roles?.includes("super_admin")) {
        throw new ApiError(403, "Only super_admins can assign the super_admin role");
    }

    const previousRoles = [...(target.roles || [])];

    const updated = await User.findByIdAndUpdate(
        target._id,
        { $set: { roles } },
        { new: true }
    ).select("profile.displayName roles status campusId");

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.USER_ROLE_CHANGED,
        targetModel: "User",
        targetId: target._id,
        payload: { before: { roles: previousRoles }, after: { roles } },
    });

    await emitEvent(ADMIN_ACTIONS.USER_ROLE_CHANGED + "@v1", {
        actorId: adminUser._id,
        targetId: target._id,
        payload: { roles }
    });

    return updated;
};

export const forceLogout = async (userId, adminUser, req) => {
    const target = await findUserById(userId);
    assertCampusScope(adminUser, target);
    assertCanActOn(adminUser, target);

    await User.findByIdAndUpdate(target._id, {
        $inc: { tokenVersion: 1 },
        $unset: { refreshToken: 1 },
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.USER_FORCE_LOGGED_OUT,
        targetModel: "User",
        targetId: target._id,
        payload: {},
    });

    await emitEvent(ADMIN_ACTIONS.USER_FORCE_LOGGED_OUT + "@v1", {
        actorId: adminUser._id,
        targetId: target._id
    });

    // Real-time Socket Trigger
    emitToUser(target._id, "user:logout", { message: "Your session has been terminated by an administrator." });
};

export const bulkSuspend = async (userIds, reason, adminUser, req) => {
    const filteredIds = userIds.filter((id) => id !== adminUser._id.toString());

    const BATCH_SIZE = 50;
    const succeeded = [];
    const failed = [];

    for (let i = 0; i < filteredIds.length; i += BATCH_SIZE) {
        const batch = filteredIds.slice(i, i + BATCH_SIZE);

        try {
            const result = await User.updateMany(
                {
                    _id: { $in: batch },
                    status: { $ne: "suspended" },
                    ...(adminUser.campusId && !adminUser.roles?.includes("super_admin")
                        ? { campusId: adminUser.campusId }
                        : {}),
                    roles: { $not: { $elemMatch: { $eq: "super_admin" } } },
                },
                {
                    $set: {
                        status: "suspended",
                        suspendReason: reason?.trim() || "Bulk suspension",
                        suspendedAt: new Date(),
                        suspendedBy: adminUser._id,
                    },
                    $inc: { tokenVersion: 1 },
                }
            );
            succeeded.push(...batch.slice(0, result.modifiedCount));
        } catch (err) {
            failed.push(...batch);
        }

        if (i + BATCH_SIZE < filteredIds.length) {
            await new Promise((r) => setTimeout(r, 50));
        }
    }

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.USER_BULK_SUSPENDED,
        payload: {
            reason: reason?.trim() || "",
            requested: userIds.length,
            succeeded: succeeded.length,
            failed: failed.length,
        },
    });

    await emitEvent(ADMIN_ACTIONS.USER_BULK_SUSPENDED + "@v1", {
        actorId: adminUser._id,
        payload: { succeeded: succeeded.length, failed: failed.length }
    });

    return { succeeded: succeeded.length, failed: failed.length };
};
