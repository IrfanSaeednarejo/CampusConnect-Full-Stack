import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { scopeQuery } from "../middlewares/adminAuth.middleware.js";
import * as userService from "../services/user.admin.service.js";

/**
 * GET /admin/users
 */
export const listUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, status, q } = req.query;

    let filter = scopeQuery(req, {});

    // Requirement: Bring All users except the current admin Profile
    filter._id = { $ne: req.user._id };

    if (status && status !== "all") filter.status = status;
    if (role) filter.roles = role;

    if (q?.trim()) {
        const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { "profile.displayName": { $regex: esc, $options: "i" } },
            { "profile.firstName": { $regex: esc, $options: "i" } },
            { "profile.lastName": { $regex: esc, $options: "i" } },
            { email: { $regex: esc, $options: "i" } },
        ];
    }

    const result = await userService.listUsers(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Users fetched successfully"));
});

/**
 * GET /admin/users/:userId
 */
export const getUserDetail = asyncHandler(async (req, res) => {
    const user = await userService.getUserDetail(req.params.userId);
    return res.status(200).json(new ApiResponse(200, user, "User detail fetched"));
});

/**
 * GET /admin/users/:userId/activity
 */
export const getUserActivity = asyncHandler(async (req, res) => {
    const timeline = await userService.getUserActivity(req.params.userId);
    return res.status(200).json(new ApiResponse(200, timeline, "User activity fetched"));
});

/**
 * PATCH /admin/users/:userId/status
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const VALID = ["active", "suspended"];

    if (!status || !VALID.includes(status)) {
        throw new ApiError(400, `status must be one of: ${VALID.join(", ")}`);
    }

    const updated = await userService.updateUserStatus(
        req.params.userId,
        status,
        reason,
        req.user,
        req
    );

    return res.status(200).json(
        new ApiResponse(200, updated, `User ${status === "suspended" ? "suspended" : "reactivated"} successfully`)
    );
});

/**
 * PATCH /admin/users/:userId/role
 */
export const updateUserRole = asyncHandler(async (req, res) => {
    const { roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
        throw new ApiError(400, "roles must be a non-empty array");
    }

    const updated = await userService.updateUserRole(req.params.userId, roles, req.user, req);
    return res.status(200).json(new ApiResponse(200, updated, "User roles updated successfully"));
});

/**
 * DELETE /admin/users/:userId/sessions
 */
export const forceLogout = asyncHandler(async (req, res) => {
    await userService.forceLogout(req.params.userId, req.user, req);
    return res.status(200).json(new ApiResponse(200, null, "User sessions terminated successfully"));
});

/**
 * POST /admin/users/bulk-suspend
 */
export const bulkSuspend = asyncHandler(async (req, res) => {
    const { userIds, reason } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError(400, "userIds must be a non-empty array");
    }
    if (userIds.length > 500) {
        throw new ApiError(400, "Maximum 500 users per bulk operation");
    }

    const result = await userService.bulkSuspend(userIds, reason, req.user, req);
    return res.status(200).json(new ApiResponse(200, result, "Bulk suspension complete"));
});
