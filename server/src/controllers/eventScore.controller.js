import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import { EventSubmission } from "../models/eventSubmission.model.js";
import { EventScore } from "../models/eventScore.model.js";
import { EventTeam } from "../models/eventTeam.model.js";
import { paginate } from "../utils/paginate.js";
import { emitLeaderboardUpdate } from "../sockets/event.socket.js";
const findCompetitionById = async (eventId) => {
    if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event ID");
    const event = await Event.findOne({ _id: eventId, isOnlineCompetition: true });
    if (!event) throw new ApiError(404, "Competition not found");
    return event;
};

const findSubmissionById = async (subId, eventId) => {
    if (!mongoose.isValidObjectId(subId)) throw new ApiError(400, "Invalid submission ID");
    const sub = await EventSubmission.findOne({ _id: subId, eventId });
    if (!sub) throw new ApiError(404, "Submission not found in this competition");
    return sub;
};

const requireJudgeAccess = (event, user) => {
    const isAdmin = user.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === user._id.toString();
    const isJudge = event.judgingConfig?.judges?.some(
        (j) => j.toString() === user._id.toString()
    );
    if (!isAdmin && !isOrganizer && !isJudge) {
        throw new ApiError(403, "Only judges, organizers, or admins can access judging actions");
    }
};

const preventSelfJudging = async (submission, judgeId) => {
    if (!submission.teamId) return;
    const inTeam = await EventTeam.exists({
        _id: submission.teamId,
        "members.userId": judgeId,
    });
    if (inTeam) {
        throw new ApiError(403, "Judges cannot score their own team's submission");
    }
};

/**
 * POST /api/v1/competitions/:eventId/submissions/:subId/score
 */
