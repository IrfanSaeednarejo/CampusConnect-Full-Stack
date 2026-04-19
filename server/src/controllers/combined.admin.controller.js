import mongoose from "mongoose";
import { asyncHandler as ah } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ADMIN_ACTIONS } from "../models/adminAuditLog.model.js";
import * as combinedService from "../services/combined.admin.service.js";
import { scopeQuery } from "../middlewares/adminAuth.middleware.js";

// ─── StudyGroups ──────────────────────────────────────────────────────────────

export const listStudyGroups = ah(async (req, res) => {
    const { page = 1, limit = 20, status, subject, q } = req.query;
    
    let filter = scopeQuery(req, {});

    if (status && status !== "all") filter.status = status;
    if (subject) filter.subject = { $regex: subject.trim(), $options: "i" };
    if (q?.trim()) filter.$text = { $search: q.trim() };

    const result = await combinedService.listStudyGroups(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Study groups fetched"));
});

export const adminDeleteStudyGroup = ah(async (req, res) => {
    await combinedService.deleteStudyGroup(req.params.id, req.user, req);
    return res.status(200).json(new ApiResponse(200, null, "Study group deleted successfully"));
});

export const adminUpdateStudyGroupStatus = ah(async (req, res) => {
    const { status } = req.body;
    const group = await combinedService.updateStudyGroupStatus(req.params.id, status, req.user, req);
    return res.status(200).json(new ApiResponse(200, group, `Study group ${status}`));
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const broadcastNotification = ah(async (req, res) => {
    const { title, body, filter: audienceFilter = {} } = req.body;
    const result = await combinedService.broadcastNotification(title, body, audienceFilter, req.user, req);
    return res.status(200).json(new ApiResponse(200, result, result.recipientCount === 0 ? "No users matched the filter" : `Broadcast sent to ${result.recipientCount} users`));
});

export const targetedNotification = ah(async (req, res) => {
    const { userIds, title, body } = req.body;
    const result = await combinedService.targetedNotification(userIds, title, body, req.user, req);
    return res.status(200).json(new ApiResponse(200, result, "Targeted notifications sent"));
});

export const getNotificationLogs = ah(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const filter = scopeQuery(req, { action: { $in: [ADMIN_ACTIONS.NOTIFICATION_BROADCAST, ADMIN_ACTIONS.NOTIFICATION_TARGETED] } });

    const result = await combinedService.getNotificationLogs(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Notification logs fetched"));
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const listAuditLogs = ah(async (req, res) => {
    const { page = 1, limit = 20, action, adminId, targetModel, targetId, from, to } = req.query;
    let filter = scopeQuery(req, {});

    if (action) filter.action = action;
    if (adminId && mongoose.isValidObjectId(adminId)) filter.adminId = adminId;
    if (targetModel) filter.targetModel = targetModel;
    if (targetId && mongoose.isValidObjectId(targetId)) filter.targetId = targetId;

    if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) filter.createdAt.$lte = new Date(to);
    }

    const result = await combinedService.listAuditLogs(filter, { page, limit });
    return res.status(200).json(new ApiResponse(200, result, "Audit logs fetched"));
});

export const getAuditLogById = ah(async (req, res) => {
    const log = await combinedService.getAuditLogById(req.params.logId);
    return res.status(200).json(new ApiResponse(200, log, "Audit log fetched"));
});
