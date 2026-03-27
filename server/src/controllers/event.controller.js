import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as eventService from "../services/event.service.js";

const createCompetition = asyncHandler(async (req, res) => {
    const event = await eventService.createCompetition(req.body, req.file, req.user);
    return res.status(201).json(new ApiResponse(201, event, "Competition created successfully"));
});

const getCompetitions = asyncHandler(async (req, res) => {
    const result = await eventService.getCompetitions(req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Competitions fetched successfully"));
});

const getCompetitionById = asyncHandler(async (req, res) => {
    const result = await eventService.getCompetitionById(req.params.eventId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Competition fetched successfully"));
});

const updateCompetition = asyncHandler(async (req, res) => {
    const updated = await eventService.updateCompetition(req.params.eventId, req.body, req.file, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Competition updated successfully"));
});

const deleteCompetition = asyncHandler(async (req, res) => {
    const result = await eventService.deleteCompetition(req.params.eventId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Competition and all related data deleted"));
});

const transitionState = asyncHandler(async (req, res) => {
    const io = req.app.get("io");
    const result = await eventService.transitionState(req.params.eventId, req.body, io, req.user);
    return res.status(200).json(new ApiResponse(200, result, `Competition transitioned to "${req.body.status}"`));
});

const postAnnouncement = asyncHandler(async (req, res) => {
    const io = req.app.get("io");
    const result = await eventService.postAnnouncement(req.params.eventId, req.body, io, req.user);
    return res.status(201).json(new ApiResponse(201, result, "Announcement posted"));
});

const getAnnouncements = asyncHandler(async (req, res) => {
    const result = await eventService.getAnnouncements(req.params.eventId, req.query);
    return res.status(200).json(new ApiResponse(200, result, "Announcements fetched"));
});

const getLeaderboard = asyncHandler(async (req, res) => {
    const result = await eventService.getLeaderboard(req.params.eventId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Leaderboard fetched successfully"));
});

const publishLeaderboard = asyncHandler(async (req, res) => {
    const io = req.app.get("io");
    const result = await eventService.publishLeaderboard(req.params.eventId, io, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Leaderboard published successfully"));
});

const updateJudges = asyncHandler(async (req, res) => {
    const judges = await eventService.updateJudges(req.params.eventId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, judges, `Judges ${req.body.action === "add" ? "added" : "removed"} successfully`));
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