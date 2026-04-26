import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as moderationService from "../services/moderation.admin.service.js";

/**
 * GET /admin/reports
 */
export const listReports = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, targetModel } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (targetModel && targetModel !== "all") filter.targetModel = targetModel;

    const result = await moderationService.listReports(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Reports fetched successfully"));
});

/**
 * PATCH /admin/reports/:reportId
 */
export const resolveReport = asyncHandler(async (req, res) => {
    const { status, adminNotes } = req.body;
    const { reportId } = req.params;

    const result = await moderationService.resolveReport(reportId, status, adminNotes, req.user, req);
    return res.status(200).json(new ApiResponse(200, result, "Report updated successfully"));
});
