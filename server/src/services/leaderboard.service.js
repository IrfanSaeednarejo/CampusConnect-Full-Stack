import mongoose from "mongoose";
import { PointsTransaction } from "../models/pointsTransaction.model.js";
import { LeaderboardSnapshot } from "../models/leaderboardSnapshot.model.js";
import { UserGamification } from "../models/userGamification.model.js";

const normalizeLeaderboardRows = (rows = []) =>
    rows.map((row, index) => ({
        userId: row.userId?._id || row.userId,
        campusId: row.campusId || row.userId?.campusId || null,
        points: row.points ?? row.totalPoints ?? 0,
        rank: index + 1,
        profile: {
            displayName: row.userId?.profile?.displayName || row.profile?.displayName || "Student",
            avatar: row.userId?.profile?.avatar || row.profile?.avatar || "",
        },
        meta: row.meta || {},
    }));

export const getGlobalLeaderboard = async (limit = 20) => {
    const rows = await UserGamification.find({})
        .sort({ totalPoints: -1, updatedAt: 1 })
        .limit(limit)
        .populate("userId", "profile.displayName profile.avatar campusId")
        .lean();

    return normalizeLeaderboardRows(rows.map((row) => ({ ...row, points: row.totalPoints })));
};

export const getCampusLeaderboard = async (campusId, limit = 20) => {
    const rows = await UserGamification.find({ campusId })
        .sort({ totalPoints: -1, updatedAt: 1 })
        .limit(limit)
        .populate("userId", "profile.displayName profile.avatar campusId")
        .lean();

    return normalizeLeaderboardRows(rows.map((row) => ({ ...row, points: row.totalPoints })));
};

export const getModuleLeaderboard = async (module, limit = 20) => {
    const rows = await PointsTransaction.aggregate([
        {
            $match: {
                module,
                status: "awarded",
            },
        },
        {
            $group: {
                _id: "$userId",
                points: {
                    $sum: {
                        $cond: [{ $eq: ["$direction", "debit"] }, { $multiply: ["$points", -1] }, "$points"],
                    },
                },
                campusId: { $first: "$campusId" },
            },
        },
        { $sort: { points: -1, _id: 1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userId",
            },
        },
        { $unwind: "$userId" },
        {
            $project: {
                _id: 0,
                userId: {
                    _id: "$userId._id",
                    profile: "$userId.profile",
                    campusId: "$userId.campusId",
                },
                campusId: 1,
                points: 1,
                meta: { module },
            },
        },
    ]);

    return normalizeLeaderboardRows(rows);
};

export const rebuildLeaderboard = async (scopeType, scopeId = "all", period = "all_time") => {
    let rankings = [];

    if (scopeType === "global") rankings = await getGlobalLeaderboard(100);
    if (scopeType === "campus") rankings = await getCampusLeaderboard(scopeId, 100);
    if (scopeType === "module") rankings = await getModuleLeaderboard(scopeId, 100);

    const now = new Date();
    const snapshot = await LeaderboardSnapshot.findOneAndUpdate(
        { scopeType, scopeId: String(scopeId || "all"), period },
        {
            $set: {
                rankings,
                generatedAt: now,
                endAt: now,
                startAt: period === "all_time" ? null : now,
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return snapshot;
};

export const getMyRank = async (userId, scope = {}) => {
    if (scope.scopeType === "module") {
        const target = await PointsTransaction.aggregate([
            {
                $match: {
                    module: scope.scopeId,
                    userId: new mongoose.Types.ObjectId(userId),
                    status: "awarded",
                },
            },
            {
                $group: {
                    _id: "$userId",
                    points: {
                        $sum: {
                            $cond: [{ $eq: ["$direction", "debit"] }, { $multiply: ["$points", -1] }, "$points"],
                        },
                    },
                },
            },
        ]);

        const myPoints = target[0]?.points || 0;
        const higher = await PointsTransaction.aggregate([
            {
                $match: {
                    module: scope.scopeId,
                    status: "awarded",
                },
            },
            {
                $group: {
                    _id: "$userId",
                    points: {
                        $sum: {
                            $cond: [{ $eq: ["$direction", "debit"] }, { $multiply: ["$points", -1] }, "$points"],
                        },
                    },
                },
            },
            { $match: { points: { $gt: myPoints } } },
            { $count: "count" },
        ]);

        return { rank: (higher[0]?.count || 0) + 1, points: myPoints };
    }

    const filter = {};
    if (scope.scopeType === "campus" && scope.scopeId) filter.campusId = scope.scopeId;
    const mine = await UserGamification.findOne({ userId }).select("totalPoints");
    const myPoints = mine?.totalPoints || 0;
    const higherCount = await UserGamification.countDocuments({
        ...filter,
        totalPoints: { $gt: myPoints },
    });

    return { rank: higherCount + 1, points: myPoints };
};
