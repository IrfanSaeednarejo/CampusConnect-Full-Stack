import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { scopeQuery } from "../middlewares/adminAuth.middleware.js";
import * as studyGroupService from "../services/studyGroup.admin.service.js";

/**
 * POST /admin/study-groups
 */
export const createStudyGroup = asyncHandler(async (req, res) => {
    const group = await studyGroupService.createStudyGroup(req.body, req.user, req);
    return res.status(201).json(new ApiResponse(201, group, "Study group created successfully"));
});

/**
 * GET /admin/study-groups
 */
export const listStudyGroups = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, q } = req.query;

    let filter = scopeQuery(req, {});
    if (status && status !== "all") filter.status = status;
    if (q?.trim()) {
        const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { name: { $regex: esc, $options: "i" } },
            { subject: { $regex: esc, $options: "i" } },
            { course: { $regex: esc, $options: "i" } }
        ];
    }

    const result = await studyGroupService.listStudyGroups(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Study groups fetched successfully"));
});

/**
 * GET /admin/study-groups/:id
 */
export const getStudyGroupDetail = asyncHandler(async (req, res) => {
    const group = await studyGroupService.getStudyGroupDetail(req.params.id);
    return res.status(200).json(new ApiResponse(200, group, "Study group details fetched"));
});

/**
 * PATCH /admin/study-groups/:id/status
 */
export const updateStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const VALID = ["active", "archived"];
    if (!status || !VALID.includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    await studyGroupService.updateStatus(req.params.id, status, reason, req.user, req);
    return res.status(200).json(new ApiResponse(200, null, `Study group ${status} successfully`));
});

/**
 * DELETE /admin/study-groups/:id
 */
export const deleteStudyGroup = asyncHandler(async (req, res) => {
    await studyGroupService.deleteStudyGroup(req.params.id, req.user, req);
    return res.status(200).json(new ApiResponse(200, null, "Study group deleted successfully"));
});
