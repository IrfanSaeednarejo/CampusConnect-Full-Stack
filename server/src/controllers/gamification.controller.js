import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Badge } from "../models/badge.model.js";
import { Certificate } from "../models/certificate.model.js";
import { GamificationRule } from "../models/gamificationRule.model.js";
import { PointsTransaction } from "../models/pointsTransaction.model.js";
import { Streak } from "../models/streak.model.js";
import { UserBadge } from "../models/userBadge.model.js";
import { UserGamification } from "../models/userGamification.model.js";
import {
    adjustPointsManually,
    awardBadgeManually,
    calculateLevel,
    getOrCreateUserGamification,
} from "../services/gamification.service.js";
import { issueCertificate, getUserCertificates, verifyCertificate } from "../services/certificate.service.js";
import { getCampusLeaderboard, getGlobalLeaderboard, getModuleLeaderboard, getMyRank, rebuildLeaderboard } from "../services/leaderboard.service.js";
import { getEffectiveCampusId } from "../middlewares/adminAuth.middleware.js";
import { writeAuditLog } from "../utils/auditLog.js";
import { ADMIN_ACTIONS } from "../models/adminAuditLog.model.js";

const ensureObjectId = (value, label) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new ApiError(400, `Invalid ${label}`);
    }
};

const getMySummary = asyncHandler(async (req, res) => {
    const summary = await getOrCreateUserGamification(req.user._id);
    const levelMeta = calculateLevel(summary.totalPoints);
    const latestBadges = await UserBadge.find({ userId: req.user._id })
        .sort({ awardedAt: -1 })
        .limit(6)
        .populate("badgeId")
        .lean();

    return res.status(200).json(
        new ApiResponse(200, {
            summary,
            levelMeta,
            latestBadges,
        }, "Gamification summary fetched")
    );
});

const getMyTransactions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const docs = await PointsTransaction.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();
    const total = await PointsTransaction.countDocuments({ userId: req.user._id });

    return res.status(200).json(new ApiResponse(200, {
        docs,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit || 20)),
        },
    }, "Transactions fetched"));
});

const getMyBadges = asyncHandler(async (req, res) => {
    const badges = await UserBadge.find({ userId: req.user._id })
        .sort({ awardedAt: -1 })
        .populate("badgeId")
        .lean();
    return res.status(200).json(new ApiResponse(200, badges, "Badges fetched"));
});

const getMyStreaks = asyncHandler(async (req, res) => {
    const streaks = await Streak.find({ userId: req.user._id }).sort({ updatedAt: -1 }).lean();
    return res.status(200).json(new ApiResponse(200, streaks, "Streaks fetched"));
});

const getMyCertificates = asyncHandler(async (req, res) => {
    const certificates = await getUserCertificates(req.user._id);
    return res.status(200).json(new ApiResponse(200, certificates, "Certificates fetched"));
});

const getMyProgress = asyncHandler(async (req, res) => {
    const summary = await getOrCreateUserGamification(req.user._id);
    const levelMeta = calculateLevel(summary.totalPoints);
    const rank = await getMyRank(req.user._id, { scopeType: "global", scopeId: "all" });

    return res.status(200).json(new ApiResponse(200, {
        summary,
        levelMeta,
        rank,
    }, "Progress fetched"));
});

const getGlobalLeaderboardController = asyncHandler(async (_req, res) => {
    const leaderboard = await getGlobalLeaderboard();
    return res.status(200).json(new ApiResponse(200, leaderboard, "Global leaderboard fetched"));
});

const getCampusLeaderboardController = asyncHandler(async (req, res) => {
    const leaderboard = await getCampusLeaderboard(req.params.campusId);
    return res.status(200).json(new ApiResponse(200, leaderboard, "Campus leaderboard fetched"));
});

const getModuleLeaderboardController = asyncHandler(async (req, res) => {
    const leaderboard = await getModuleLeaderboard(req.params.module);
    return res.status(200).json(new ApiResponse(200, leaderboard, "Module leaderboard fetched"));
});

const listBadges = asyncHandler(async (_req, res) => {
    const badges = await Badge.find({ isActive: true }).sort({ category: 1, createdAt: 1 }).lean();
    return res.status(200).json(new ApiResponse(200, badges, "Badge catalog fetched"));
});

const getBadgeById = asyncHandler(async (req, res) => {
    ensureObjectId(req.params.badgeId, "badge ID");
    const badge = await Badge.findById(req.params.badgeId).lean();
    if (!badge) throw new ApiError(404, "Badge not found");
    return res.status(200).json(new ApiResponse(200, badge, "Badge fetched"));
});

