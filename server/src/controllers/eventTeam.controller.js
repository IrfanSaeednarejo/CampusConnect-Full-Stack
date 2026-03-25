import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as eventTeamService from "../services/eventTeam.service.js";

const getTeams = asyncHandler(async (req, res) => {
    const result = await eventTeamService.getTeams(req.params.eventId, req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Teams fetched successfully"));
});

const getTeamById = asyncHandler(async (req, res) => {
    const team = await eventTeamService.getTeamById(req.params.eventId, req.params.teamId);
    return res.status(200).json(new ApiResponse(200, team, "Team fetched successfully"));
});

const createTeam = asyncHandler(async (req, res) => {
    const io = req.app.get("io");
    const populated = await eventTeamService.createTeam(req.params.eventId, req.body, io, req.user);
    return res.status(201).json(new ApiResponse(201, populated, "Team created successfully"));
});

const updateTeam = asyncHandler(async (req, res) => {
    const updated = await eventTeamService.updateTeam(req.params.eventId, req.params.teamId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Team updated successfully"));
});

const deleteTeam = asyncHandler(async (req, res) => {
    await eventTeamService.deleteTeam(req.params.eventId, req.params.teamId, req.user);
    return res.status(200).json(new ApiResponse(200, { teamId: req.params.teamId }, "Team disbanded successfully"));
});

const joinTeam = asyncHandler(async (req, res) => {
    const io = req.app.get("io");
    const updated = await eventTeamService.joinTeam(req.params.eventId, req.params.teamId, req.body, io, req.user);
    return res.status(201).json(new ApiResponse(201, updated, "Joined team successfully"));
});

const leaveTeam = asyncHandler(async (req, res) => {
    await eventTeamService.leaveTeam(req.params.eventId, req.params.teamId, req.user);
    return res.status(200).json(new ApiResponse(200, null, "You have left the team"));
});

const kickMember = asyncHandler(async (req, res) => {
    const removedUserId = await eventTeamService.kickMember(req.params.eventId, req.params.teamId, req.params.userId, req.user);
    return res.status(200).json(new ApiResponse(200, { removedUserId }, "Member removed from team"));
});

const disqualifyTeam = asyncHandler(async (req, res) => {
    const updated = await eventTeamService.disqualifyTeam(req.params.eventId, req.params.teamId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Team disqualified"));
});

const transferLeadership = asyncHandler(async (req, res) => {
    const updated = await eventTeamService.transferLeadership(req.params.eventId, req.params.teamId, req.body, req.user);
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