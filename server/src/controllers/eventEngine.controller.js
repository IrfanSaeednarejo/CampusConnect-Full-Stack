import fs from "fs";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import { EventTeam } from "../models/eventTeam.model.js";
import { EventSubmission } from "../models/eventsSubmission.model.js";
import { EventScore } from "../models/eventScore.model.js";
import { paginate } from "../utils/paginate.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { systemEvents } from "../utils/events.js";
import {
    emitStatusChange,
    emitAnnouncement,
    emitLeaderboardUpdate,
} from "../sockets/event.socket.js";
const uploadFile = async (localPath) => {
    if (!localPath) return null;
    try {
        return await uploadOnCloudinary(localPath);
    } finally {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
};

const findCompetitionById = async (eventId) => {
    if (!mongoose.isValidObjectId(eventId)) {
        throw new ApiError(400, "Invalid event ID format");
    }
    const event = await Event.findOne({ _id: eventId, isOnlineCompetition: true });
    if (!event) throw new ApiError(404, "Competition not found");
    return event;
};

const requireOrganizerOrAdmin = (event, user) => {
    const isAdmin = user.roles?.includes("admin");
    const isOwner = event.createdBy.toString() === user._id.toString();
    if (!isAdmin && !isOwner) {
        throw new ApiError(403, "Only the organizer or an admin can perform this action");
    }
};

const requireJudge = (event, user) => {
    const isAdmin = user.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === user._id.toString();
    const isJudge = event.judgingConfig?.judges?.some(
        (j) => j.toString() === user._id.toString()
    );
    if (!isAdmin && !isOrganizer && !isJudge) {
        throw new ApiError(403, "Only designated judges can perform this action");
    }
};
/**
 * POST /api/v1/competitions
 */
const createCompetition = asyncHandler(async (req, res) => {
    const {
        title, description, societyId, campusId, eventType,
        participationType, startAt, endAt,
        registrationDeadline, submissionDeadline,
        venue, teamConfig, judgingConfig, prizePool, tags, fee, category,
    } = req.body;

    if (!title?.trim()) throw new ApiError(400, "Title is required");
    if (!description?.trim()) throw new ApiError(400, "Description is required");
    if (!societyId) throw new ApiError(400, "societyId is required");
    if (!startAt || !endAt) throw new ApiError(400, "startAt and endAt are required");
    if (!venue?.type) throw new ApiError(400, "venue.type is required");

    if (!mongoose.isValidObjectId(societyId)) {
        throw new ApiError(400, "Invalid societyId");
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ApiError(400, "Invalid startAt or endAt date");
    }
    if (end <= start) throw new ApiError(400, "endAt must be after startAt");
    if (start <= new Date()) throw new ApiError(400, "startAt must be in the future");

    const resolvedCampusId = campusId || req.user.campusId;
    if (!resolvedCampusId) {
        throw new ApiError(400, "campusId is required");
    }
    const parse = (val) => (typeof val === "string" ? JSON.parse(val) : val) ?? {};

    const parsedVenue = parse(venue);
    const parsedTeamConfig = parse(teamConfig);
    const parsedJudgingConfig = parse(judgingConfig);
    const parsedPrizePool = Array.isArray(prizePool) ? prizePool
        : typeof prizePool === "string" ? JSON.parse(prizePool) : [];
    const parsedTags = Array.isArray(tags) ? tags
        : typeof tags === "string" ? JSON.parse(tags) : [];
    const parsedFee = parse(fee);
    const partType = participationType || "individual";
    if ((partType === "team" || partType === "both") && parsedTeamConfig) {
        if ((parsedTeamConfig.minSize || 1) > (parsedTeamConfig.maxSize || 5)) {
            throw new ApiError(400, "teamConfig.minSize cannot exceed maxSize");
        }
    }
    if (parsedJudgingConfig?.criteria?.length > 0) {
        for (const c of parsedJudgingConfig.criteria) {
            if (!c.name || !c.maxScore || c.maxScore < 1) {
                throw new ApiError(400, `Invalid criterion: name and maxScore are required (min 1)`);
            }
        }
    }

    const regDeadline = registrationDeadline ? new Date(registrationDeadline) : undefined;
    const subDeadline = submissionDeadline ? new Date(submissionDeadline) : undefined;

    if (regDeadline && regDeadline >= start) {
        throw new ApiError(400, "registrationDeadline must be before startAt");
    }
    if (subDeadline && end && subDeadline > end) {
        throw new ApiError(400, "submissionDeadline must be before or equal to endAt");
    }
    const coverLocalPath = req.file?.path;
    const cover = coverLocalPath ? await uploadFile(coverLocalPath) : null;

    const event = await Event.create({
        title: title.trim(),
        description: description.trim(),
        societyId,
        campusId: resolvedCampusId,
        createdBy: req.user._id,
        isOnlineCompetition: true,
        eventType: eventType || "hackathon",
        category: category || "competition",
        participationType: partType,
        venue: parsedVenue,
        startAt: start,
        endAt: end,
        registrationDeadline: regDeadline,
        submissionDeadline: subDeadline,
        teamConfig: {
            minSize: parsedTeamConfig?.minSize || 1,
            maxSize: parsedTeamConfig?.maxSize || 5,
            maxTeams: parsedTeamConfig?.maxTeams || 0,
            allowSoloInTeamEvent: parsedTeamConfig?.allowSoloInTeamEvent || false,
        },
        judgingConfig: {
            criteria: parsedJudgingConfig?.criteria || [],
            isAnonymous: parsedJudgingConfig?.isAnonymous || false,
            judges: parsedJudgingConfig?.judges || [],
        },
        prizePool: parsedPrizePool,
        tags: parsedTags,
        fee: { amount: parsedFee?.amount || 0, currency: parsedFee?.currency || "PKR" },
        coverImage: cover?.secure_url || "",
        coverImagePublicId: cover?.public_id || "",
        status: "draft",
    });

    return res.status(201).json(new ApiResponse(201, event, "Competition created successfully"));
});

/**
 * GET /api/v1/competitions
 */
const getCompetitions = asyncHandler(async (req, res) => {
    const {
        page = 1, limit = 12, campusId, eventType,
        participationType, status, q,
    } = req.query;

    const filter = { isOnlineCompetition: true };
    const isAdmin = req.user?.roles?.includes("admin");

    if (!isAdmin) {
        filter.status = { $in: ["registration", "ongoing", "submission_locked", "judging", "completed"] };
    } else if (status && status !== "all") {
        filter.status = status;
    }

    if (campusId) {
        if (!mongoose.isValidObjectId(campusId)) throw new ApiError(400, "Invalid campusId");
        filter.campusId = new mongoose.Types.ObjectId(campusId);
    }
    if (eventType) filter.eventType = eventType;
    if (participationType) filter.participationType = participationType;
    if (q?.trim()) filter.$text = { $search: q.trim() };

    const result = await paginate(Event, filter, {
        page, limit,
        select: "-registrations -feedback -coverImagePublicId -announcements",
        sort: q?.trim() ? { score: { $meta: "textScore" } } : { startAt: 1 },
        populate: [
            { path: "createdBy", select: "profile.displayName profile.avatar" },
            { path: "societyId", select: "name tag" },
        ],
    });

    return res.status(200).json(new ApiResponse(200, result, "Competitions fetched successfully"));
});

/**
 * GET /api/v1/competitions/:eventId
 */
const getCompetitionById = asyncHandler(async (req, res) => {
    const event = await findCompetitionById(req.params.eventId);

    const isAdmin = req.user?.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === req.user?._id?.toString();
    if (event.status === "draft" && !isAdmin && !isOrganizer) {
        throw new ApiError(404, "Competition not found");
    }

    await Event.populate(event, [
        { path: "createdBy", select: "profile.displayName profile.avatar profile.firstName profile.lastName" },
        { path: "societyId", select: "name tag description" },
        { path: "judgingConfig.judges", select: "profile.displayName profile.avatar" },
    ]);
    const eventObj = event.toObject({ virtuals: true });
    if (!isAdmin && !isOrganizer && !["judging", "completed"].includes(event.status)) {
        delete eventObj.judgingConfig.criteria;
    }

    const teamCount = await EventTeam.countDocuments({
        eventId: event._id,
        status: { $in: ["forming", "registered"] },
    });
    let myParticipation = null;
    if (req.user) {
        const myTeam = await EventTeam.findUserTeam(event._id, req.user._id);
        const mySolo = await EventSubmission.findForParticipant(event._id, null, req.user._id);
        myParticipation = { team: myTeam || null, soloSubmission: mySolo || null };
    }

    return res.status(200).json(
        new ApiResponse(200, { ...eventObj, teamCount, myParticipation }, "Competition fetched successfully")
    );
});

/**
 * PATCH /api/v1/competitions/:eventId
 */
const updateCompetition = asyncHandler(async (req, res) => {
    const event = await findCompetitionById(req.params.eventId);
    requireOrganizerOrAdmin(event, req.user);

    if (["completed", "cancelled"].includes(event.status)) {
        throw new ApiError(400, `Cannot update a ${event.status} competition`);
    }

    const registrationLocked = !["draft"].includes(event.status);

    const {
        title, description, startAt, endAt,
        registrationDeadline, submissionDeadline,
        venue, prizePool, tags, fee,
        teamConfig, judgingConfig, participationType,
    } = req.body;

    const updates = {};
    const parse = (val) => (typeof val === "string" ? JSON.parse(val) : val);

    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (tags !== undefined) {
        updates.tags = Array.isArray(tags) ? tags : parse(tags);
    }
    if (venue) updates.venue = parse(venue);
    if (fee !== undefined) {
        const f = parse(fee);
        updates.fee = { amount: f?.amount ?? 0, currency: f?.currency ?? "PKR" };
    }
    if (prizePool !== undefined) {
        updates.prizePool = Array.isArray(prizePool) ? prizePool : parse(prizePool);
    }
    if (startAt) {
        const s = new Date(startAt);
        if (isNaN(s.getTime())) throw new ApiError(400, "Invalid startAt");
        updates.startAt = s;
    }
    if (endAt) {
        const e = new Date(endAt);
        if (isNaN(e.getTime())) throw new ApiError(400, "Invalid endAt");
        updates.endAt = e;
    }
    if (registrationDeadline !== undefined) {
        updates.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    }
    if (submissionDeadline !== undefined) {
        const sd = submissionDeadline ? new Date(submissionDeadline) : null;
        if (event.status === "submission_locked") {
            throw new ApiError(400, "Cannot extend submission deadline — submissions are already locked");
        }
        updates.submissionDeadline = sd;
    }
    if (registrationLocked && (teamConfig || judgingConfig?.criteria || participationType)) {
        throw new ApiError(
            400,
            "teamConfig, judgingConfig.criteria, and participationType cannot be changed after registration begins"
        );
    }
    if (!registrationLocked) {
        if (teamConfig) updates.teamConfig = parse(teamConfig);
        if (participationType) updates.participationType = participationType;
        if (judgingConfig) {
            const jc = parse(judgingConfig);
            updates["judgingConfig.isAnonymous"] = jc.isAnonymous ?? event.judgingConfig.isAnonymous;
            if (jc.criteria) updates["judgingConfig.criteria"] = jc.criteria;
            if (jc.judges) updates["judgingConfig.judges"] = jc.judges;
        }
    } else if (judgingConfig) {
        const jc = parse(judgingConfig);
        if (jc.judges !== undefined) updates["judgingConfig.judges"] = jc.judges;
        if (jc.isAnonymous !== undefined) updates["judgingConfig.isAnonymous"] = jc.isAnonymous;
    }
    const coverLocalPath = req.file?.path;
    if (coverLocalPath) {
        const cover = await uploadFile(coverLocalPath);
        if (cover?.secure_url) {
            if (event.coverImagePublicId) {
                deleteFromCloudinary(event.coverImagePublicId).catch(console.error);
            }
            updates.coverImage = cover.secure_url;
            updates.coverImagePublicId = cover.public_id;
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided — nothing to update");
    }

    const updated = await Event.findByIdAndUpdate(
        event._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select("-coverImagePublicId");

    return res.status(200).json(new ApiResponse(200, updated, "Competition updated successfully"));
});

/**
 * DELETE /api/v1/competitions/:eventId
 */
const deleteCompetition = asyncHandler(async (req, res) => {
    const event = await findCompetitionById(req.params.eventId);
    requireOrganizerOrAdmin(event, req.user);

    if (!["draft", "cancelled"].includes(event.status)) {
        throw new ApiError(
            400,
            "Only draft or cancelled competitions can be deleted. Cancel first."
        );
    }
    const submissionIds = (await EventSubmission.find({ eventId: event._id }).select("_id")).map(
        (s) => s._id
    );

    await Promise.all([
        EventTeam.deleteMany({ eventId: event._id }),
        EventSubmission.deleteMany({ eventId: event._id }),
        EventScore.deleteMany({ eventId: event._id }),
        event.coverImagePublicId
            ? deleteFromCloudinary(event.coverImagePublicId).catch(console.error)
            : null,
        Event.findByIdAndDelete(event._id),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { deletedEventId: event._id }, "Competition and all related data deleted")
    );
});
/**
 * PATCH /api/v1/competitions/:eventId/transition
 */
const transitionState = asyncHandler(async (req, res) => {
    const { status: newStatus, reason, force = false } = req.body;

    if (!newStatus) throw new ApiError(400, "status is required");

    const event = await findCompetitionById(req.params.eventId);
    requireOrganizerOrAdmin(event, req.user);
    if (newStatus === "registration") {
        if (!event.startAt) throw new ApiError(400, "startAt must be set before opening registration");
    }

    if (newStatus === "judging") {
        if (event.judgingConfig?.criteria?.length === 0) {
            throw new ApiError(400, "Add judging criteria before moving to judging phase");
        }
        if (event.judgingConfig?.judges?.length === 0) {
            throw new ApiError(400, "Assign at least one judge before moving to judging phase");
        }
    }

    if (newStatus === "completed" && !force) {
        if (!event.scoringPublished) {
            throw new ApiError(
                400,
                "Publish the leaderboard before completing the competition (or pass force=true to override)"
            );
        }
    }
    const updated = await Event.transitionState(
        event._id, newStatus, req.user._id,
        { cancellationReason: reason?.trim() }
    );
    const io = req.app.get("io");
    if (io) {
        emitStatusChange(io, event._id.toString(), {
            eventId: event._id,
            previousStatus: event.status,
            newStatus,
            changedBy: req.user._id,
            changedAt: new Date(),
        });
    }
    systemEvents.emit("notification:create:bulk", {
        eventId: event._id,
        type: "event_update",
        title: `${event.title} — Status Changed`,
        body: `The competition has moved to "${newStatus}"`,
        ref: event._id,
        refModel: "Event",
        actorId: req.user._id,
    });

    return res.status(200).json(new ApiResponse(200, updated, `Competition transitioned to "${newStatus}"`));
});

/**
 * POST /api/v1/competitions/:eventId/announcement
 */
const postAnnouncement = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content?.trim()) throw new ApiError(400, "Announcement content is required");
    if (content.trim().length > 1000) throw new ApiError(400, "Announcement cannot exceed 1000 characters");

    const event = await findCompetitionById(req.params.eventId);
    requireOrganizerOrAdmin(event, req.user);

    if (["draft", "cancelled", "completed"].includes(event.status)) {
        throw new ApiError(400, "Announcements can only be posted for active competitions");
    }

    const announcement = {
        author: req.user._id,
        content: content.trim(),
        createdAt: new Date(),
    };

    const updated = await Event.findByIdAndUpdate(
        event._id,
        { $push: { announcements: { $each: [announcement], $position: 0 } } }, // newest first
        { new: true, select: "announcements" }
    );
    await Event.populate(updated, {
        path: "announcements.author",
        select: "profile.displayName profile.avatar",
        options: { match: { _id: announcement.author } },
    });

    const newAnnouncement = updated.announcements[0];
    const io = req.app.get("io");
    if (io) {
        emitAnnouncement(io, event._id.toString(), newAnnouncement);
    }
    systemEvents.emit("notification:create:bulk", {
        eventId: event._id,
        type: "event_update",
        title: `📢 ${event.title}`,
        body: content.trim().substring(0, 80) + (content.length > 80 ? "…" : ""),
        ref: event._id,
        refModel: "Event",
        actorId: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, newAnnouncement, "Announcement posted"));
});