const getUserBadges = asyncHandler(async (req, res) => {
    ensureObjectId(req.params.userId, "user ID");
    const badges = await UserBadge.find({ userId: req.params.userId })
        .sort({ awardedAt: -1 })
        .populate("badgeId")
        .lean();
    return res.status(200).json(new ApiResponse(200, badges, "User badges fetched"));
});

const getCertificateById = asyncHandler(async (req, res) => {
    ensureObjectId(req.params.certificateId, "certificate ID");
    const certificate = await Certificate.findById(req.params.certificateId).lean();
    if (!certificate) throw new ApiError(404, "Certificate not found");
    return res.status(200).json(new ApiResponse(200, certificate, "Certificate fetched"));
});

const verifyCertificateController = asyncHandler(async (req, res) => {
    const result = await verifyCertificate(req.params.code);
    if (!result) throw new ApiError(404, "Certificate not found");
    return res.status(200).json(new ApiResponse(200, result, "Certificate verified"));
});

const listRules = asyncHandler(async (_req, res) => {
    const rules = await GamificationRule.find({}).sort({ module: 1, priority: -1, actionKey: 1 }).lean();
    return res.status(200).json(new ApiResponse(200, rules, "Rules fetched"));
});

const createRule = asyncHandler(async (req, res) => {
    const rule = await GamificationRule.create({
        ...req.body,
        createdBy: req.user._id,
        updatedBy: req.user._id,
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.GAMIFICATION_RULE_CREATED,
        targetModel: "GamificationRule",
        targetId: rule._id,
        payload: { after: rule.toObject() },
    });

    return res.status(201).json(new ApiResponse(201, rule, "Rule created"));
});

const updateRule = asyncHandler(async (req, res) => {
    ensureObjectId(req.params.ruleId, "rule ID");
    const before = await GamificationRule.findById(req.params.ruleId);
    if (!before) throw new ApiError(404, "Rule not found");

    const updated = await GamificationRule.findByIdAndUpdate(
        req.params.ruleId,
        { $set: { ...req.body, updatedBy: req.user._id } },
        { new: true, runValidators: true }
    );

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.GAMIFICATION_RULE_UPDATED,
        targetModel: "GamificationRule",
        targetId: updated._id,
        payload: { before: before.toObject(), after: updated.toObject() },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Rule updated"));
});

const adjustPoints = asyncHandler(async (req, res) => {
    const { userId, points, reason } = req.body;
    ensureObjectId(userId, "user ID");
    const result = await adjustPointsManually({ userId, points, reason, adminUser: req.user });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.GAMIFICATION_POINTS_ADJUSTED,
        targetModel: "User",
        targetId: userId,
        payload: {
            points,
            reason,
            transactionId: result.transaction._id,
        },
    });

    return res.status(200).json(new ApiResponse(200, result, "Points adjusted"));
});

const awardBadge = asyncHandler(async (req, res) => {
    const { userId, badgeId, reason } = req.body;
    ensureObjectId(userId, "user ID");
    ensureObjectId(badgeId, "badge ID");
    const result = await awardBadgeManually({ userId, badgeId, adminUser: req.user, reason });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.GAMIFICATION_BADGE_AWARDED,
        targetModel: "Badge",
        targetId: badgeId,
        payload: {
            userId,
            reason,
        },
    });

    return res.status(200).json(new ApiResponse(200, result, "Badge awarded"));
});

const issueCertificateController = asyncHandler(async (req, res) => {
    const { userId, sourceModel, sourceId, type, title, meta } = req.body;
    ensureObjectId(userId, "user ID");
    const certificate = await issueCertificate({
        userId,
        sourceModel,
        sourceId,
        type,
        title,
        issuedBy: req.user._id,
        meta,
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.GAMIFICATION_CERTIFICATE_ISSUED,
        targetModel: "Certificate",
        targetId: certificate._id,
        payload: { userId, sourceModel, sourceId, type, title },
    });

    return res.status(201).json(new ApiResponse(201, certificate, "Certificate issued"));
});

const rebuildLeaderboardController = asyncHandler(async (req, res) => {
    const { scopeType, scopeId, period } = req.body;
    const snapshot = await rebuildLeaderboard(scopeType, scopeId, period);
    const io = req.app.get("io");
    if (io) {
        io.emit("gamification:leaderboard-updated", {
            scopeType,
            scopeId: scopeId || "all",
            period: period || "all_time",
            generatedAt: snapshot.generatedAt,
        });
    }

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.GAMIFICATION_LEADERBOARD_REBUILT,
        targetModel: "LeaderboardSnapshot",
        targetId: snapshot._id,
        payload: { scopeType, scopeId, period },
    });

    return res.status(200).json(new ApiResponse(200, snapshot, "Leaderboard rebuilt"));
});

