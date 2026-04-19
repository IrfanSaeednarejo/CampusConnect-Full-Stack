import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as systemService from "../services/system.admin.service.js";

/**
 * GET /admin/system/health
 */
export const getSystemHealth = asyncHandler(async (req, res) => {
    const io = req.app.get("io");
    const health = await systemService.getSystemHealth(io);
    return res.status(200).json(new ApiResponse(200, health, "System health fetched"));
});

/**
 * GET /admin/system/flags
 */
export const getFeatureFlags = asyncHandler(async (_req, res) => {
    const flags = await systemService.getFeatureFlags();
    return res.status(200).json(new ApiResponse(200, flags, "Feature flags fetched"));
});

/**
 * PATCH /admin/system/flags
 */
export const toggleFeatureFlag = asyncHandler(async (req, res) => {
    const { flag, enabled } = req.body;

    if (!flag || typeof flag !== "string") {
        throw new ApiError(400, "flag name is required");
    }
    if (typeof enabled !== "boolean") {
        throw new ApiError(400, "enabled must be a boolean");
    }

    const flags = await systemService.toggleFeatureFlag(flag, enabled, req.user, req);
    return res.status(200).json(new ApiResponse(200, flags, `Flag "${flag}" ${enabled ? "enabled" : "disabled"}`));
});

/**
 * PATCH /admin/system/maintenance
 */
export const toggleMaintenance = asyncHandler(async (req, res) => {
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
        throw new ApiError(400, "enabled must be a boolean");
    }

    const io = req.app.get("io");
    const result = await systemService.toggleMaintenance(enabled, req.user, req, io);

    return res.status(200).json(
        new ApiResponse(200, result, `Maintenance mode ${enabled ? "ENABLED" : "DISABLED"}`)
    );
});
