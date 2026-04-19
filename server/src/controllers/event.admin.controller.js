import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { scopeQuery } from "../../middlewares/adminAuth.middleware.js";
import * as eventService from "../../services/event.admin.service.js";

/**
 * GET /admin/events
 */
export const listEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, societyId, upcoming, q } = req.query;

    let filter = scopeQuery(req, {});

    if (status && status !== "all") filter.status = status;
    if (societyId && mongoose.isValidObjectId(societyId)) filter.societyId = societyId;
    if (upcoming === "true") filter.startAt = { $gte: new Date() };
    if (q?.trim()) filter.$text = { $search: q.trim() };

    const result = await eventService.listEvents(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Events fetched successfully"));
});

/**
 * PATCH /admin/events/:eventId/cancel
 */
export const forceCancelEvent = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const { eventId } = req.params;

    const { notifiedCount } = await eventService.forceCancelEvent(eventId, reason, req.user, req);

    return res.status(200).json(
        new ApiResponse(200, null, `Event cancelled. ${notifiedCount} participant(s) notified.`)
    );
});

/**
 * PATCH /admin/events/:eventId/status
 */
export const forceEventStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { eventId } = req.params;

    await eventService.forceEventStatus(eventId, status, req.user, req);
    return res.status(200).json(new ApiResponse(200, null, `Event status forced to "${status}"`));
});

/**
 * GET /admin/events/:eventId/registrations
 */
export const getEventRegistrations = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { page = 1, limit = 50, status = "registered" } = req.query;

    const result = await eventService.getEventRegistrations(eventId, status, page, limit);
    return res.status(200).json(new ApiResponse(200, result, "Registrations fetched"));
});