/**
 * GET /api/v1/competitions/:eventId/announcements
 */
const getAnnouncements = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const event = await findCompetitionById(req.params.eventId);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, parseInt(limit, 10));
    const start = (pageNum - 1) * limitNum;

    const slice = event.announcements.slice(start, start + limitNum);

    await Event.populate(slice, {
        path: "author",
        select: "profile.displayName profile.avatar",
        model: "User",
    });

    return res.status(200).json(
        new ApiResponse(200, {
            announcements: slice,
            pagination: {
                total: event.announcements.length,
                page: pageNum,
                pages: Math.ceil(event.announcements.length / limitNum) || 1,
                limit: limitNum,
            },
        }, "Announcements fetched")
    );
});

/**
 * GET /api/v1/competitions/:eventId/leaderboard
 */
const getLeaderboard = asyncHandler(async (req, res) => {
    const event = await findCompetitionById(req.params.eventId);

    const isAdmin = req.user?.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === req.user?._id?.toString();

    if (!event.scoringPublished && !isAdmin && !isOrganizer) {
        throw new ApiError(403, "Leaderboard has not been published yet");
    }

    const leaderboard = await EventScore.generateLeaderboard(event._id);

    return res.status(200).json(
        new ApiResponse(200, {
            event: {
                _id: event._id,
                title: event.title,
                status: event.status,
                scoringPublished: event.scoringPublished,
            },
            leaderboard,
        }, "Leaderboard fetched successfully")
    );
});
/**
 * PATCH /api/v1/competitions/:eventId/leaderboard/publish
 */
