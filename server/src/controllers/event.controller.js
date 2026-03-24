import fs from "fs";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import { Society } from "../models/society.model.js";
import { paginate } from "../utils/paginate.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

const uploadFile = async (localPath) => {
    if (!localPath) return null;
    try {
        return await uploadOnCloudinary(localPath);
    } finally {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
};

const findEventById = async (eventId, select = "") => {
    if (!mongoose.isValidObjectId(eventId)) {
        throw new ApiError(400, "Invalid event ID format");
    }
    const event = await Event.findById(eventId).select(select || undefined);
    if (!event) throw new ApiError(404, "Event not found");
    return event;
};

const requireEventOwnerOrAdmin = (event, user) => {
    const isAdmin = user.roles?.includes("admin");
    const isOwner = event.createdBy.toString() === user._id.toString();
    if (!isAdmin && !isOwner) {
        throw new ApiError(403, "You do not have permission to manage this event");
    }
};

const requireSocietyMembership = async (societyId, userId, userRoles = []) => {
    if (userRoles.includes("admin")) return;
    const society = await Society.findById(societyId).select("members createdBy");
    if (!society) throw new ApiError(404, "Society not found");

    const isMember = society.members.some(
        (m) => m.memberId.toString() === userId.toString() && m.status === "approved"
    );
    const isHead = society.createdBy.toString() === userId.toString();

    if (!isMember && !isHead) {
        throw new ApiError(403, "Only society members can manage events for this society");
    }
};

/**
 * GET /api/v1/events
 */
const getEvents = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        campusId,
        societyId,
        category,
        status,
        startFrom,
        startTo,
        tag,
        venue,
        q,
    } = req.query;

    const filter = {};
    const isAdmin = req.user?.roles?.includes("admin");

    if (!isAdmin) {
        filter.status = "published";
    } else if (status && status !== "all") {
        filter.status = status;
    }

    if (campusId) {
        if (!mongoose.isValidObjectId(campusId)) throw new ApiError(400, "Invalid campusId");
        filter.campusId = new mongoose.Types.ObjectId(campusId);
    }

    if (societyId) {
        if (!mongoose.isValidObjectId(societyId)) throw new ApiError(400, "Invalid societyId");
        filter.societyId = new mongoose.Types.ObjectId(societyId);
    }

    if (category) filter.category = category;
    if (venue) filter["venue.type"] = venue;
    if (tag) filter.tags = tag.trim().toLowerCase();

    if (startFrom || startTo) {
        filter.startAt = {};
        if (startFrom) filter.startAt.$gte = new Date(startFrom);
        if (startTo) filter.startAt.$lte = new Date(startTo);
    }

    if (q?.trim()) {
        filter.$text = { $search: q.trim() };
    }

    const result = await paginate(Event, filter, {
        page,
        limit,
        select: "-registrations -feedback -coverImagePublicId",
        sort: q?.trim() ? { score: { $meta: "textScore" } } : { startAt: 1 },
        populate: [
            { path: "createdBy", select: "profile.displayName profile.avatar" },
            { path: "societyId", select: "name tag" },
        ],
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Events fetched successfully"));
});

/**
 * GET /api/v1/events/upcoming
 */
const getUpcomingEvents = asyncHandler(async (req, res) => {
    const { campusId, limit = 10 } = req.query;

    if (!campusId) throw new ApiError(400, "campusId is required");
    if (!mongoose.isValidObjectId(campusId)) throw new ApiError(400, "Invalid campusId");

    const events = await Event.findUpcoming(
        new mongoose.Types.ObjectId(campusId),
        Math.min(50, parseInt(limit, 10))
    )
        .populate("createdBy", "profile.displayName profile.avatar")
        .populate("societyId", "name tag");

    return res
        .status(200)
        .json(new ApiResponse(200, events, "Upcoming events fetched successfully"));
});

/**
 * GET /api/v1/events/:eventId
 */
