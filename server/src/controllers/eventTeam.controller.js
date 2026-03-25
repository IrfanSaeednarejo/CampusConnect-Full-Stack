import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import { EventTeam } from "../models/eventTeam.model.js";
import { Chat } from "../models/chat.model.js";
import { paginate } from "../utils/paginate.js";
import { emitToEventStaff, emitTeamUpdate } from "../sockets/event.socket.js";

const findCompetitionById = async (eventId) => {
    if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event ID");
    const event = await Event.findOne({ _id: eventId, isOnlineCompetition: true });
    if (!event) throw new ApiError(404, "Competition not found");
    return event;
};

const findTeamById = async (teamId, select = "") => {
    if (!mongoose.isValidObjectId(teamId)) throw new ApiError(400, "Invalid team ID");
    const team = await EventTeam.findById(teamId).select(select || undefined);
    if (!team) throw new ApiError(404, "Team not found");
    return team;
};

const requireTeamLeaderOrAdmin = (team, user) => {
    const isAdmin = user.roles?.includes("admin");
    const isLeader = team.leader.toString() === user._id.toString();
    if (!isAdmin && !isLeader) {
        throw new ApiError(403, "Only the team leader or an admin can perform this action");
    }
};
const assertRegistrationOpen = (event) => {
    if (!["registration", "ongoing"].includes(event.status)) {
        throw new ApiError(
            400,
            `Teams cannot be created during the "${event.status}" phase. ` +
            `Registration must be open.`
        );
    }
    if (event.registrationDeadline && event.registrationDeadline < new Date()) {
        throw new ApiError(400, "Registration deadline has passed");
    }
};
const assertTeamEvent = (event) => {
    if (event.participationType === "individual") {
        throw new ApiError(400, "This is an individual event — team participation is not allowed");
    }
};

/**
 * GET /api/v1/competitions/:eventId/teams
 */
const getTeams = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, status } = req.query;

    const event = await findCompetitionById(req.params.eventId);

    const isAdmin = req.user?.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === req.user._id.toString();

    const filter = { eventId: event._id };
    if (!isAdmin && !isOrganizer) {
        filter.status = { $in: ["forming", "registered"] };
    } else if (status && status !== "all") {
        filter.status = status;
    }

    const result = await paginate(EventTeam, filter, {
        page, limit,
        sort: { createdAt: -1 },
        populate: [
            {
                path: "leader",
                select: "profile.displayName profile.avatar",
            },
            {
                path: "members.userId",
                select: "profile.displayName profile.avatar academic.department",
            },
        ],
    });

    return res.status(200).json(new ApiResponse(200, result, "Teams fetched successfully"));
});
/**
 * GET /api/v1/competitions/:eventId/teams/:teamId
 */
const getTeamById = asyncHandler(async (req, res) => {
    const { eventId, teamId } = req.params;

    await findCompetitionById(eventId);
    const team = await EventTeam.findOne({ _id: teamId, eventId })
        .populate("leader", "profile.displayName profile.avatar profile.firstName profile.lastName")
        .populate("members.userId", "profile.displayName profile.avatar profile.firstName profile.lastName academic.department")
        .populate("submissionId", "title status submittedAt links");

    if (!team) throw new ApiError(404, "Team not found in this competition");

    return res.status(200).json(new ApiResponse(200, team, "Team fetched successfully"));
});

/**
 * POST /api/v1/competitions/:eventId/teams
 */