const publishLeaderboard = asyncHandler(async (req, res) => {
    const event = await findCompetitionById(req.params.eventId);
    requireOrganizerOrAdmin(event, req.user);

    if (!["judging", "completed"].includes(event.status)) {
        throw new ApiError(400, "Leaderboard can only be published during judging or after completion");
    }

    if (event.scoringPublished) {
        throw new ApiError(400, "Leaderboard is already published");
    }
    await EventScore.publishAllForEvent(event._id);

    const updated = await Event.findByIdAndUpdate(
        event._id,
        { $set: { scoringPublished: true } },
        { new: true, select: "scoringPublished status title" }
    );
    const leaderboard = await EventScore.generateLeaderboard(event._id);

    const io = req.app.get("io");
    if (io) {
        emitLeaderboardUpdate(io, event._id.toString(), { leaderboard, publishedAt: new Date() });
    }
    systemEvents.emit("notification:create:bulk", {
        eventId: event._id,
        type: "event_update",
        title: `🏆 Results Announced — ${event.title}`,
        body: "The competition leaderboard has been published. See how you placed!",
        ref: event._id,
        refModel: "Event",
        actorId: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(200, { event: updated, leaderboard }, "Leaderboard published successfully")
    );
});

/**
 * PATCH /api/v1/competitions/:eventId/judges
 */
const updateJudges = asyncHandler(async (req, res) => {
    const { judges, action } = req.body;

    if (!Array.isArray(judges) || judges.length === 0) {
        throw new ApiError(400, "judges must be a non-empty array of user IDs");
    }
    if (!["add", "remove"].includes(action)) {
        throw new ApiError(400, 'action must be "add" or "remove"');
    }
    for (const id of judges) {
        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, `Invalid userId: ${id}`);
        }
    }

    const event = await findCompetitionById(req.params.eventId);
    requireOrganizerOrAdmin(event, req.user);

    if (["completed", "cancelled"].includes(event.status)) {
        throw new ApiError(400, "Cannot update judges for a completed or cancelled competition");
    }

    const judgeIds = judges.map((id) => new mongoose.Types.ObjectId(id));
    const update =
        action === "add"
            ? { $addToSet: { "judgingConfig.judges": { $each: judgeIds } } }
            : { $pull: { "judgingConfig.judges": { $in: judgeIds } } };

    const updated = await Event.findByIdAndUpdate(event._id, update, { new: true })
        .select("judgingConfig.judges");

    return res.status(200).json(
        new ApiResponse(200, updated.judgingConfig.judges, `Judges ${action === "add" ? "added" : "removed"} successfully`)
    );
});
export {
    createCompetition,
    getCompetitions,
    getCompetitionById,
    updateCompetition,
    deleteCompetition,
    transitionState,
    postAnnouncement,
    getAnnouncements,
    getLeaderboard,
    publishLeaderboard,
    updateJudges,
};