const getEventById = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
        throw new ApiError(400, "Invalid event ID format");
    }

    const event = await Event.findById(eventId)
        .select("-coverImagePublicId")
        .populate("createdBy", "profile.displayName profile.avatar profile.firstName profile.lastName")
        .populate("societyId", "name tag description media.logo");

    if (!event) throw new ApiError(404, "Event not found");

    const isAdmin = req.user?.roles?.includes("admin");
    const isOwner = event.createdBy._id?.toString() === req.user?._id?.toString();

    if (event.status !== "published" && !isAdmin && !isOwner) {
        throw new ApiError(404, "Event not found");
    }

    let myRegistration = null;
    if (req.user) {
        const reg = event.registrations.find(
            (r) => r.userId.toString() === req.user._id.toString()
        );
        if (reg) {
            myRegistration = { status: reg.status, registeredAt: reg.registeredAt };
        }
    }

    const eventObj = event.toObject({ virtuals: true });
    delete eventObj.registrations;

    return res.status(200).json(
        new ApiResponse(200, { ...eventObj, myRegistration }, "Event fetched successfully")
    );
});

/**
 * GET /api/v1/events/:eventId/attendees
 */
const getEventAttendees = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { page = 1, limit = 20, status = "registered" } = req.query;

    const event = await findEventById(eventId, "createdBy societyId registrations status");
    requireEventOwnerOrAdmin(event, req.user);

    const VALID_STATUSES = ["registered", "waitlisted", "cancelled", "attended"];
    const statusFilter = VALID_STATUSES.includes(status) ? status : "registered";

    const filtered = event.registrations.filter((r) => r.status === statusFilter);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const start = (pageNum - 1) * limitNum;
    const slice = filtered.slice(start, start + limitNum);
    await Event.populate(slice, {
        path: "userId",
        select: "profile.displayName profile.avatar profile.firstName profile.lastName academic.department",
        model: "User",
    });

    return res.status(200).json(
        new ApiResponse(200, {
            attendees: slice,
            pagination: {
                total: filtered.length,
                page: pageNum,
                pages: Math.ceil(filtered.length / limitNum) || 1,
                limit: limitNum,
            },
        }, `Attendees (${statusFilter}) fetched successfully`)
    );
});

/**
 * GET /api/v1/events/my/registered
 */
const getMyRegisteredEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status = "registered" } = req.query;

    const VALID = ["registered", "waitlisted", "cancelled", "attended"];
    const regStatus = VALID.includes(status) ? status : "registered";

    const result = await paginate(
        Event,
        {
            "registrations.userId": req.user._id,
            "registrations.status": regStatus,
        },
        {
            page,
            limit,
            select: "-registrations -feedback -coverImagePublicId",
            sort: { startAt: 1 },
            populate: [
                { path: "societyId", select: "name tag" },
            ],
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Registered events fetched successfully"));
});

/**
 * GET /api/v1/events/my/created
 */
const getMyCreatedEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { createdBy: req.user._id };
    if (status && status !== "all") filter.status = status;

    const result = await paginate(Event, filter, {
        page,
        limit,
        select: "-registrations -feedback -coverImagePublicId",
        sort: { createdAt: -1 },
        populate: [{ path: "societyId", select: "name tag" }],
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Your events fetched successfully"));
});

/**
 * POST /api/v1/events
 */