const createTeam = asyncHandler(async (req, res) => {
    const { teamName } = req.body;

    if (!teamName?.trim()) throw new ApiError(400, "teamName is required");

    const event = await findCompetitionById(req.params.eventId);

    assertRegistrationOpen(event);
    assertTeamEvent(event);

    const alreadyInTeam = await EventTeam.isUserInEvent(event._id, req.user._id);
    if (alreadyInTeam) {
        throw new ApiError(409, "You are already in a team for this competition");
    }
    if (event.teamConfig?.maxTeams > 0) {
        const teamCount = await EventTeam.countDocuments({
            eventId: event._id,
            status: { $in: ["forming", "registered"] },
        });
        if (teamCount >= event.teamConfig.maxTeams) {
            throw new ApiError(409, "Maximum number of teams has been reached for this competition");
        }
    }
    const nameTaken = await EventTeam.exists({
        eventId: event._id,
        teamName: { $regex: new RegExp(`^${teamName.trim()}$`, "i") },
    });
    if (nameTaken) throw new ApiError(409, "Team name is already taken for this competition");

    const team = await EventTeam.create({
        eventId: event._id,
        teamName: teamName.trim(),
        leader: req.user._id,
        members: [{ userId: req.user._id, role: "leader", joinedAt: new Date() }],
        status: "forming",
    });

    try {
        const chat = await Chat.create({
            type: "studygroup",
            name: `[${event.title.substring(0, 30)}] ${team.teamName}`,
            campusId: event.campusId,
            createdBy: req.user._id,
            contextId: team._id,
            members: [{ userId: req.user._id, role: "admin", joinedAt: new Date() }],
        });

        team.chatId = chat._id;
        await team.save();
    } catch (err) {
        console.error("[EventTeam] Failed to create team chat:", err.message);
    }

    const populated = await EventTeam.findById(team._id)
        .populate("leader", "profile.displayName profile.avatar")
        .populate("members.userId", "profile.displayName profile.avatar");

    const io = req.app.get("io");
    if (io) emitTeamUpdate(io, event._id.toString(), { action: "created", team: populated });

    return res.status(201).json(new ApiResponse(201, populated, "Team created successfully"));
});

/**
 * PATCH /api/v1/competitions/:eventId/teams/:teamId
 */
const updateTeam = asyncHandler(async (req, res) => {
    const { eventId, teamId } = req.params;
    const { teamName } = req.body;

    if (!teamName?.trim()) throw new ApiError(400, "teamName is required");

    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId);

    if (team.eventId.toString() !== event._id.toString()) {
        throw new ApiError(404, "Team not found in this competition");
    }
    requireTeamLeaderOrAdmin(team, req.user);

    if (!team.isActive) {
        throw new ApiError(400, "Cannot update a disqualified or withdrawn team");
    }

    if (["submission_locked", "judging", "completed"].includes(event.status)) {
        throw new ApiError(400, "Team cannot be renamed after submissions are locked");
    }

    const nameTaken = await EventTeam.exists({
        eventId: event._id,
        _id: { $ne: teamId },
        teamName: { $regex: new RegExp(`^${teamName.trim()}$`, "i") },
    });
    if (nameTaken) throw new ApiError(409, "Team name is already taken");

    const updated = await EventTeam.findByIdAndUpdate(
        teamId,
        { $set: { teamName: teamName.trim() } },
        { new: true }
    ).populate("members.userId", "profile.displayName profile.avatar");

    return res.status(200).json(new ApiResponse(200, updated, "Team updated successfully"));
});

/**
 * DELETE /api/v1/competitions/:eventId/teams/:teamId
 */
const deleteTeam = asyncHandler(async (req, res) => {
    const { eventId, teamId } = req.params;

    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId, "leader eventId chatId status");

    if (team.eventId.toString() !== event._id.toString()) {
        throw new ApiError(404, "Team not found in this competition");
    }
    requireTeamLeaderOrAdmin(team, req.user);

    if (!["draft", "registration"].includes(event.status)) {
        throw new ApiError(400, "Teams can only be disbanded during the registration phase");
    }

    if (team.chatId) {
        Chat.findByIdAndUpdate(team.chatId, { $set: { isArchived: true } }).catch(console.error);
    }

    await EventTeam.findByIdAndDelete(teamId);

    return res.status(200).json(new ApiResponse(200, { teamId }, "Team disbanded successfully"));
});

