import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Event } from "../models/event.model.js";
import { EventTeam } from "../models/eventTeam.model.js";
import { Chat } from "../models/chat.model.js";
import { paginate } from "../utils/paginate.js";
import { emitTeamUpdate } from "../sockets/event.socket.js";

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
        throw new ApiError(400, `Teams cannot be created during the "${event.status}" phase. Registration must be open.`);
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

export const getTeams = async (eventId, queryParams, requestUser) => {
    const { page = 1, limit = 12, status } = queryParams;

    const event = await findCompetitionById(eventId);

    const isAdmin = requestUser?.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === requestUser._id.toString();

    const filter = { eventId: event._id };
    if (!isAdmin && !isOrganizer) {
        filter.status = { $in: ["forming", "registered"] };
    } else if (status && status !== "all") {
        filter.status = status;
    }

    return await paginate(EventTeam, filter, {
        page, limit, sort: { createdAt: -1 },
        populate: [
            { path: "leader", select: "profile.displayName profile.avatar" },
            { path: "members.userId", select: "profile.displayName profile.avatar academic.department" },
        ],
    });
};

export const getTeamById = async (eventId, teamId) => {
    await findCompetitionById(eventId);
    const team = await EventTeam.findOne({ _id: teamId, eventId })
        .populate("leader", "profile.displayName profile.avatar profile.firstName profile.lastName")
        .populate("members.userId", "profile.displayName profile.avatar profile.firstName profile.lastName academic.department")
        .populate("submissionId", "title status submittedAt links");

    if (!team) throw new ApiError(404, "Team not found in this competition");
    return team;
};

export const createTeam = async (eventId, data, io, requestUser) => {
    const { teamName } = data;
    if (!teamName?.trim()) throw new ApiError(400, "teamName is required");

    const event = await findCompetitionById(eventId);

    assertRegistrationOpen(event);
    assertTeamEvent(event);

    const alreadyInTeam = await EventTeam.isUserInEvent(event._id, requestUser._id);
    if (alreadyInTeam) throw new ApiError(409, "You are already in a team for this competition");

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
        eventId: event._id, teamName: teamName.trim(), leader: requestUser._id,
        members: [{ userId: requestUser._id, role: "leader", joinedAt: new Date() }], status: "forming",
    });

    try {
        const chat = await Chat.create({
            type: "studygroup", name: `[${event.title.substring(0, 30)}] ${team.teamName}`, campusId: event.campusId,
            createdBy: requestUser._id, contextId: team._id, members: [{ userId: requestUser._id, role: "admin", joinedAt: new Date() }],
        });
        team.chatId = chat._id;
        await team.save();
    } catch (err) {
        console.error("[EventTeam] Failed to create team chat:", err.message);
    }

    const populated = await EventTeam.findById(team._id)
        .populate("leader", "profile.displayName profile.avatar")
        .populate("members.userId", "profile.displayName profile.avatar");

    if (io) emitTeamUpdate(io, eventId.toString(), { action: "created", team: populated });

    return populated;
};

export const updateTeam = async (eventId, teamId, data, requestUser) => {
    const { teamName } = data;
    if (!teamName?.trim()) throw new ApiError(400, "teamName is required");

    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId);

    if (team.eventId.toString() !== event._id.toString()) throw new ApiError(404, "Team not found in this competition");
    requireTeamLeaderOrAdmin(team, requestUser);

    if (!team.isActive) throw new ApiError(400, "Cannot update a disqualified or withdrawn team");

    if (["submission_locked", "judging", "completed"].includes(event.status)) {
        throw new ApiError(400, "Team cannot be renamed after submissions are locked");
    }

    const nameTaken = await EventTeam.exists({
        eventId: event._id, _id: { $ne: teamId }, teamName: { $regex: new RegExp(`^${teamName.trim()}$`, "i") },
    });
    if (nameTaken) throw new ApiError(409, "Team name is already taken");

    return await EventTeam.findByIdAndUpdate(
        teamId, { $set: { teamName: teamName.trim() } }, { new: true }
    ).populate("members.userId", "profile.displayName profile.avatar");
};

export const deleteTeam = async (eventId, teamId, requestUser) => {
    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId, "leader eventId chatId status");

    if (team.eventId.toString() !== event._id.toString()) throw new ApiError(404, "Team not found in this competition");
    requireTeamLeaderOrAdmin(team, requestUser);

    if (!["draft", "registration"].includes(event.status)) {
        throw new ApiError(400, "Teams can only be disbanded during the registration phase");
    }

    if (team.chatId) Chat.findByIdAndUpdate(team.chatId, { $set: { isArchived: true } }).catch(console.error);

    await EventTeam.findByIdAndDelete(teamId);
    return true;
};