const createEvent = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        societyId,
        campusId,
        category,
        tags,
        venue,
        startAt,
        endAt,
        maxCapacity,
        waitlistEnabled,
        requireApproval,
        fee,
    } = req.body;

    if (!title?.trim()) throw new ApiError(400, "Event title is required");
    if (!description?.trim()) throw new ApiError(400, "Event description is required");
    if (!societyId) throw new ApiError(400, "societyId is required");
    if (!startAt) throw new ApiError(400, "startAt is required");
    if (!endAt) throw new ApiError(400, "endAt is required");
    if (!venue?.type) throw new ApiError(400, "venue.type is required");

    if (!mongoose.isValidObjectId(societyId)) {
        throw new ApiError(400, "Invalid societyId format");
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (isNaN(start.getTime())) throw new ApiError(400, "Invalid startAt date");
    if (isNaN(end.getTime())) throw new ApiError(400, "Invalid endAt date");
    if (end <= start) throw new ApiError(400, "endAt must be after startAt");
    if (start <= new Date()) throw new ApiError(400, "startAt must be in the future");

    const resolvedCampusId = campusId || req.user.campusId;
    if (!resolvedCampusId) {
        throw new ApiError(400, "campusId is required — set it in your profile or pass it in the request");
    }

    await requireSocietyMembership(societyId, req.user._id, req.user.roles);

    const coverLocalPath = req.file?.path;
    const cover = coverLocalPath ? await uploadFile(coverLocalPath) : null;

    let parsedFee = { amount: 0, currency: "PKR" };
    if (fee) {
        const f = typeof fee === "string" ? JSON.parse(fee) : fee;
        parsedFee = { amount: f.amount ?? 0, currency: f.currency ?? "PKR" };
    }

    const parsedVenue = typeof venue === "string" ? JSON.parse(venue) : venue;

    const parsedTags = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
            ? JSON.parse(tags)
            : [];

    const event = await Event.create({
        title: title.trim(),
        description: description.trim(),
        societyId,
        campusId: resolvedCampusId,
        createdBy: req.user._id,
        category: category || "other",
        tags: parsedTags,
        venue: parsedVenue,
        startAt: start,
        endAt: end,
        maxCapacity: parseInt(maxCapacity, 10) || 0,
        waitlistEnabled: waitlistEnabled === "true" || waitlistEnabled === true,
        requireApproval: requireApproval === "true" || requireApproval === true,
        fee: parsedFee,
        coverImage: cover?.secure_url || "",
        coverImagePublicId: cover?.public_id || "",
        status: "draft",
    });

    const created = await Event.findById(event._id)
        .select("-coverImagePublicId")
        .populate("createdBy", "profile.displayName profile.avatar")
        .populate("societyId", "name tag");

    return res
        .status(201)
        .json(new ApiResponse(201, created, "Event created successfully"));
});

/**
 * PATCH /api/v1/events/:eventId
 */
const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await findEventById(eventId, "createdBy status coverImagePublicId");
    requireEventOwnerOrAdmin(event, req.user);

    if (["cancelled", "completed"].includes(event.status)) {
        throw new ApiError(400, `Cannot update a ${event.status} event`);
    }

    const {
        title,
        description,
        category,
        tags,
        venue,
        startAt,
        endAt,
        maxCapacity,
        waitlistEnabled,
        requireApproval,
        fee,
    } = req.body;

    const updates = {};

    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (category) updates.category = category;
    if (tags !== undefined) {
        updates.tags = Array.isArray(tags)
            ? tags
            : typeof tags === "string"
                ? JSON.parse(tags)
                : [];
    }
    if (venue) {
        updates.venue = typeof venue === "string" ? JSON.parse(venue) : venue;
    }
    if (startAt) {
        const s = new Date(startAt);
        if (isNaN(s.getTime())) throw new ApiError(400, "Invalid startAt date");
        updates.startAt = s;
    }
    if (endAt) {
        const e = new Date(endAt);
        if (isNaN(e.getTime())) throw new ApiError(400, "Invalid endAt date");
        updates.endAt = e;
    }
    const finalStart = updates.startAt || event.startAt;
    const finalEnd = updates.endAt || event.endAt;
    if (finalEnd <= finalStart) {
        throw new ApiError(400, "endAt must be after startAt");
    }

    if (maxCapacity !== undefined) updates.maxCapacity = parseInt(maxCapacity, 10) || 0;
    if (waitlistEnabled !== undefined) {
        updates.waitlistEnabled = waitlistEnabled === "true" || waitlistEnabled === true;
    }
    if (requireApproval !== undefined) {
        updates.requireApproval = requireApproval === "true" || requireApproval === true;
    }
    if (fee !== undefined) {
        const f = typeof fee === "string" ? JSON.parse(fee) : fee;
        updates.fee = { amount: f.amount ?? 0, currency: f.currency ?? "PKR" };
    }

    const coverLocalPath = req.file?.path;
    if (coverLocalPath) {
        const cover = await uploadFile(coverLocalPath);
        if (cover?.secure_url) {
            if (event.coverImagePublicId) {
                deleteFromCloudinary(event.coverImagePublicId).catch((err) =>
                    console.error("[Cloudinary] Failed to delete old event cover:", err)
                );
            }
            updates.coverImage = cover.secure_url;
            updates.coverImagePublicId = cover.public_id;
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided — nothing to update");
    }

    const updated = await Event.findByIdAndUpdate(
        eventId,
        { $set: updates },
        { new: true, runValidators: true }
    )
        .select("-coverImagePublicId")
        .populate("createdBy", "profile.displayName profile.avatar")
        .populate("societyId", "name tag");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Event updated successfully"));
});

