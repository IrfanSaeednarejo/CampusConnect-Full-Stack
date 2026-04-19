import mongoose from "mongoose";
import { StudyGroup } from "../models/studyGroup.model.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { AdminAuditLog, ADMIN_ACTIONS } from "../models/adminAuditLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { paginate } from "../utils/paginate.js";
import { writeAuditLog } from "../utils/auditLog.js";
import { systemEvents } from "../utils/events.js";
import { emitEvent } from "../utils/eventBus.js";

// ─── StudyGroup Logic ─────────────────────────────────────────────────────────

export const listStudyGroups = async (filter, options) => {
    return await paginate(StudyGroup, filter, {
        page: options.page,
        limit: options.limit,
        select: "-groupResources",
        sort: { createdAt: -1 },
        populate: [
            { path: "coordinatorId", select: "profile.displayName email" },
            { path: "campusId", select: "name code" },
        ],
    });
};

export const deleteStudyGroup = async (groupId, adminUser, req) => {
    if (!mongoose.isValidObjectId(groupId)) throw new ApiError(400, "Invalid study group ID");
    const group = await StudyGroup.findById(groupId).select("coordinatorId chatId memberCount status name campusId");
    if (!group) throw new ApiError(404, "Study group not found");

    await StudyGroup.findByIdAndUpdate(groupId, { $set: { status: "deleted" } });

    if (group.chatId) {
        Chat.findByIdAndUpdate(group.chatId, { $set: { isArchived: true } }).catch(console.error);
    }

    systemEvents.emit("notification:create", {
        userId: group.coordinatorId,
        type: "studygroup_update",
        title: "Study Group Removed",
        body: `Your study group "${group.name}" has been removed by an administrator.`,
        actorId: adminUser._id,
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.STUDYGROUP_DELETED,
        targetModel: "StudyGroup",
        targetId: group._id,
        payload: { name: group.name },
    });

    await emitEvent(ADMIN_ACTIONS.STUDYGROUP_DELETED + "@v1", {
        actorId: adminUser._id,
        targetId: group._id,
        payload: { name: group.name }
    });
};

export const updateStudyGroupStatus = async (groupId, status, adminUser, req) => {
    if (!["active", "archived"].includes(status)) throw new ApiError(400, 'status must be "active" or "archived"');
    if (!mongoose.isValidObjectId(groupId)) throw new ApiError(400, "Invalid study group ID");

    const group = await StudyGroup.findByIdAndUpdate(groupId, { $set: { status } }, { new: true }).select("_id name status");
    if (!group) throw new ApiError(404, "Study group not found");

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.STUDYGROUP_ARCHIVED,
        targetModel: "StudyGroup",
        targetId: group._id,
        payload: { status },
    });

    await emitEvent(ADMIN_ACTIONS.STUDYGROUP_ARCHIVED + "@v1", {
        actorId: adminUser._id,
        targetId: group._id,
        payload: { status }
    });

    return group;
};

// ─── Notification Logic ───────────────────────────────────────────────────────

export const broadcastNotification = async (title, body, audienceFilter, adminUser, req) => {
    if (!title?.trim()) throw new ApiError(400, "title is required");
    if (!body?.trim()) throw new ApiError(400, "body is required");

    const userFilter = { status: "active" };

    if (audienceFilter.campusId && mongoose.isValidObjectId(audienceFilter.campusId)) {
        userFilter.campusId = audienceFilter.campusId;
    } else if (adminUser.campusId && !adminUser.roles?.includes("super_admin")) {
        userFilter.campusId = adminUser.campusId;
    }

    if (audienceFilter.roles?.length > 0) {
        userFilter.roles = { $in: audienceFilter.roles };
    }

    const users = await User.find(userFilter).select("_id").lean();
    const userIds = users.map((u) => u._id);

    if (userIds.length === 0) return { recipientCount: 0 };

    const BATCH = 500;
    let inserted = 0;
    for (let i = 0; i < userIds.length; i += BATCH) {
        const batch = userIds.slice(i, i + BATCH);
        const docs = batch.map((userId) => ({
            userId,
            type: "system",
            title: title.trim(),
            body: body.trim(),
            actorId: adminUser._id,
            priority: audienceFilter.priority || "normal",
        }));
        await Notification.insertMany(docs, { ordered: false });
        inserted += batch.length;
        if (i + BATCH < userIds.length) await new Promise((r) => setTimeout(r, 100));
    }

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.NOTIFICATION_BROADCAST,
        payload: { title: title.trim(), body: body.trim(), recipientCount: inserted, filter: audienceFilter },
    });

    await emitEvent(ADMIN_ACTIONS.NOTIFICATION_BROADCAST + "@v1", {
        actorId: adminUser._id,
        payload: { title, recipientCount: inserted }
    });

    return { recipientCount: inserted };
};

export const targetedNotification = async (userIds, title, body, adminUser, req) => {
    if (!Array.isArray(userIds) || userIds.length === 0) throw new ApiError(400, "userIds is required");
    if (userIds.length > 500) throw new ApiError(400, "Maximum 500 targets per call");
    if (!title?.trim()) throw new ApiError(400, "title is required");
    if (!body?.trim()) throw new ApiError(400, "body is required");

    const validIds = userIds.filter((id) => mongoose.isValidObjectId(id));
    const docs = validIds.map((userId) => ({
        userId,
        type: "system",
        title: title.trim(),
        body: body.trim(),
        actorId: adminUser._id,
        priority: "normal",
    }));

    await Notification.insertMany(docs, { ordered: false });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.NOTIFICATION_TARGETED,
        payload: { title: title.trim(), body: body.trim(), recipientCount: validIds.length },
    });

    await emitEvent(ADMIN_ACTIONS.NOTIFICATION_TARGETED + "@v1", {
        actorId: adminUser._id,
        payload: { title, recipientCount: validIds.length }
    });

    return { recipientCount: validIds.length };
};

export const getNotificationLogs = async (filter, options) => {
    return await paginate(AdminAuditLog, filter, {
        page: options.page,
        limit: options.limit,
        sort: { createdAt: -1 },
        populate: [{ path: "adminId", select: "profile.displayName" }],
    });
};

// ─── AuditLog Logic ──────────────────────────────────────────────────────────

export const listAuditLogs = async (filter, options) => {
    return await paginate(AdminAuditLog, filter, {
        page: options.page,
        limit: options.limit,
        sort: { createdAt: -1 },
        populate: [{ path: "adminId", select: "profile.displayName roles" }],
    });
};

export const getAuditLogById = async (logId) => {
    if (!mongoose.isValidObjectId(logId)) throw new ApiError(400, "Invalid log ID");

    const log = await AdminAuditLog.findById(logId).populate("adminId", "profile.displayName roles");
    if (!log) throw new ApiError(404, "Audit log not found");

    return log;
};
