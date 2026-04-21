import mongoose from "mongoose";
import { Event } from "../models/event.model.js";
import { Society } from "../models/society.model.js";
import { ApiError } from "../utils/ApiError.js";
import { paginate } from "../utils/paginate.js";
import { writeAuditLog } from "../utils/auditLog.js";
import { ADMIN_ACTIONS } from "../models/adminAuditLog.model.js";
import { systemEvents } from "../utils/events.js";
import { emitEvent } from "../utils/eventBus.js";

// ─── Service ──────────────────────────────────────────────────────────────────

export const listEvents = async (filter, options) => {
    return await paginate(Event, filter, {
        page: options.page,
        limit: options.limit,
        select: "-registrations -feedback -coverImagePublicId -announcements",
        sort: { startAt: -1 },
        populate: [
            { path: "societyId", select: "name tag" },
            { path: "campusId", select: "name code" },
            { path: "createdBy", select: "profile.displayName email" },
        ],
    });
};

export const forceCancelEvent = async (eventId, reason, adminUser, req) => {
    if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event ID");

    const event = await Event.findById(eventId).select("status title registrations createdBy campusId");
    if (!event) throw new ApiError(404, "Event not found");

    if (["cancelled", "completed"].includes(event.status)) {
        throw new ApiError(400, `Event is already "${event.status}"`);
    }

    await Event.findByIdAndUpdate(eventId, {
        $set: {
            status: "cancelled",
            cancelledAt: new Date(),
            cancelledBy: adminUser._id,
            cancellationReason: reason?.trim() || "Cancelled by administrator",
        },
    });

    const registrantIds = event.registrations
        .filter((r) => ["registered", "waitlisted"].includes(r.status))
        .map((r) => r.userId);

    for (const userId of registrantIds) {
        systemEvents.emit("notification:create", {
            userId,
            type: "event_update",
            title: `Event Cancelled: ${event.title}`,
            body: reason || "This event has been cancelled by an administrator.",
            ref: event._id,
            refModel: "Event",
            actorId: adminUser._id,
            priority: "high",
        });
    }

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.EVENT_CANCELLED,
        targetModel: "Event",
        targetId: event._id,
        payload: {
            title: event.title,
            reason: reason?.trim() || "",
            notifiedCount: registrantIds.length,
        },
    });

    await emitEvent(ADMIN_ACTIONS.EVENT_CANCELLED + "@v1", {
        actorId: adminUser._id,
        targetId: event._id,
        payload: { title: event.title, reason, notifiedCount: registrantIds.length }
    });

    return { notifiedCount: registrantIds.length };
};

export const forceEventStatus = async (eventId, status, adminUser, req) => {
    const VALID = ["draft", "published", "cancelled", "completed", "registration", "ongoing", "submission_locked", "judging"];
    if (!status || !VALID.includes(status)) {
        throw new ApiError(400, `status must be one of: ${VALID.join(", ")}`);
    }

    if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event ID");

    const event = await Event.findById(eventId).select("status title");
    if (!event) throw new ApiError(404, "Event not found");

    const previousStatus = event.status;
    await Event.findByIdAndUpdate(eventId, { $set: { status } });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.EVENT_STATUS_CHANGED,
        targetModel: "Event",
        targetId: event._id,
        payload: { before: { status: previousStatus }, after: { status } },
    });

    await emitEvent(ADMIN_ACTIONS.EVENT_STATUS_CHANGED + "@v1", {
        actorId: adminUser._id,
        targetId: event._id,
        payload: { before: previousStatus, after: status }
    });
};

export const getEventRegistrations = async (eventId, status, page, limit) => {
    if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event ID");

    const event = await Event.findById(eventId).select("title registrations");
    if (!event) throw new ApiError(404, "Event not found");

    const VALID = ["registered", "waitlisted", "cancelled", "attended"];
    const filtered = event.registrations.filter(
        (r) => !status || status === "all" || r.status === (VALID.includes(status) ? status : "registered")
    );

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const slice = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    await Event.populate(slice, {
        path: "userId",
        select: "profile.displayName profile.avatar profile.firstName profile.lastName email academic.department",
        model: "User",
    });

    return {
        registrations: slice,
        pagination: {
            total: filtered.length,
            page: pageNum,
            pages: Math.ceil(filtered.length / limitNum) || 1,
            limit: limitNum,
        },
    };
};