export const joinTeam = async (eventId, teamId, data, io, requestUser) => {
    const { inviteCode } = data;
    if (!inviteCode) throw new ApiError(400, "inviteCode is required");

    const event = await findCompetitionById(eventId);
    assertRegistrationOpen(event);

    const team = await findTeamById(teamId, "eventId inviteCode leader members memberCount status chatId");

    if (team.eventId.toString() !== event._id.toString()) throw new ApiError(404, "Team not found in this competition");
    if (team.inviteCode !== inviteCode.toUpperCase().trim()) throw new ApiError(400, "Invalid invite code");

    if (!team.isActive) throw new ApiError(400, "This team is no longer accepting members");

    const alreadyMember = team.members.some((m) => m.userId.toString() === requestUser._id.toString());
    if (alreadyMember) throw new ApiError(409, "You are already a member of this team");

    const inOther = await EventTeam.isUserInEvent(event._id, requestUser._id);
    if (inOther) throw new ApiError(409, "You are already in another team for this competition");

    const maxSize = event.teamConfig?.maxSize || 5;
    if (team.memberCount >= maxSize) throw new ApiError(409, `Team is full (max ${maxSize} members)`);

    team.members.push({ userId: requestUser._id, role: "member", joinedAt: new Date() });
    await team.save();

    if (team.chatId) {
        Chat.findByIdAndUpdate(team.chatId, { $push: { members: { userId: requestUser._id, role: "member", joinedAt: new Date() } } }).catch(console.error);
    }

    const updated = await EventTeam.findById(teamId).populate("members.userId", "profile.displayName profile.avatar");

    if (io) emitTeamUpdate(io, eventId.toString(), { action: "member_joined", teamId, userId: requestUser._id });

    return updated;
};

export const leaveTeam = async (eventId, teamId, requestUser) => {
    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId, "eventId leader members memberCount status chatId submissionId");

    if (team.eventId.toString() !== event._id.toString()) throw new ApiError(404, "Team not found in this competition");

    if (["submission_locked", "judging", "completed"].includes(event.status)) {
        throw new ApiError(400, "Cannot leave a team after submissions are locked — contact the organizer");
    }

    if (team.leader.toString() === requestUser._id.toString()) {
        throw new ApiError(400, "Team leaders cannot leave. Transfer leadership first, or disband the team.");
    }

    const memberIndex = team.members.findIndex((m) => m.userId.toString() === requestUser._id.toString());
    if (memberIndex === -1) throw new ApiError(404, "You are not a member of this team");

    team.members.splice(memberIndex, 1);
    await team.save();

    if (team.chatId) {
        Chat.findByIdAndUpdate(team.chatId, { $pull: { members: { userId: requestUser._id } } }).catch(console.error);
    }

    return true;
};

export const kickMember = async (eventId, teamId, targetUserId, requestUser) => {
    if (!mongoose.isValidObjectId(targetUserId)) throw new ApiError(400, "Invalid userId");

    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId, "eventId leader members memberCount chatId");

    if (team.eventId.toString() !== event._id.toString()) throw new ApiError(404, "Team not found in this competition");
    requireTeamLeaderOrAdmin(team, requestUser);

    if (targetUserId === requestUser._id.toString() && team.leader.toString() === requestUser._id.toString()) {
        throw new ApiError(400, "Use the disband endpoint to remove yourself as leader");
    }

    if (team.leader.toString() === targetUserId) throw new ApiError(400, "Cannot kick the team leader");

    if (["submission_locked", "judging", "completed"].includes(event.status)) {
        throw new ApiError(400, "Cannot remove members after submission deadline");
    }

    const memberIndex = team.members.findIndex((m) => m.userId.toString() === targetUserId);
    if (memberIndex === -1) throw new ApiError(404, "User is not a member of this team");

    team.members.splice(memberIndex, 1);
    await team.save();

    if (team.chatId) {
        Chat.findByIdAndUpdate(team.chatId, { $pull: { members: { userId: new mongoose.Types.ObjectId(targetUserId) } } }).catch(console.error);
    }

    return targetUserId;
};

export const disqualifyTeam = async (eventId, teamId, data, requestUser) => {
    const { reason } = data;

    const event = await findCompetitionById(eventId);

    const isAdmin = requestUser.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === requestUser._id.toString();
    if (!isAdmin && !isOrganizer) throw new ApiError(403, "Only organizers and admins can disqualify teams");

    const team = await findTeamById(teamId, "eventId status");
    if (team.eventId.toString() !== event._id.toString()) throw new ApiError(404, "Team not found in this competition");
    if (team.status === "disqualified") throw new ApiError(400, "Team is already disqualified");

    return await EventTeam.findByIdAndUpdate(
        teamId,
        { $set: { status: "disqualified", disqualifiedAt: new Date(), disqualifiedBy: requestUser._id, disqualifiedReason: reason?.trim() || "" } },
        { new: true }
    );
};

export const transferLeadership = async (eventId, teamId, data, requestUser) => {
    const { newLeaderId } = data;
    if (!newLeaderId || !mongoose.isValidObjectId(newLeaderId)) throw new ApiError(400, "Valid newLeaderId is required");

    const event = await findCompetitionById(eventId);
    const team = await findTeamById(teamId, "eventId leader members status");

    if (team.eventId.toString() !== event._id.toString()) throw new ApiError(404, "Team not found in this competition");
    if (team.leader.toString() !== requestUser._id.toString()) throw new ApiError(403, "Only the current team leader can transfer leadership");

    if (["submission_locked", "judging", "completed"].includes(event.status)) {
        throw new ApiError(400, "Leadership cannot be transferred after submission deadline");
    }

    const newLeaderMember = team.members.find((m) => m.userId.toString() === newLeaderId);
    if (!newLeaderMember) throw new ApiError(404, "Target user is not a member of this team");

    for (const m of team.members) {
        if (m.userId.toString() === newLeaderId) m.role = "leader";
        else if (m.userId.toString() === requestUser._id.toString()) m.role = "member";
    }
    team.leader = new mongoose.Types.ObjectId(newLeaderId);
    await team.save();

    return await EventTeam.findById(teamId)
        .populate("leader", "profile.displayName profile.avatar")
        .populate("members.userId", "profile.displayName profile.avatar");
};
