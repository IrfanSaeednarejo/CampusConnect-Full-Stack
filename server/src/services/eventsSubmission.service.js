import mongoose from "mongoose";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { Event } from "../models/event.model.js";
import { EventTeam } from "../models/eventTeam.model.js";
import { EventSubmission } from "../models/eventsSubmission.model.js";
import { File } from "../models/file.model.js";
import { paginate } from "../utils/paginate.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { emitToEventStaff } from "../sockets/event.socket.js";

const uploadFile = async (localPath) => {
    if (!localPath) return null;
    try {
        return await uploadOnCloudinary(localPath, "campusconnect/event_submissions");
    } finally {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
};

const findCompetitionById = async (eventId) => {
    if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event ID");
    const event = await Event.findOne({ _id: eventId, isOnlineCompetition: true });
    if (!event) throw new ApiError(404, "Competition not found");
    return event;
};

const resolveParticipantContext = async (event, user) => {
    const isTeamEvent = event.participationType === "team";
    const isBothEvent = event.participationType === "both";

    if (isTeamEvent || isBothEvent) {
        const team = await EventTeam.findUserTeam(event._id, user._id);
        if (isTeamEvent && !team && !event.teamConfig?.allowSoloInTeamEvent) {
            throw new ApiError(400, "You must be in a team to submit for this competition");
        }
        if (team) {
            if (team.status === "disqualified") throw new ApiError(403, "Your team has been disqualified");
            if (team.status === "withdrawn") throw new ApiError(403, "Your team has withdrawn from the competition");
            return { teamId: team._id, userId: user._id, isTeamSubmission: true, team };
        }
    }
    return { teamId: null, userId: user._id, isTeamSubmission: false, team: null };
};

const assertSubmissionsOpen = (event) => {
    if (!["ongoing"].includes(event.status)) {
        throw new ApiError(400, `Submissions are only accepted during the "ongoing" phase. Current status: "${event.status}"`);
    }
    if (event.submissionDeadline && event.submissionDeadline < new Date()) {
        throw new ApiError(400, "Submission deadline has passed. No more submissions are accepted.");
    }
};

export const upsertSubmission = async (eventId, data, io, requestUser) => {
    const { title, description, links } = data;
    if (!title?.trim()) throw new ApiError(400, "Submission title is required");

    const event = await findCompetitionById(eventId);
    assertSubmissionsOpen(event);

    const { teamId, userId, isTeamSubmission, team } = await resolveParticipantContext(event, requestUser);
    const isLate = event.submissionDeadline ? new Date() > event.submissionDeadline : false;
    const parsedLinks = Array.isArray(links) ? links : typeof links === "string" ? JSON.parse(links) : [];

    for (const link of parsedLinks) {
        if (!link.url || !/^https?:\/\/.+/.test(link.url)) throw new ApiError(400, `Invalid link URL: "${link.url}"`);
    }

    const existing = await EventSubmission.findForParticipant(event._id, teamId, userId);
    let submission;
    let isCreated = false;

    if (existing) {
        existing.title = title.trim();
        existing.description = description?.trim() || existing.description;
        if (parsedLinks.length > 0) existing.links = parsedLinks;
        existing.version += 1;
        existing.submittedAt = new Date();
        existing.status = "submitted";
        existing.isLate = isLate;
        await existing.save();
        submission = existing;
    } else {
        submission = await EventSubmission.create({
            eventId: event._id, teamId: teamId || undefined, userId, title: title.trim(),
            description: description?.trim() || "", links: parsedLinks, status: "submitted",
            submittedAt: new Date(), isLate, version: 1,
        });
        if (isTeamSubmission && team) {
            EventTeam.findByIdAndUpdate(team._id, { $set: { submissionId: submission._id } }).catch(console.error);
        }
        isCreated = true;
    }

    if (io) {
        emitToEventStaff(io, event._id.toString(), "event:submission_received", {
            submissionId: submission._id, title: submission.title, isLate,
            teamId: teamId || null, userId, version: submission.version,
        });
    }

    return { submission, isCreated };
};

export const getSubmissions = async (eventId, queryParams, requestUser) => {
    const { page = 1, limit = 20, status } = queryParams;

    const event = await findCompetitionById(eventId);

    const isAdmin = requestUser.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === requestUser._id.toString();
    const isJudge = event.judgingConfig?.judges?.some((j) => j.toString() === requestUser._id.toString());

    if (!isAdmin && !isOrganizer && !isJudge) {
        throw new ApiError(403, "Only organizers and judges can view all submissions");
    }

    const filter = { eventId: event._id };
    if (status) filter.status = status;

    return await paginate(EventSubmission, filter, {
        page, limit, sort: { submittedAt: -1 },
        populate: [
            { path: "userId", select: "profile.displayName profile.avatar academic.department" },
            { path: "teamId", select: "teamName memberCount status" },
            { path: "files.fileId", select: "fileName fileUrl mimeType fileSize" },
        ],
    });
};

export const getMySubmission = async (eventId, requestUser) => {
    const event = await findCompetitionById(eventId);
    const { teamId, userId } = await resolveParticipantContext(event, requestUser);
    const submission = await EventSubmission.findForParticipant(event._id, teamId, userId);

    if (!submission) return null;

    await EventSubmission.populate(submission, [{ path: "files.fileId", select: "fileName fileUrl mimeType fileSize" }]);
    return submission;
};

export const getSubmissionById = async (eventId, subId, requestUser) => {
    if (!mongoose.isValidObjectId(subId)) throw new ApiError(400, "Invalid submission ID");

    const event = await findCompetitionById(eventId);
    const submission = await EventSubmission.findOne({ _id: subId, eventId: event._id });
    if (!submission) throw new ApiError(404, "Submission not found");

    const isAdmin = requestUser.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === requestUser._id.toString();
    const isJudge = event.judgingConfig?.judges?.some((j) => j.toString() === requestUser._id.toString());
    const isOwner = submission.userId.toString() === requestUser._id.toString();

    let isTeamMember = false;
    if (!isOwner && submission.teamId) {
        const team = await EventTeam.findOne({ _id: submission.teamId, "members.userId": requestUser._id });
        isTeamMember = !!team;
    }

    if (!isAdmin && !isOrganizer && !isJudge && !isOwner && !isTeamMember) {
        throw new ApiError(403, "Access denied");
    }

    await EventSubmission.populate(submission, [
        { path: "userId", select: "profile.displayName profile.avatar" },
        { path: "teamId", select: "teamName leader members" },
        { path: "files.fileId", select: "fileName fileUrl mimeType fileSize" },
    ]);

    return submission;
};

export const addFileToSubmission = async (eventId, file, requestUser) => {
    const localPath = file?.path;
    if (!localPath) throw new ApiError(400, "No file uploaded");

    const event = await findCompetitionById(eventId);
    assertSubmissionsOpen(event);

    const { teamId, userId } = await resolveParticipantContext(event, requestUser);
    const submission = await EventSubmission.findForParticipant(event._id, teamId, userId);

    if (!submission) {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        throw new ApiError(400, "Create a submission first before uploading files");
    }

    if (submission.files.length >= 10) {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        throw new ApiError(400, "Maximum 10 file attachments per submission");
    }

    const uploaded = await uploadFile(localPath);
    if (!uploaded?.secure_url) throw new ApiError(500, "File upload failed — please try again");

    const fileDoc = await File.create({
        userId: requestUser._id, fileName: file.originalname, fileUrl: uploaded.secure_url,
        publicId: uploaded.public_id, mimeType: file.mimetype, fileSize: file.size,
        context: "event", contextId: submission._id, description: `Submission: ${submission.title}`, isPublic: false,
    });

    submission.files.push({ fileId: fileDoc._id });
    await submission.save();

    return {
        file: { _id: fileDoc._id, fileName: fileDoc.fileName, fileUrl: fileDoc.fileUrl, mimeType: fileDoc.mimeType, fileSize: fileDoc.fileSize },
        totalFiles: submission.files.length,
    };
};

export const removeFileFromSubmission = async (eventId, fileId, requestUser) => {
    if (!mongoose.isValidObjectId(fileId)) throw new ApiError(400, "Invalid file ID");

    const event = await findCompetitionById(eventId);
    assertSubmissionsOpen(event);

    const { teamId, userId } = await resolveParticipantContext(event, requestUser);
    const submission = await EventSubmission.findForParticipant(event._id, teamId, userId);
    if (!submission) throw new ApiError(404, "Submission not found");

    const fileIndex = submission.files.findIndex((f) => f.fileId.toString() === fileId);
    if (fileIndex === -1) throw new ApiError(404, "File not found in this submission");

    const fileDoc = await File.findById(fileId).select("publicId mimeType");
    if (fileDoc?.publicId) {
        const resourceType = fileDoc.mimeType?.startsWith("video/") ? "video" : "image";
        deleteFromCloudinary(fileDoc.publicId, resourceType).catch(console.error);
    }
    await File.findByIdAndDelete(fileId);

    submission.files.splice(fileIndex, 1);
    await submission.save();

    return fileId;
};
