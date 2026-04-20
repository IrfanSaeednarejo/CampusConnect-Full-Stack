import mongoose from "mongoose";
import { Society } from "../models/society.model.js";
import { EntityRequest } from "../models/entityRequest.model.js";
import { Event } from "../models/event.model.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { paginate } from "../utils/paginate.js";
import { writeAuditLog } from "../utils/auditLog.js";
import { ADMIN_ACTIONS } from "../models/adminAuditLog.model.js";
import { systemEvents } from "../utils/events.js";
import { emitEvent } from "../utils/eventBus.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const findSocietyById = async (id) => {
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid society ID");
    const s = await Society.findById(id);
    if (!s) throw new ApiError(404, "Society not found");
    return s;
};

// ─── Service ──────────────────────────────────────────────────────────────────
export const adminCreateSociety = async (data, adminUser, req) => {
    const { name, tag, category, description, campusId, headUserId } = data;

    if (!name?.trim() || !tag?.trim() || !headUserId) {
        throw new ApiError(400, "Name, Tag, and Society Head are required");
    }

    // Check if society head exists and is active
    const head = await User.findById(headUserId);
    if (!head || head.status !== "active") {
        throw new ApiError(400, "Selected Society Head must be an active user");
    }

    const resolvedCampusId = campusId || adminUser.campusId || head.campusId;
    if (!resolvedCampusId) throw new ApiError(400, "Campus ID is required and could not be resolved from user profiles");

    const existing = await Society.findOne({
        $or: [{ tag: tag.toLowerCase().trim() }, { name: name.trim() }],
        campusId: resolvedCampusId,
    });

    if (existing) {
        throw new ApiError(409, `A society with this ${existing.tag === tag.toLowerCase().trim() ? "tag" : "name"} already exists on this campus`);
    }

    const society = await Society.create({
        name: name.trim(),
        tag: tag.toLowerCase().trim(),
        category: category || "other",
        description: description?.trim() || "",
        campusId: resolvedCampusId,
        createdBy: headUserId,
        status: "approved",
        approvedBy: adminUser._id,
        members: [{ memberId: headUserId, role: "executive", status: "approved", joinedAt: new Date() }],
        memberCount: 1,
    });

    // Ensure the head user has the society_head role
    await User.findByIdAndUpdate(headUserId, {
        $addToSet: { roles: "society_head" },
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.SOCIETY_CREATED,
        targetModel: "Society",
        targetId: society._id,
        payload: { name: society.name, headUserId },
    });

    await emitEvent(ADMIN_ACTIONS.SOCIETY_CREATED + "@v1", {
        actorId: adminUser._id,
        targetId: society._id,
        payload: { name: society.name, headUserId }
    });

    return society;
};

export const listSocieties = async (filter, options) => {
    return await paginate(Society, filter, {
        page: options.page,
        limit: options.limit,
        select: "-members -media.logoPublicId -media.coverImagePublicId",
        sort: { createdAt: -1 },
        populate: [
            { path: "createdBy", select: "profile.displayName email" },
            { path: "campusId", select: "name code" },
        ],
    });
};

export const getSocietyDetail = async (societyId) => {
    if (!mongoose.isValidObjectId(societyId)) throw new ApiError(400, "Invalid society ID format");

    const society = await Society.findById(societyId)
        .populate("createdBy", "profile.displayName profile.avatar profile.firstName profile.lastName email status")
        .populate("campusId", "name code")
        .populate({
            path: "members.memberId",
            select: "profile.displayName profile.avatar profile.firstName profile.lastName email status",
            options: { limit: 50 }, // Fetching top members
        }).lean();

    if (!society) throw new ApiError(404, "Society not found");

    // Fetch related events to show in admin logic
    const events = await Event.find({ societyId }).sort({ startDate: -1 }).limit(20).lean();
    society.events = events;
    society.eventsCount = events.length;

    return society;
};

export const listPendingSocieties = async (filter, options) => {
    return await paginate(Society, filter, {
        page: options.page,
        limit: options.limit,
        select: "-members",
        sort: { createdAt: -1 },
        populate: [
            { path: "createdBy", select: "profile.displayName email campusId" },
            { path: "campusId", select: "name code" },
        ],
    });
};

