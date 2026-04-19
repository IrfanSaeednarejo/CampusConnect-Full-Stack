import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getEffectiveCampusId } from "../../middlewares/adminAuth.middleware.js";
import * as analyticsService from "../../services/analytics.admin.service.js";

/**
 * GET /admin/analytics/overview
 */
export const getOverview = asyncHandler(async (req, res) => {
    const campusId = getEffectiveCampusId(req);
    const data = await analyticsService.getOverview(campusId);
    return res.status(200).json(new ApiResponse(200, data, "Analytics overview fetched"));
});

/**
 * GET /admin/analytics/users/growth
 */
export const getUserGrowth = asyncHandler(async (req, res) => {
    const campusId = getEffectiveCampusId(req);
    const data = await analyticsService.getUserGrowth(campusId, req.query.period);
    return res.status(200).json(new ApiResponse(200, data, "User growth fetched"));
});

/**
 * GET /admin/analytics/mentors/engagement
 */
export const getMentorEngagement = asyncHandler(async (req, res) => {
    const campusId = getEffectiveCampusId(req);
    const data = await analyticsService.getMentorEngagement(campusId);
    return res.status(200).json(new ApiResponse(200, data, "Mentor engagement fetched"));
});

/**
 * GET /admin/analytics/events/participation
 */
export const getEventParticipation = asyncHandler(async (req, res) => {
    const campusId = getEffectiveCampusId(req);
    const data = await analyticsService.getEventParticipation(campusId);
    return res.status(200).json(new ApiResponse(200, data, "Event participation fetched"));
});

/**
 * GET /admin/analytics/societies/activity
 */
export const getSocietyActivity = asyncHandler(async (req, res) => {
    const campusId = getEffectiveCampusId(req);
    const data = await analyticsService.getSocietyActivity(campusId);
    return res.status(200).json(new ApiResponse(200, data, "Society activity fetched"));
});

/**
 * GET /admin/analytics/sessions
 */
export const getSessionsAnalytics = asyncHandler(async (req, res) => {
    const campusId = getEffectiveCampusId(req);
    const data = await analyticsService.getSessionsAnalytics(campusId, req.query.period);
    return res.status(200).json(new ApiResponse(200, data, "Sessions analytics fetched"));
});

/**
 * GET /admin/dashboard/stats
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    const campusId = getEffectiveCampusId(req);
    const data = await analyticsService.getDashboardStats(campusId);
    return res.status(200).json(new ApiResponse(200, data, "Dashboard stats fetched"));
});
