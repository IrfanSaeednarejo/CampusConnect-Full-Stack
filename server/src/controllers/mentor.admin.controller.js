import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { scopeQuery } from "../../middlewares/adminAuth.middleware.js";
import * as mentorService from "../../services/mentor.admin.service.js";

/**
 * GET /admin/mentors
 */
export const listMentors = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, verified, isActive, tier, q } = req.query;

    let filter = scopeQuery(req, {});

    if (verified !== undefined) filter.verified = verified === "true";
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (tier && ["bronze", "silver", "gold"].includes(tier)) filter.tier = tier;
    if (q?.trim()) filter.$text = { $search: q.trim() };

    const result = await mentorService.listMentors(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Mentors fetched successfully"));
});

/**
 * GET /admin/mentors/pending
 */
export const listPendingMentors = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const filter = scopeQuery(req, { verified: false, isActive: true });

    const result = await mentorService.listPendingMentors(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Pending mentor applications fetched"));
});

/**
 * PATCH /admin/mentors/:mentorId/verify
 */
export const verifyMentor = asyncHandler(async (req, res) => {
    const updated = await mentorService.verifyMentor(req.params.mentorId, req.user, req);
    return res.status(200).json(new ApiResponse(200, updated, "Mentor verified successfully"));
});

/**
 * PATCH /admin/mentors/:mentorId/reject
 */
export const rejectMentor = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    await mentorService.rejectMentor(req.params.mentorId, reason, req.user, req);
    return res.status(200).json(new ApiResponse(200, null, "Mentor application rejected"));
});

/**
 * PATCH /admin/mentors/:mentorId/suspend
 */
export const suspendMentor = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const updated = await mentorService.suspendMentor(req.params.mentorId, reason, req.user, req);
    return res.status(200).json(new ApiResponse(200, updated, "Mentor suspended successfully"));
});

/**
 * PATCH /admin/mentors/:mentorId/tier
 */
export const overrideMentorTier = asyncHandler(async (req, res) => {
    const { tier } = req.body;
    const updated = await mentorService.overrideMentorTier(req.params.mentorId, tier, req.user, req);
    return res.status(200).json(new ApiResponse(200, updated, `Mentor tier updated to "${tier}"`));
});

/**
 * GET /admin/mentors/:mentorId/sessions
 */
export const getMentorSessions = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const result = await mentorService.getMentorSessions(mentorId, status, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Mentor sessions fetched"));
});