export const updateSocietyStatus = async (societyId, status, reason, adminUser, req) => {
    const society = await findSocietyById(societyId);

    if (society.status === status) {
        throw new ApiError(400, `Society is already "${status}"`);
    }

    const previousStatus = society.status;
    
    const updates = { status };
    if (status === "approved") {
        updates.approvedBy = adminUser._id;
        updates.rejectionReason = ""; // Clear any previous rejection reason
        
        // Unlock user role as society_head
        await User.findByIdAndUpdate(society.createdBy, {
            $addToSet: { roles: "society_head" }
        });
    } else if (status === "rejected") {
        updates.rejectionReason = reason?.trim() || "No reason provided";
    }

    await Society.findByIdAndUpdate(society._id, { $set: updates });

    // Sync with EntityRequest if it exists
    if (["approved", "rejected"].includes(status)) {
        await EntityRequest.findOneAndUpdate(
            { createdEntityId: society._id, type: "society" },
            { 
                $set: { 
                    status: status === "approved" ? "approved" : "rejected",
                    reviewedBy: adminUser._id,
                    rejectionReason: updates.rejectionReason || ""
                } 
            }
        ).catch(err => console.error("[SocietyAdmin] Failed to sync EntityRequest:", err.message));
    }

    // Action enum mapping
    const actionMap = {
        approved: ADMIN_ACTIONS.SOCIETY_APPROVED,
        rejected: ADMIN_ACTIONS.SOCIETY_REJECTED,
        archived: ADMIN_ACTIONS.SOCIETY_FROZEN,
    };

    const statusMessages = {
        approved: "Your society has been approved! You can now create events and manage members.",
        rejected: reason ? `Your society was not approved: ${reason}` : "Your society was not approved at this time.",
        archived: reason ? `Your society has been frozen: ${reason}` : "Your society has been temporarily frozen.",
    };

    systemEvents.emit("notification:create", {
        userId: society.createdBy,
        type: "society_update",
        title: `Society ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        body: statusMessages[status],
        ref: society._id,
        refModel: "Society",
        actorId: adminUser._id,
    });

    const action = actionMap[status];

    await writeAuditLog({
        req,
        action,
        targetModel: "Society",
        targetId: society._id,
        payload: {
            before: { status: previousStatus },
            after: { status },
            reason: reason?.trim() || "",
        },
    });

    await emitEvent(action + "@v1", {
        actorId: adminUser._id,
        targetId: society._id,
        payload: { status, reason: reason?.trim() || "" }
    });
};

export const deleteSociety = async (societyId, adminUser, req) => {
    const society = await findSocietyById(societyId);

    // Count linked entities before deletion for audit log
    const linkedEventCount = await Event.countDocuments({ societyId: society._id });

    // Cascade: cancel events
    await Event.updateMany(
        { societyId: society._id, status: { $in: ["draft", "published", "registration", "ongoing"] } },
        {
            $set: {
                status: "cancelled",
                cancelledAt: new Date(),
                cancelledBy: adminUser._id,
                cancellationReason: `Society deleted by admin`,
            },
        }
    );

    // Cascade: archive chats
    await Chat.updateMany(
        { contextId: society._id },
        { $set: { isArchived: true } }
    );

    systemEvents.emit("notification:create", {
        userId: society.createdBy,
        type: "society_update",
        title: "Society Deleted",
        body: "Your society has been removed by an administrator.",
        actorId: adminUser._id,
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.SOCIETY_DELETED,
        targetModel: "Society",
        targetId: society._id,
        payload: {
            name: society.name,
            tag: society.tag,
            campusId: society.campusId,
            linkedEventsCancelled: linkedEventCount,
        },
    });

    await emitEvent(ADMIN_ACTIONS.SOCIETY_DELETED + "@v1", {
        actorId: adminUser._id,
        targetId: society._id,
        payload: { name: society.name, linkedEventsCancelled: linkedEventCount }
    });

    await Society.findByIdAndDelete(society._id);

    return { deletedSocietyId: society._id, linkedEventsCancelled: linkedEventCount };
};

export const reassignSocietyHead = async (societyId, newHeadUserId, adminUser, req) => {
    if (!newHeadUserId || !mongoose.isValidObjectId(newHeadUserId)) {
        throw new ApiError(400, "Valid newHeadUserId is required");
    }

    const society = await findSocietyById(societyId);
    const newHead = await User.findById(newHeadUserId).select("_id status campusId profile.displayName");
    
    if (!newHead) throw new ApiError(404, "New head user not found");
    if (newHead.status !== "active") throw new ApiError(400, "New head must be an active user");

    const previousHeadId = society.createdBy;

    await Society.findByIdAndUpdate(society._id, {
        $set: { createdBy: newHeadUserId },
    });

    systemEvents.emit("notification:create", {
        userId: newHeadUserId,
        type: "society_update",
        title: "Society Head Role Assigned",
        body: `You have been assigned as the head of "${society.name}".`,
        ref: society._id,
        refModel: "Society",
        actorId: adminUser._id,
    });

    // Optional: Notify the previous head if needed
    // systemEvents.emit("notification:create", { ... })

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.SOCIETY_HEAD_REASSIGNED,
        targetModel: "Society",
        targetId: society._id,
        payload: {
            previousHeadId: previousHeadId.toString(),
            newHeadId: newHeadUserId,
        },
    });

    await emitEvent(ADMIN_ACTIONS.SOCIETY_HEAD_REASSIGNED + "@v1", {
        actorId: adminUser._id,
        targetId: society._id,
        payload: { previousHead: previousHeadId, newHead: newHeadUserId }
    });
};

export const adminAddSocietyMember = async (societyId, userId, role, adminUser, req) => {
    const society = await findSocietyById(societyId);
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid User ID");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const existingMember = society.members.find(m => m.memberId.toString() === userId);
    if (existingMember) throw new ApiError(400, "User is already a member of this society");

    await Society.findByIdAndUpdate(societyId, {
        $push: { members: { memberId: userId, role: role || "student", status: "approved", joinedAt: new Date() } },
        $inc: { memberCount: 1 }
    });

    if (role === "executive") {
        await User.findByIdAndUpdate(userId, { $addToSet: { roles: "society_head" } });
    }

    await writeAuditLog({ req, action: "MEMBER_ADDED", targetModel: "Society", targetId: societyId, payload: { userId, role } });
};

export const adminUpdateSocietyMember = async (societyId, userId, role, adminUser, req) => {
    const society = await findSocietyById(societyId);
    
    const memberIndex = society.members.findIndex(m => m.memberId.toString() === userId);
    if (memberIndex === -1) throw new ApiError(404, "Member not found in society");

    const oldRole = society.members[memberIndex].role;
    society.members[memberIndex].role = role;
    
    await society.save();

    if (role === "executive") {
        await User.findByIdAndUpdate(userId, { $addToSet: { roles: "society_head" } });
    } else if (oldRole === "executive") {
        // If demoted from executive, check if they are executive in any other society before removing the global role
        const otherSocieties = await Society.find({ _id: { $ne: societyId }, "members": { $elemMatch: { memberId: userId, role: "executive" } } });
        if (otherSocieties.length === 0) {
            await User.findByIdAndUpdate(userId, { $pull: { roles: "society_head" } });
        }
    }

    await writeAuditLog({ req, action: "MEMBER_ROLE_UPDATED", targetModel: "Society", targetId: societyId, payload: { userId, oldRole, newRole: role } });
};

export const adminRemoveSocietyMember = async (societyId, userId, adminUser, req) => {
    const society = await findSocietyById(societyId);
    
    const member = society.members.find(m => m.memberId.toString() === userId);
    if (!member) throw new ApiError(404, "Member not found in society");

    await Society.findByIdAndUpdate(societyId, {
        $pull: { members: { memberId: userId } },
        $inc: { memberCount: -1 }
    });

    if (member.role === "executive") {
        const otherSocieties = await Society.find({ _id: { $ne: societyId }, "members": { $elemMatch: { memberId: userId, role: "executive" } } });
        if (otherSocieties.length === 0) {
            await User.findByIdAndUpdate(userId, { $pull: { roles: "society_head" } });
        }
    }

    if (society.createdBy.toString() === userId) {
        // if original head is removed, assign creator to generic admin so the system doesn't break
        await Society.findByIdAndUpdate(societyId, { $set: { createdBy: adminUser._id } });
    }

    await writeAuditLog({ req, action: "MEMBER_REMOVED", targetModel: "Society", targetId: societyId, payload: { userId } });
};
