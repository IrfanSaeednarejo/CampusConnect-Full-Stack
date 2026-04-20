import mongoose from "mongoose";
import { StudyGroup } from "../models/studyGroup.model.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { paginate } from "../utils/paginate.js";
import { writeAuditLog } from "../utils/auditLog.js";
import { ADMIN_ACTIONS } from "../models/adminAuditLog.model.js";
import { emitEvent } from "../utils/eventBus.js";
import { systemEvents } from "../utils/events.js";
import { EntityRequest } from "../models/entityRequest.model.js";

/**
 * Admin: Create a new Study Group
 */
export const createStudyGroup = async (data, adminUser, req) => {
    const { name, description, subject, course, campusId, coordinatorId, maxMembers } = data;

    if (!name?.trim() || !coordinatorId || !subject?.trim()) {
        throw new ApiError(400, "Name, Coordinator, and Subject are required");
    }

    // 1. Verify Coordinator
    const coordinator = await User.findById(coordinatorId);
    if (!coordinator || coordinator.status !== "active") {
        throw new ApiError(400, "Selected Group Leader must be an active user");
    }

    const resolvedCampusId = campusId || adminUser.campusId || coordinator.campusId;
    if (!resolvedCampusId) {
        throw new ApiError(400, "Campus ID is required");
    }

    // 2. Check for duplicates on same campus
    const existing = await StudyGroup.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") }, 
        campusId: resolvedCampusId 
    });
    if (existing) {
        throw new ApiError(409, "A study group with this name already exists on this campus");
    }

    // 3. Create Group
    const studyGroup = await StudyGroup.create({
        name: name.trim(),
        description: description?.trim() || "",
        subject: subject.trim(),
        course: course?.trim() || "",
        campusId: resolvedCampusId,
        coordinatorId,
        maxMembers: maxMembers || 20,
        status: "active",
        groupMembers: [{ memberId: coordinatorId, role: "coordinator", joinedAt: new Date() }],
        memberCount: 1,
    });

    // 4. Register Audit Log
    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.STUDYGROUP_CREATED,
        targetModel: "StudyGroup",
        targetId: studyGroup._id,
        payload: { name: studyGroup.name, coordinatorId },
    });

    await emitEvent(ADMIN_ACTIONS.STUDYGROUP_CREATED + "@v1", {
        actorId: adminUser._id,
        targetId: studyGroup._id,
        payload: { name: studyGroup.name }
    });

    return studyGroup;
};

/**
 * List Study Groups with pagination and filters
 */
export const listStudyGroups = async (filter, options) => {
    return await paginate(StudyGroup, filter, {
        page: options.page,
        limit: options.limit,
        sort: { createdAt: -1 },
        populate: [
            { path: "coordinatorId", select: "profile.displayName email" },
            { path: "campusId", select: "name code" }
        ],
    });
};

/**
 * Get Study Group Detail
 */
export const getStudyGroupDetail = async (id) => {
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid ID");
    
    const group = await StudyGroup.findById(id)
        .populate("coordinatorId", "profile.displayName profile.avatar email status")
        .populate("campusId", "name code")
        .populate("groupMembers.memberId", "profile.displayName profile.avatar email status")
        .lean();

    if (!group) throw new ApiError(404, "Study group not found");
    return group;
};

/**
 * Update Status
 */
export const updateStatus = async (id, status, reason, adminUser, req) => {
    if (!["active", "archived", "rejected"].includes(status)) {
        throw new ApiError(400, 'Status must be "active", "archived", or "rejected"');
    }

    const group = await StudyGroup.findById(id);
    if (!group) throw new ApiError(404, "Group not found");

    const previousStatus = group.status;
    group.status = status;
    if ((status === "archived" || status === "rejected") && reason) {
        group.rejectionReason = reason;
    }
    
    if (status === "active") {
        group.approvedBy = adminUser._id;
        group.rejectionReason = "";
    }

    await group.save();

    // 1. Sync with EntityRequest if it exists
    if (["active", "rejected"].includes(status)) {
        await EntityRequest.findOneAndUpdate(
            { createdEntityId: group._id, type: "study_group" },
            { 
                $set: { 
                    status: status === "active" ? "approved" : "rejected",
                    reviewedBy: adminUser._id,
                    rejectionReason: reason || ""
                } 
            }
        ).catch(err => console.error("[StudyGroupAdmin] Failed to sync EntityRequest:", err.message));
    }

    // 2. Notify Coordinator
    const statusMessages = {
        active: "Your study group has been activated!",
        rejected: reason ? `Your study group was not approved: ${reason}` : "Your study group was not approved.",
        archived: reason ? `Your study group has been archived: ${reason}` : "Your study group has been archived.",
    };

    systemEvents.emit("notification:create", {
        userId: group.coordinatorId,
        type: "studygroup_update",
        title: `Study Group ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        body: statusMessages[status],
        ref: group._id,
        refModel: "StudyGroup",
        actorId: adminUser._id,
    });

    await writeAuditLog({
        req,
        action: status === "active" ? "STUDYGROUP_MODERATED" : (status === "archived" ? ADMIN_ACTIONS.STUDYGROUP_ARCHIVED : ADMIN_ACTIONS.STUDYGROUP_DELETED),
        targetModel: "StudyGroup",
        targetId: group._id,
        payload: { before: previousStatus, after: status, reason }
    });
};

/**
 * Delete Study Group
 */
export const deleteStudyGroup = async (id, adminUser, req) => {
    const group = await StudyGroup.findById(id);
    if (!group) throw new ApiError(404, "Study group not found");

    // Clear linked chat if exists
    if (group.chatId) {
        await Chat.findByIdAndUpdate(group.chatId, { $set: { isArchived: true } });
    }

    // Notify Coordinator
    systemEvents.emit("notification:create", {
        userId: group.coordinatorId,
        type: "studygroup_update",
        title: "Study Group Removed",
        body: `Your study group "${group.name}" was removed from the system by an administrator.`,
        actorId: adminUser._id,
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.STUDYGROUP_DELETED,
        targetModel: "StudyGroup",
        targetId: group._id,
        payload: { name: group.name }
    });

    await StudyGroup.findByIdAndDelete(id);
};