// ─── Admin Approval Queue ─────────────────────────────────────────────────────────────────────

export const listPendingEvents = async (filter, options) => {
    return await paginate(Event, { ...filter, approvalStatus: "pending_admin_review" }, {
        page: options.page,
        limit: options.limit,
        select: "-registrations -feedback -coverImagePublicId -announcements",
        sort: { createdAt: -1 },
        populate: [
            { path: "societyId", select: "name tag media.logo" },
            { path: "campusId", select: "name code" },
            { path: "createdBy", select: "profile.displayName profile.avatar email" },
        ],
    });
};

export const approveEvent = async (eventId, adminUser, req) => {
    if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event ID");

    const event = await Event.findById(eventId).populate("societyId", "name members").populate("createdBy", "profile.displayName");
    if (!event) throw new ApiError(404, "Event not found");
    if (event.approvalStatus !== "pending_admin_review") {
        throw new ApiError(400, `Event is already "${event.approvalStatus}"`);
    }

    const nextStatus = event.isOnlineCompetition ? "registration" : "published";
    
    await Event.findByIdAndUpdate(eventId, {
        $set: {
            approvalStatus: "approved",
            approvedBy: adminUser._id,
            approvedAt: new Date(),
            rejectionReason: "",
            ...(event.status === "draft" ? { status: nextStatus } : {})
        },
    });

    // Notify the event creator
    systemEvents.emit("notification:create", {
        userId: event.createdBy._id,
        type: "event_update",
        title: `✅ Event Approved: ${event.title}`,
        body: `Your event has been approved by the admin. You can now transition it to registration.`,
        ref: event._id,
        refModel: "Event",
        actorId: adminUser._id,
        priority: "high",
    });

    // Notify ALL society members
    const society = await Society.findById(event.societyId._id).select("members name");
    if (society?.members?.length) {
        const memberIds = society.members
            .filter((m) => m.status === "approved" && m.userId.toString() !== event.createdBy._id.toString())
            .map((m) => m.userId);

        for (const userId of memberIds) {
            systemEvents.emit("notification:create", {
                userId,
                type: "event_update",
                title: `🎉 New Event: ${event.title}`,
                body: `${society.name} has a new event! Tap to view details and register.`,
                ref: event._id,
                refModel: "Event",
                actorId: adminUser._id,
                priority: "normal",
            });
        }
    }

    await writeAuditLog({
        req,
        action: "EVENT_APPROVED",
        targetModel: "Event",
        targetId: event._id,
        payload: { title: event.title, societyId: event.societyId._id },
    });

    return event;
};

export const rejectEvent = async (eventId, reason, adminUser, req) => {
    if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event ID");
    if (!reason?.trim()) throw new ApiError(400, "A rejection reason is required");

    const event = await Event.findById(eventId).populate("createdBy", "_id profile.displayName").populate("societyId", "name");
    if (!event) throw new ApiError(404, "Event not found");
    if (event.approvalStatus !== "pending_admin_review") {
        throw new ApiError(400, `Event is already "${event.approvalStatus}"`);
    }

    await Event.findByIdAndUpdate(eventId, {
        $set: {
            approvalStatus: "rejected",
            rejectionReason: reason.trim(),
        },
    });

    // Notify only the event creator with the reason
    systemEvents.emit("notification:create", {
        userId: event.createdBy._id,
        type: "event_update",
        title: `❌ Event Not Approved: ${event.title}`,
        body: `Reason: ${reason.trim()}`,
        ref: event._id,
        refModel: "Event",
        actorId: adminUser._id,
        priority: "high",
    });

    await writeAuditLog({
        req,
        action: "EVENT_REJECTED",
        targetModel: "Event",
        targetId: event._id,
        payload: { title: event.title, reason: reason.trim() },
    });

    return event;
};