/**
 * POST /api/v1/competitions/:eventId/teams/:teamId/join
 */
const joinTeam = asyncHandler(async (req, res) => {
    const { eventId, teamId } = req.params;
    const { inviteCode } = req.body;

    if (!inviteCode) throw new ApiError(400, "inviteCode is required");

    const event = await findCompetitionById(eventId);
    assertRegistrationOpen(event);

    const team = await findTeamById(teamId, "eventId inviteCode leader members memberCount status chatId");

    if (team.eventId.toString() !== event._id.toString()) {
        throw new ApiError(404, "Team not found in this competition");
    }
    if (team.inviteCode !== inviteCode.toUpperCase().trim()) {
        throw new ApiError(400, "Invalid invite code");
    }

    if (!team.isActive) {
        throw new ApiError(400, "This team is no longer accepting members");
    }

    const alreadyMember = team.members.some(
        (m) => m.userId.toString() === req.user._id.toString()
    );
    if (alreadyMember) throw new ApiError(409, "You are already a member of this team");

    const inOther = await EventTeam.isUserInEvent(event._id, req.user._id);
    if (inOther) throw new ApiError(409, "You are already in another team for this competition");

    const maxSize = event.teamConfig?.maxSize || 5;
    if (team.memberCount >= maxSize) {
        throw new ApiError(409, `Team is full (max ${maxSize} members)`);
    }

    team.members.push({ userId: req.user._id, role: "member", joinedAt: new Date() });
    await team.save();

    // Add to team chat
    if (team.chatId) {
        Chat.findByIdAndUpdate(team.chatId, {
            $push: { members: { userId: req.user._id, role: "member", joinedAt: new Date() } },
        }).catch(console.error);
    }

    const updated = await EventTeam.findById(teamId)
        .populate("members.userId", "profile.displayName profile.avatar");

    const io = req.app.get("io");
    if (io) emitTeamUpdate(io, eventId, { action: "member_joined", teamId, userId: req.user._id });

    return res.status(201).json(new ApiResponse(201, updated, "Joined team successfully"));
});

/**
 * POST /api/v1/competitions/:eventId/teams/:teamId/leave
 */
const leaveTeam = asyncHandler(async (req, res) => {
    const { eventId, teamId } = req.params;

    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId, "eventId leader members memberCount status chatId submissionId");

    if (team.eventId.toString() !== event._id.toString()) {
        throw new ApiError(404, "Team not found in this competition");
    }

    if (["submission_locked", "judging", "completed"].includes(event.status)) {
        throw new ApiError(
            400,
            "Cannot leave a team after submissions are locked — contact the organizer"
        );
    }

    // Leaders must disband or transfer
    if (team.leader.toString() === req.user._id.toString()) {
        throw new ApiError(
            400,
            "Team leaders cannot leave. Transfer leadership first, or disband the team."
        );
    }

    const memberIndex = team.members.findIndex(
        (m) => m.userId.toString() === req.user._id.toString()
    );
    if (memberIndex === -1) {
        throw new ApiError(404, "You are not a member of this team");
    }

    team.members.splice(memberIndex, 1);
    await team.save();

    if (team.chatId) {
        Chat.findByIdAndUpdate(team.chatId, {
            $pull: { members: { userId: req.user._id } },
        }).catch(console.error);
    }

    return res.status(200).json(new ApiResponse(200, null, "You have left the team"));
});

/**
 * DELETE /api/v1/competitions/:eventId/teams/:teamId/members/:userId
 */