const scoreSubmission = asyncHandler(async (req, res) => {
    const { eventId, subId } = req.params;
    const { criteria, feedback } = req.body;

    if (!Array.isArray(criteria) || criteria.length === 0) {
        throw new ApiError(400, "criteria array is required and must not be empty");
    }

    const event = await findCompetitionById(eventId);

    if (event.status !== "judging") {
        throw new ApiError(
            400,
            `Scoring is only allowed during the "judging" phase. Current status: "${event.status}"`
        );
    }

    requireJudgeAccess(event, req.user);

    const submission = await findSubmissionById(subId, event._id);

    if (submission.status === "draft") {
        throw new ApiError(400, "Cannot score a draft submission that was never formally submitted");
    }

    await preventSelfJudging(submission, req.user._id);
    const configuredCriteria = event.judgingConfig?.criteria || [];
    if (configuredCriteria.length > 0) {
        for (const c of criteria) {
            if (!c.name) throw new ApiError(400, "Each criterion must have a name");
            const config = configuredCriteria.find(
                (cc) => cc._id.toString() === c.criterionId || cc.name === c.name
            );
            if (!config) {
                throw new ApiError(400, `Unknown criterion: "${c.name}"`);
            }
            if (c.score < 0 || c.score > config.maxScore) {
                throw new ApiError(
                    400,
                    `Score for "${c.name}" must be between 0 and ${config.maxScore}`
                );
            }
        }
    }
    const normalizedCriteria = criteria.map((c) => {
        const config = configuredCriteria.find(
            (cc) => cc._id.toString() === c.criterionId || cc.name === c.name
        );
        return {
            criterionId: config?._id || c.criterionId,
            name: c.name,
            score: parseFloat(c.score),
            maxScore: parseFloat(c.maxScore || config?.maxScore || 100),
            weight: parseFloat(c.weight ?? config?.weight ?? 1),
            comment: c.comment?.trim() || "",
        };
    });
    const scoreDoc = await EventScore.findOneAndUpdate(
        { submissionId: submission._id, judgeId: req.user._id },
        {
            $set: {
                eventId: event._id,
                criteria: normalizedCriteria,
                feedback: feedback?.trim() || "",
                scoredAt: new Date(),
                isPublished: false,
            },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    if (submission.status === "submitted") {
        await EventSubmission.findByIdAndUpdate(submission._id, { $set: { status: "reviewed" } });
    }

    return res.status(200).json(new ApiResponse(200, scoreDoc, "Score submitted successfully"));
});

/**
 * GET /api/v1/competitions/:eventId/submissions/:subId/scores
 */
const getSubmissionScores = asyncHandler(async (req, res) => {
    const { eventId, subId } = req.params;

    const event = await findCompetitionById(eventId);
    requireJudgeAccess(event, req.user);

    const submission = await findSubmissionById(subId, event._id);

    const isAdmin = req.user.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === req.user._id.toString();

    let filter = { submissionId: submission._id };
    if (!isAdmin && !isOrganizer && event.judgingConfig?.isAnonymous) {
        filter.judgeId = req.user._id;
    }

    const scores = await EventScore.find(filter)
        .populate(!event.judgingConfig?.isAnonymous ? { path: "judgeId", select: "profile.displayName profile.avatar" } : null)
        .sort({ scoredAt: -1 });
    const totalJudges = scores.length;
    const average = totalJudges > 0
        ? Math.round((scores.reduce((sum, s) => sum + s.totalScore, 0) / totalJudges) * 100) / 100
        : null;

    return res.status(200).json(
        new ApiResponse(200, {
            submission: {
                _id: submission._id,
                title: submission.title,
                status: submission.status,
            },
            summary: { totalJudges, averageScore: average },
            scores,
        }, "Submission scores fetched")
    );
});

/**
 * DELETE /api/v1/competitions/:eventId/submissions/:subId/scores/my
 */
const retractScore = asyncHandler(async (req, res) => {
    const { eventId, subId } = req.params;

    const event = await findCompetitionById(eventId);

    if (event.status !== "judging") {
        throw new ApiError(400, "Scores can only be retracted during the judging phase");
    }

    requireJudgeAccess(event, req.user);

    const submission = await findSubmissionById(subId, event._id);

    const score = await EventScore.findOne({
        submissionId: submission._id,
        judgeId: req.user._id,
    });

    if (!score) throw new ApiError(404, "You have not scored this submission");

    if (score.isPublished) {
        throw new ApiError(400, "Cannot retract a score that has already been published");
    }

    await EventScore.findByIdAndDelete(score._id);

    return res.status(200).json(new ApiResponse(200, null, "Score retracted successfully"));
});

/**
 * GET /api/v1/competitions/:eventId/judging/progress
 */
const getJudgingProgress = asyncHandler(async (req, res) => {
    const event = await findCompetitionById(req.params.eventId);

    const isAdmin = req.user.roles?.includes("admin");
    const isOrganizer = event.createdBy.toString() === req.user._id.toString();
    if (!isAdmin && !isOrganizer) {
        throw new ApiError(403, "Only organizers and admins can view judging progress");
    }

    const totalJudges = event.judgingConfig?.judges?.length || 0;
    const submissions = await EventSubmission.find({
        eventId: event._id,
        status: { $in: ["submitted", "reviewed"] },
    }).select("_id title teamId userId status");
    const scoreCounts = await EventScore.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(event._id) } },
        { $group: { _id: "$submissionId", judgedBy: { $sum: 1 } } },
    ]);

    const scoreMap = Object.fromEntries(
        scoreCounts.map((s) => [s._id.toString(), s.judgedBy])
    );

    const progress = submissions.map((sub) => ({
        submissionId: sub._id,
        title: sub.title,
        status: sub.status,
        judgedBy: scoreMap[sub._id.toString()] || 0,
        remaining: Math.max(0, totalJudges - (scoreMap[sub._id.toString()] || 0)),
        isFullyJudged: (scoreMap[sub._id.toString()] || 0) >= totalJudges,
    }));

    const fullyJudged = progress.filter((p) => p.isFullyJudged).length;

    return res.status(200).json(
        new ApiResponse(200, {
            totalSubmissions: submissions.length,
            totalJudges,
            fullyJudged,
            progress,
        }, "Judging progress fetched")
    );
});

/**
 * GET /api/v1/competitions/:eventId/judging/my-queue
 */
const getMyJudgingQueue = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const event = await findCompetitionById(req.params.eventId);
    requireJudgeAccess(event, req.user);

    if (event.status !== "judging") {
        throw new ApiError(400, "Judging has not started yet");
    }
    const alreadyScored = await EventScore.find({
        eventId: event._id,
        judgeId: req.user._id,
    }).select("submissionId");

    const scoredIds = alreadyScored.map((s) => s.submissionId);
    const filter = {
        eventId: event._id,
        status: { $in: ["submitted", "reviewed"] },
        _id: { $nin: scoredIds },
    };
    const myTeam = await EventTeam.findUserTeam(event._id, req.user._id);
    if (myTeam) {
        filter.teamId = { $ne: myTeam._id };
    }

    const result = await paginate(EventSubmission, filter, {
        page, limit,
        sort: { submittedAt: 1 },
        select: "-reviewNote",
        populate: [
            { path: "teamId", select: "teamName memberCount" },
            { path: "userId", select: "profile.displayName" },
            { path: "files.fileId", select: "fileName fileUrl mimeType" },
        ],
    });

    return res.status(200).json(new ApiResponse(200, result, "Judging queue fetched"));
});
export {
    scoreSubmission,
    getSubmissionScores,
    retractScore,
    getJudgingProgress,
    getMyJudgingQueue,
};