/**
 * PATCH /api/v1/events/:eventId/publish
 */
const publishEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await findEventById(eventId, "createdBy status title startAt endAt venue");
    requireEventOwnerOrAdmin(event, req.user);

    if (event.status !== "draft") {
        throw new ApiError(400, `Event is already "${event.status}" — only drafts can be published`);
    }

    if (event.startAt <= new Date()) {
        throw new ApiError(400, "Cannot publish an event whose start date has already passed");
    }

    const updated = await Event.findByIdAndUpdate(
        eventId,
        { $set: { status: "published" } },
        { new: true }
    ).select("-registrations -feedback -coverImagePublicId");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Event published successfully"));
});

/**
 * PATCH /api/v1/events/:eventId/cancel
 */
const cancelEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { reason } = req.body;

    const event = await findEventById(eventId, "createdBy status title");
    requireEventOwnerOrAdmin(event, req.user);

    if (event.status === "cancelled") {
        throw new ApiError(400, "Event is already cancelled");
    }
    if (event.status === "completed") {
        throw new ApiError(400, "A completed event cannot be cancelled");
    }

    const updated = await Event.findByIdAndUpdate(
        eventId,
        {
            $set: {
                status: "cancelled",
                cancelledAt: new Date(),
                cancelledBy: req.user._id,
                cancellationReason: reason?.trim() || "",
            },
        },
        { new: true }
    ).select("-registrations -feedback -coverImagePublicId");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Event cancelled successfully"));
});

/**
 * PATCH /api/v1/events/:eventId/complete
 */
const completeEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await findEventById(eventId, "createdBy status endAt");
    requireEventOwnerOrAdmin(event, req.user);

    if (event.status !== "published") {
        throw new ApiError(400, "Only published events can be marked as completed");
    }

    const updated = await Event.findByIdAndUpdate(
        eventId,
        { $set: { status: "completed" } },
        { new: true }
    ).select("-registrations -feedback -coverImagePublicId");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Event marked as completed"));
});

/**
 * DELETE /api/v1/events/:eventId
 */
const deleteEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await findEventById(eventId, "createdBy status coverImagePublicId");
    requireEventOwnerOrAdmin(event, req.user);

    if (!["draft", "cancelled"].includes(event.status)) {
        throw new ApiError(
            400,
            "Only draft or cancelled events can be deleted. Cancel the event first."
        );
    }
    if (event.coverImagePublicId) {
        deleteFromCloudinary(event.coverImagePublicId).catch((err) =>
            console.error("[Cloudinary] Failed to delete event cover on delete:", err)
        );
    }

    await Event.findByIdAndDelete(eventId);

    return res
        .status(200)
        .json(new ApiResponse(200, { eventId }, "Event deleted successfully"));
});

/**
 * POST /api/v1/events/:eventId/register
 */
const registerForEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await findEventById(
        eventId,
        "status startAt maxCapacity waitlistEnabled registrations registrationCount waitlistCount requireApproval"
    );

    if (event.status !== "published") {
        throw new ApiError(400, "Registrations are only open for published events");
    }
    if (event.startAt <= new Date()) {
        throw new ApiError(400, "Registration is closed — the event has already started");
    }

    const userId = req.user._id.toString();

    const existing = event.registrations.find(
        (r) => r.userId.toString() === userId
    );
    if (existing) {
        if (existing.status === "registered") {
            throw new ApiError(409, "You are already registered for this event");
        }
        if (existing.status === "waitlisted") {
            throw new ApiError(409, "You are already on the waitlist for this event");
        }
        if (existing.status === "cancelled") {
            existing.status = "registered";
            existing.registeredAt = new Date();
            await event.save();
            return res
                .status(200)
                .json(new ApiResponse(200, { status: "registered" }, "Successfully re-registered for the event"));
        }
    }

    let regStatus = "registered";
    if (event.maxCapacity > 0 && event.registrationCount >= event.maxCapacity) {
        if (!event.waitlistEnabled) {
            throw new ApiError(409, "Event is full and no waitlist is available");
        }
        regStatus = "waitlisted";
    }

    event.registrations.push({
        userId: req.user._id,
        status: regStatus,
        registeredAt: new Date(),
    });

    await event.save();

    return res.status(201).json(
        new ApiResponse(
            201,
            { status: regStatus },
            regStatus === "waitlisted"
                ? "Event is full — you have been added to the waitlist"
                : "Successfully registered for the event"
        )
    );
});

/**
 * DELETE /api/v1/events/:eventId/register
 */
const unregisterFromEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await findEventById(eventId, "status startAt registrations maxCapacity waitlistEnabled");

    if (event.startAt <= new Date()) {
        throw new ApiError(400, "Cannot unregister after the event has started");
    }

    const userId = req.user._id.toString();
    const regIndex = event.registrations.findIndex(
        (r) => r.userId.toString() === userId && r.status === "registered"
    );

    if (regIndex === -1) {
        throw new ApiError(404, "You are not registered for this event");
    }

    event.registrations[regIndex].status = "cancelled";

    if (event.maxCapacity > 0 && event.waitlistEnabled) {
        const waitlistedIndex = event.registrations.findIndex(
            (r) => r.status === "waitlisted"
        );
        if (waitlistedIndex !== -1) {
            event.registrations[waitlistedIndex].status = "registered";
        }
    }

    await event.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Registration cancelled successfully"));
});

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/events/:eventId/feedback
 */
const submitFeedback = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be a number between 1 and 5");
    }

    const event = await findEventById(eventId, "status registrations feedback");

    if (event.status !== "completed") {
        throw new ApiError(400, "Feedback can only be submitted for completed events");
    }

    const userId = req.user._id.toString();

    const registration = event.registrations.find(
        (r) =>
            r.userId.toString() === userId &&
            ["registered", "attended"].includes(r.status)
    );
    if (!registration) {
        throw new ApiError(403, "Only registered attendees can submit feedback");
    }

    const alreadyFeedback = event.feedback.find(
        (f) => f.userId.toString() === userId
    );
    if (alreadyFeedback) {
        throw new ApiError(409, "You have already submitted feedback for this event");
    }

    event.feedback.push({
        userId: req.user._id,
        rating: parseInt(rating, 10),
        comment: comment?.trim() || "",
    });

    await event.save();

    return res
        .status(201)
        .json(new ApiResponse(201, { averageRating: event.averageRating }, "Feedback submitted successfully"));
});

/**
 * GET /api/v1/events/:eventId/feedback
 */
const getEventFeedback = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await findEventById(eventId, "createdBy status feedback averageRating");
    requireEventOwnerOrAdmin(event, req.user);

    await Event.populate(event.feedback, {
        path: "userId",
        select: "profile.displayName profile.avatar",
        model: "User",
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    event.feedback.forEach((f) => {
        distribution[f.rating] = (distribution[f.rating] || 0) + 1;
    });

    return res.status(200).json(
        new ApiResponse(200, {
            averageRating: event.averageRating,
            totalFeedback: event.feedback.length,
            distribution,
            feedback: event.feedback,
        }, "Event feedback fetched successfully")
    );
});

export {
    getEvents,
    getUpcomingEvents,
    getEventById,
    getEventAttendees,
    getMyRegisteredEvents,
    getMyCreatedEvents,
    createEvent,
    updateEvent,
    publishEvent,
    cancelEvent,
    completeEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    submitFeedback,
    getEventFeedback,
};