const kickMember = asyncHandler(async (req, res) => {
    const { eventId, teamId, userId: targetUserId } = req.params;

    if (!mongoose.isValidObjectId(targetUserId)) throw new ApiError(400, "Invalid userId");

    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId, "eventId leader members memberCount chatId");

    if (team.eventId.toString() !== event._id.toString()) {
        throw new ApiError(404, "Team not found in this competition");
    }
    requireTeamLeaderOrAdmin(team, req.user);

    if (targetUserId === req.user._id.toString() && team.leader.toString() === req.user._id.toString()) {
        throw new ApiError(400, "Use the disband endpoint to remove yourself as leader");
    }

    if (team.leader.toString() === targetUserId) {
        throw new ApiError(400, "Cannot kick the team leader");
    }

    if (["submission_locked", "judging", "completed"].includes(event.status)) {
        throw new ApiError(400, "Cannot remove members after submission deadline");
    }

    const memberIndex = team.members.findIndex(
        (m) => m.userId.toString() === targetUserId
    );
    if (memberIndex === -1) throw new ApiError(404, "User is not a member of this team");

    team.members.splice(memberIndex, 1);
    await team.save();

    if (team.chatId) {
        Chat.findByIdAndUpdate(team.chatId, {
            $pull: { members: { userId: new mongoose.Types.ObjectId(targetUserId) } },
        }).catch(console.error);
    }

    return res.status(200).json(
        new ApiResponse(200, { removedUserId: targetUserId }, "Member removed from team")
    );
});

/**
 * PATCH /api/v1/competitions/:eventId/teams/:teamId/disqualify
 */
const disqualifyTeam = asyncHandler(async (req, res) => {
    const { eventId, teamId } = req.params;
    const { reason } = req.body;

    const event = await findCompetitionById(eventId);

    const isAdmin = req.user.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === req.user._id.toString();
    if (!isAdmin && !isOrganizer) {
        throw new ApiError(403, "Only organizers and admins can disqualify teams");
    }

    const team = await findTeamById(teamId, "eventId status");
    if (team.eventId.toString() !== event._id.toString()) {
        throw new ApiError(404, "Team not found in this competition");
    }
    if (team.status === "disqualified") {
        throw new ApiError(400, "Team is already disqualified");
    }

    const updated = await EventTeam.findByIdAndUpdate(
        teamId,
        {
            $set: {
                status: "disqualified",
                disqualifiedAt: new Date(),
                disqualifiedBy: req.user._id,
                disqualifiedReason: reason?.trim() || "",
            },
        },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, updated, "Team disqualified"));
});

/**
 * PATCH /api/v1/competitions/:eventId/teams/:teamId/transfer
 */
const transferLeadership = asyncHandler(async (req, res) => {
    const { eventId, teamId } = req.params;
    const { newLeaderId } = req.body;

    if (!newLeaderId || !mongoose.isValidObjectId(newLeaderId)) {
        throw new ApiError(400, "Valid newLeaderId is required");
    }

    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId, "eventId leader members status");

    if (team.eventId.toString() !== event._id.toString()) {
        throw new ApiError(404, "Team not found in this competition");
    }
    if (team.leader.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the current team leader can transfer leadership");
    }

    if (["submission_locked", "judging", "completed"].includes(event.status)) {
        throw new ApiError(400, "Leadership cannot be transferred after submission deadline");
    }

    const newLeaderMember = team.members.find(
        (m) => m.userId.toString() === newLeaderId
    );
    if (!newLeaderMember) {
        throw new ApiError(404, "Target user is not a member of this team");
    }
    for (const m of team.members) {
        if (m.userId.toString() === newLeaderId) m.role = "leader";
        else if (m.userId.toString() === req.user._id.toString()) m.role = "member";
    }
    team.leader = new mongoose.Types.ObjectId(newLeaderId);
    await team.save();

    const updated = await EventTeam.findById(teamId)
        .populate("leader", "profile.displayName profile.avatar")
        .populate("members.userId", "profile.displayName profile.avatar");

    return res.status(200).json(new ApiResponse(200, updated, "Leadership transferred successfully"));
});
export {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
    kickMember,
    disqualifyTeam,
    transferLeadership,
};