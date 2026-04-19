import mongoose from "mongoose";
import { Society } from "../models/society.model.js";
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
    await Society.findByIdAndUpdate(society._id, { $set: { status } });

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