const getGamificationAudit = asyncHandler(async (_req, res) => {
    const docs = await PointsTransaction.find({ "meta.manual": true }).sort({ createdAt: -1 }).limit(100).lean();
    return res.status(200).json(new ApiResponse(200, docs, "Gamification audit fetched"));
});

const getAnalyticsOverview = asyncHandler(async (req, res) => {
    const campusId = getEffectiveCampusId(req);
    const filter = campusId ? { campusId } : {};

    const [summary, transactionsTodayAgg, badgesCount, certificatesCount] = await Promise.all([
        UserGamification.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalPointsAwarded: { $sum: "$totalPoints" },
                    activeUsers: { $sum: 1 },
                },
            },
        ]),
        PointsTransaction.aggregate([
            { $match: { ...filter, status: "awarded" } },
            {
                $group: {
                    _id: null,
                    totalTransactions: { $sum: 1 },
                },
            },
        ]),
        UserBadge.countDocuments({}),
        Certificate.countDocuments({ status: "issued" }),
    ]);

    return res.status(200).json(new ApiResponse(200, {
        totalPointsAwarded: summary[0]?.totalPointsAwarded || 0,
        activeUsers: summary[0]?.activeUsers || 0,
        totalTransactions: transactionsTodayAgg[0]?.totalTransactions || 0,
        badgesUnlocked: badgesCount,
        certificatesIssued: certificatesCount,
    }, "Gamification analytics overview fetched"));
});

const getAnalyticsLeaderboards = asyncHandler(async (_req, res) => {
    const [global, competition, mentor] = await Promise.all([
        getGlobalLeaderboard(10),
        getModuleLeaderboard("competition", 10),
        getModuleLeaderboard("mentor", 10),
    ]);
    return res.status(200).json(new ApiResponse(200, { global, competition, mentor }, "Leaderboard analytics fetched"));
});

const getAnalyticsBadges = asyncHandler(async (_req, res) => {
    const stats = await UserBadge.aggregate([
        {
            $lookup: {
                from: "badges",
                localField: "badgeId",
                foreignField: "_id",
                as: "badge",
            },
        },
        { $unwind: "$badge" },
        {
            $group: {
                _id: "$badge.name",
                count: { $sum: 1 },
                category: { $first: "$badge.category" },
            },
        },
        { $sort: { count: -1, _id: 1 } },
    ]);

    return res.status(200).json(new ApiResponse(200, stats, "Badge analytics fetched"));
});

const getAnalyticsCertificates = asyncHandler(async (_req, res) => {
    const stats = await Certificate.aggregate([
        { $match: { status: "issued" } },
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1, _id: 1 } },
    ]);

    return res.status(200).json(new ApiResponse(200, stats, "Certificate analytics fetched"));
});

const getAnalyticsAnomalies = asyncHandler(async (_req, res) => {
    const anomalies = await PointsTransaction.aggregate([
        { $match: { status: "awarded" } },
        {
            $group: {
                _id: {
                    userId: "$userId",
                    day: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                },
                totalPoints: { $sum: "$points" },
                transactionCount: { $sum: 1 },
            },
        },
        {
            $match: {
                $or: [
                    { totalPoints: { $gte: 150 } },
                    { transactionCount: { $gte: 20 } },
                ],
            },
        },
        { $sort: { totalPoints: -1, transactionCount: -1 } },
        { $limit: 50 },
    ]);

    return res.status(200).json(new ApiResponse(200, anomalies, "Anomalies fetched"));
});

export {
    getMySummary,
    getMyTransactions,
    getMyBadges,
    getMyStreaks,
    getMyCertificates,
    getMyProgress,
    getGlobalLeaderboardController,
    getCampusLeaderboardController,
    getModuleLeaderboardController,
    listBadges,
    getBadgeById,
    getUserBadges,
    getCertificateById,
    verifyCertificateController,
    listRules,
    createRule,
    updateRule,
    adjustPoints,
    awardBadge,
    issueCertificateController,
    rebuildLeaderboardController,
    getGamificationAudit,
    getAnalyticsOverview,
    getAnalyticsLeaderboards,
    getAnalyticsBadges,
    getAnalyticsCertificates,
    getAnalyticsAnomalies,
};
