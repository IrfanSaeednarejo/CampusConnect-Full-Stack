import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as eventScoreService from "../services/eventScore.service.js";

const scoreSubmission = asyncHandler(async (req, res) => {
    const scoreDoc = await eventScoreService.scoreSubmission(req.params.eventId, req.params.subId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, scoreDoc, "Score submitted successfully"));
});

const getSubmissionScores = asyncHandler(async (req, res) => {
    const result = await eventScoreService.getSubmissionScores(req.params.eventId, req.params.subId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Submission scores fetched"));
});

const retractScore = asyncHandler(async (req, res) => {
    await eventScoreService.retractScore(req.params.eventId, req.params.subId, req.user);
    return res.status(200).json(new ApiResponse(200, null, "Score retracted successfully"));
});

const getJudgingProgress = asyncHandler(async (req, res) => {
    const result = await eventScoreService.getJudgingProgress(req.params.eventId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Judging progress fetched"));
});

const getMyJudgingQueue = asyncHandler(async (req, res) => {
    const result = await eventScoreService.getMyJudgingQueue(req.params.eventId, req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Judging queue fetched"));
});

export {
    scoreSubmission,
    getSubmissionScores,
    retractScore,
    getJudgingProgress,
    getMyJudgingQueue,
};