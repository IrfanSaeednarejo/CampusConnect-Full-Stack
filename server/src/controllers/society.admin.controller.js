import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { scopeQuery } from "../middlewares/adminAuth.middleware.js";
import * as societyService from "../services/society.admin.service.js";

/**
 * POST /admin/societies
 */
export const createSociety = asyncHandler(async (req, res) => {
    try {
        const society = await societyService.adminCreateSociety(req.body, req.user, req);
        return res.status(201).json(new ApiResponse(201, society, "Society created successfully"));
    } catch (error) {
        console.error("[SocietyAdmin] Creation failed:", {
            body: req.body,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
});

/**
 * GET /admin/societies
 */
export const listSocieties = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, category, q } = req.query;

    let filter = scopeQuery(req, {});

    if (status && status !== "all") filter.status = status;
    if (category) filter.category = category;
    if (q?.trim()) filter.$text = { $search: q.trim() };

    const result = await societyService.listSocieties(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Societies fetched successfully"));
});

/**
 * GET /admin/societies/:id
 */
export const getSocietyDetail = asyncHandler(async (req, res) => {
    const society = await societyService.getSocietyDetail(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, society, "Society details fetched successfully"));
});

/**
 * GET /admin/societies/pending
 */
export const listPendingSocieties = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const filter = scopeQuery(req, { status: "pending" });

    const result = await societyService.listPendingSocieties(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Pending societies fetched"));
});

/**
 * PATCH /admin/societies/:id/status
 */
export const updateSocietyStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;

    const VALID = ["approved", "rejected", "archived"];
    if (!status || !VALID.includes(status)) {
        throw new ApiError(400, `status must be one of: ${VALID.join(", ")}`);
    }

    await societyService.updateSocietyStatus(req.params.id, status, reason, req.user, req);

    return res.status(200).json(
        new ApiResponse(200, null, `Society ${status} successfully`)
    );
});

/**
 * DELETE /admin/societies/:id
 */
export const deleteSociety = asyncHandler(async (req, res) => {
    const result = await societyService.deleteSociety(req.params.id, req.user, req);
    return res.status(200).json(new ApiResponse(200, result, "Society deleted successfully"));
});

/**
 * PATCH /admin/societies/:id/head
 */
export const reassignSocietyHead = asyncHandler(async (req, res) => {
    const { newHeadUserId } = req.body;
    await societyService.reassignSocietyHead(req.params.id, newHeadUserId, req.user, req);
    return res.status(200).json(new ApiResponse(200, null, "Society head reassigned successfully"));
});

/**
 * POST /admin/societies/:id/members
 */
export const adminAddSocietyMember = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    await societyService.adminAddSocietyMember(req.params.id, userId, role, req.user, req);
    return res.status(201).json(new ApiResponse(201, null, "Member added successfully"));
});

/**
 * PATCH /admin/societies/:id/members/:userId
 */
export const adminUpdateSocietyMember = asyncHandler(async (req, res) => {
    const { role } = req.body;
    await societyService.adminUpdateSocietyMember(req.params.id, req.params.userId, role, req.user, req);
    return res.status(200).json(new ApiResponse(200, null, "Member role updated successfully"));
});

/**
 * DELETE /admin/societies/:id/members/:userId
 */
export const adminRemoveSocietyMember = asyncHandler(async (req, res) => {
    await societyService.adminRemoveSocietyMember(req.params.id, req.params.userId, req.user, req);
    return res.status(200).json(new ApiResponse(200, null, "Member removed successfully"));
});
