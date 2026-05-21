import crypto from "crypto";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Badge } from "../models/badge.model.js";
import { Certificate } from "../models/certificate.model.js";
import { GamificationRule } from "../models/gamificationRule.model.js";
import { PointsTransaction } from "../models/pointsTransaction.model.js";
import { Streak } from "../models/streak.model.js";
import { UserBadge } from "../models/userBadge.model.js";
import { UserGamification } from "../models/userGamification.model.js";
import { emitToUser } from "../sockets/index.js";
import { systemEvents } from "../utils/events.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_STREAK_TYPE = "daily_activity";

const getDayBounds = (anchor = new Date()) => {
    const start = new Date(anchor);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
};

const getDateDiffInDays = (a, b) => {
    const left = new Date(a);
    const right = new Date(b);
    left.setHours(0, 0, 0, 0);
    right.setHours(0, 0, 0, 0);
    return Math.round((left - right) / DAY_MS);
};

const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (value instanceof mongoose.Types.ObjectId) return value.toString();
    if (value._id) return value._id.toString();
    return String(value);
};

const shouldQualifyForDefaultStreak = (rule) => {
    if (!rule) return false;
    if (Array.isArray(rule.streakHooks) && rule.streakHooks.length > 0) return true;
    return [
        "task.completed",
        "note.created",
        "study_group.resource_uploaded",
        "mentor.session_completed",
        "competition.submission_submitted",
    ].includes(rule.actionKey);
};

const buildNotificationBody = ({ actionKey, points, reason }) => {
    if (reason?.trim()) return reason.trim();
    return `You earned ${points} points for ${actionKey.replaceAll(".", " ")}.`;
};

export const calculateLevel = (totalPoints = 0) => {
    const safePoints = Math.max(0, Number(totalPoints) || 0);
    const level = Math.floor(safePoints / 100) + 1;
    const currentLevelBase = (level - 1) * 100;
    const nextLevelAt = level * 100;

    return {
        level,
        xpInLevel: safePoints - currentLevelBase,
        levelStartPoints: currentLevelBase,
        nextLevelAt,
        progressPercent: Math.min(
            100,
            Math.round(((safePoints - currentLevelBase) / Math.max(1, nextLevelAt - currentLevelBase)) * 100)
        ),
    };
};

export const getOrCreateUserGamification = async (userId) => {
    const user = await User.findById(userId).select("campusId");
    return await UserGamification.findOneAndUpdate(
        { userId },
        {
            $setOnInsert: {
                userId,
                campusId: user?.campusId || null,
                totalPoints: 0,
                availablePoints: 0,
                level: 1,
                xpInLevel: 0,
                currentStreak: 0,
                longestStreak: 0,
                badgesCount: 0,
                certificatesCount: 0,
                seasonPoints: 0,
            },
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );
};

export const generateDedupKey = (actionKey, actorId, refModel, refId, dedupStrategy = "action_ref") => {
    if (dedupStrategy === "one_time") {
        const raw = [actionKey, normalizeId(actorId), "one_time"].join(":");
        return crypto.createHash("sha256").update(raw).digest("hex");
    }

    const raw = [actionKey, normalizeId(actorId), refModel || "none", normalizeId(refId) || "none"].join(":");
    return crypto.createHash("sha256").update(raw).digest("hex");
};

export const enforceDailyCap = async (userId, actionKey, points) => {
    const rule = await GamificationRule.findOne({ actionKey, isActive: true }).select("dailyCap");
    if (!rule?.dailyCap || points <= 0) {
        return { allowed: true, rule };
    }

    const { start, end } = getDayBounds();
    const currentCount = await PointsTransaction.countDocuments({
        userId,
        actionKey,
        direction: "credit",
        status: "awarded",
        createdAt: { $gte: start, $lt: end },
    });

    return {
        allowed: currentCount < rule.dailyCap,
        currentCount,
        cap: rule.dailyCap,
        rule,
    };
};

export const createPointsTransaction = async ({
    userId,
    campusId,
    actionKey,
    module,
    points,
    direction = "credit",
    refModel,
    refId,
    dedupKey,
    awardedBy = null,
    ruleId = null,
    status = "awarded",
    reason = "",
    meta = {},
}) => {
    return await PointsTransaction.create({
        userId,
        campusId: campusId || null,
        actionKey,
        module,
        points,
        direction,
        refModel,
        refId,
        dedupKey,
        awardedBy,
        ruleId,
        status,
        reason,
        meta,
    });
};

export const updateUserGamificationSummary = async (userId) => {
    const totals = await PointsTransaction.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                status: "awarded",
            },
        },
        {
            $group: {
                _id: "$userId",
                totalPoints: {
                    $sum: {
                        $cond: [{ $eq: ["$direction", "debit"] }, { $multiply: ["$points", -1] }, "$points"],
                    },
                },
                availablePoints: {
                    $sum: {
                        $cond: [{ $eq: ["$direction", "debit"] }, { $multiply: ["$points", -1] }, "$points"],
                    },
                },
                seasonPoints: {
                    $sum: {
                        $cond: [{ $eq: ["$direction", "debit"] }, 0, "$points"],
                    },
                },
                lastEarnedAt: {
                    $max: "$createdAt",
                },
            },
        },
    ]);

    const badgesCount = await UserBadge.countDocuments({ userId });
    const certificatesCount = await Certificate.countDocuments({ userId, status: "issued" });
    const streak = await Streak.findOne({ userId, streakType: DEFAULT_STREAK_TYPE }).select("currentCount longestCount");
    const summary = await getOrCreateUserGamification(userId);
    const aggregate = totals[0] || {};
    const levelMeta = calculateLevel(aggregate.totalPoints || 0);

    summary.totalPoints = Math.max(0, aggregate.totalPoints || 0);
    summary.availablePoints = Math.max(0, aggregate.availablePoints || 0);
    summary.seasonPoints = Math.max(0, aggregate.seasonPoints || 0);
    summary.lastEarnedAt = aggregate.lastEarnedAt || summary.lastEarnedAt || null;
    summary.level = levelMeta.level;
    summary.xpInLevel = levelMeta.xpInLevel;
    summary.badgesCount = badgesCount;
    summary.certificatesCount = certificatesCount;
    summary.currentStreak = streak?.currentCount || 0;
    summary.longestStreak = streak?.longestCount || 0;
    await summary.save();

    return summary;
};

const buildBadgeNotificationPayload = (badgeDoc) => ({
    badgeId: badgeDoc._id,
    key: badgeDoc.key,
    name: badgeDoc.name,
    description: badgeDoc.description,
    icon: badgeDoc.icon,
    category: badgeDoc.category,
    rarity: badgeDoc.rarity,
});

const checkBadgeCriteria = async (badge, userId, summary) => {
    const criteria = badge.criteria || {};
    if (badge.manualOnly) return false;

    if (criteria.minPoints && summary.totalPoints < criteria.minPoints) return false;
    if (criteria.level && summary.level < criteria.level) return false;
    if (criteria.streakDays) {
        const streak = await Streak.findOne({ userId, streakType: criteria.streakType || DEFAULT_STREAK_TYPE }).select("currentCount");
        if ((streak?.currentCount || 0) < criteria.streakDays) return false;
    }
    if (criteria.actionCount?.actionKey && criteria.actionCount?.count) {
        const actionCount = await PointsTransaction.countDocuments({
            userId,
            actionKey: criteria.actionCount.actionKey,
            status: "awarded",
            direction: "credit",
        });
        if (actionCount < criteria.actionCount.count) return false;
    }

    return true;
};

export const emitGamificationSocketEvents = ({ userId, pointsEvent, badgeEvents = [], levelEvent = null, streakEvent = null, leaderboardEvent = null, certificateEvent = null }) => {
    if (pointsEvent) emitToUser(userId, "gamification:points-earned", pointsEvent);
    badgeEvents.forEach((badgeEvent) => emitToUser(userId, "gamification:badge-unlocked", badgeEvent));
    if (levelEvent) emitToUser(userId, "gamification:level-up", levelEvent);
    if (streakEvent) emitToUser(userId, "gamification:streak-updated", streakEvent);
    if (leaderboardEvent) emitToUser(userId, "gamification:leaderboard-updated", leaderboardEvent);
    if (certificateEvent) emitToUser(userId, "gamification:certificate-issued", certificateEvent);
};

export const createGamificationNotification = ({ userId, type, title, body, ref, refModel, actorId = null, priority = "normal" }) => {
    systemEvents.emit("notification:create", {
        userId,
        type,
        title,
        body,
        ref,
        refModel,
        actorId,
        priority,
    });
};

export const updateStreaks = async ({ userId, rule, transaction }) => {
    if (!shouldQualifyForDefaultStreak(rule)) return null;

    const streakType = rule.streakHooks?.[0]?.type || DEFAULT_STREAK_TYPE;
    const streak = await Streak.findOneAndUpdate(
        { userId, streakType },
        { $setOnInsert: { userId, streakType } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const previousCount = streak.currentCount || 0;
    const previousDate = streak.lastQualifiedAt;
    const now = transaction.createdAt || new Date();

    if (!previousDate) {
        streak.currentCount = 1;
        streak.longestCount = Math.max(streak.longestCount || 0, 1);
        streak.lastQualifiedAt = now;
        streak.brokenAt = null;
    } else {
        const diff = getDateDiffInDays(now, previousDate);
        if (diff === 0) {
            return {
                streakType,
                currentCount: streak.currentCount,
                longestCount: streak.longestCount,
                lastQualifiedAt: streak.lastQualifiedAt,
                changed: false,
            };
        }
        if (diff === 1) {
            streak.currentCount = (streak.currentCount || 0) + 1;
            streak.longestCount = Math.max(streak.longestCount || 0, streak.currentCount);
            streak.lastQualifiedAt = now;
            streak.brokenAt = null;
        } else {
            streak.brokenAt = now;
            streak.currentCount = 1;
            streak.longestCount = Math.max(streak.longestCount || 0, previousCount);
            streak.lastQualifiedAt = now;
        }
    }

    await streak.save();
    await UserGamification.findOneAndUpdate(
        { userId },
        {
            $set: {
                currentStreak: streak.currentCount,
                longestStreak: streak.longestCount,
            },
        }
    );

    return {
        streakType,
        currentCount: streak.currentCount,
        longestCount: streak.longestCount,
        lastQualifiedAt: streak.lastQualifiedAt,
        changed: streak.currentCount !== previousCount,
        broken: !!streak.brokenAt && getDateDiffInDays(streak.brokenAt, now) === 0 && previousCount > 1,
    };
};

export const checkAndAwardBadges = async ({ userId, summary, awardedBy = null, refModel = "User", refId = null }) => {
    const badges = await Badge.find({ isActive: true }).sort({ createdAt: 1 });
    const awarded = [];

    for (const badge of badges) {
        const alreadyAwarded = await UserBadge.exists({ userId, badgeId: badge._id });
        if (alreadyAwarded) continue;

        const qualifies = await checkBadgeCriteria(badge, userId, summary);
        if (!qualifies) continue;

        const userBadge = await UserBadge.create({
            userId,
            badgeId: badge._id,
            awardedAt: new Date(),
            awardedBy,
            refModel,
            refId,
            meta: { autoAwarded: true },
        });

        const payload = {
            userId: normalizeId(userId),
            badge: buildBadgeNotificationPayload(badge),
            awardedAt: userBadge.awardedAt,
        };
        awarded.push(payload);

        createGamificationNotification({
            userId,
            type: "GAMIFICATION_BADGE",
            title: "Badge unlocked",
            body: `You unlocked "${badge.name}".`,
            ref: badge._id,
            refModel: "Badge",
            actorId: awardedBy,
            priority: "high",
        });
    }

    if (awarded.length > 0) {
        await UserGamification.findOneAndUpdate(
            { userId },
            { $inc: { badgesCount: awarded.length } }
        );
    }

    return awarded;
};

export const awardForAction = async ({ actionKey, actorId, refModel, refId, context = {}, awardedBy = null }) => {
    const rule = await GamificationRule.findOne({ actionKey, isActive: true });
    if (!rule) {
        return { skipped: true, reason: "rule_not_found" };
    }

    const user = await User.findById(actorId).select("campusId profile.displayName");
    if (!user) {
        return { skipped: true, reason: "user_not_found" };
    }

    const points = Number(rule.points || 0);
    if (!points) {
        return { skipped: true, reason: "zero_points" };
    }

    const capCheck = await enforceDailyCap(actorId, actionKey, points);
    if (!capCheck.allowed) {
        return { skipped: true, reason: "daily_cap_reached", cap: capCheck.cap };
    }

    const dedupKey =
        context.dedupKey ||
        generateDedupKey(
            actionKey,
            actorId,
            refModel || context.refModel || "User",
            refId || context.refId || actorId,
            rule.dedupStrategy || "action_ref"
        );

    const existing = await PointsTransaction.findOne({ dedupKey });
    if (existing) {
        return { skipped: true, reason: "duplicate_reward_blocked", transaction: existing };
    }

    const beforeSummary = await getOrCreateUserGamification(actorId);
    const transaction = await createPointsTransaction({
        userId: actorId,
        campusId: user.campusId,
        actionKey,
        module: rule.module,
        points,
        direction: points >= 0 ? "credit" : "debit",
        refModel: refModel || context.refModel || "User",
        refId: refId || context.refId || actorId,
        dedupKey,
        awardedBy,
        ruleId: rule._id,
        status: "awarded",
        reason: context.reason || rule.description || "",
        meta: context.meta || {},
    });

    const summary = await updateUserGamificationSummary(actorId);
    const streakUpdate = await updateStreaks({ userId: actorId, rule, transaction });
    const refreshedSummary = await updateUserGamificationSummary(actorId);
    const badgeEvents = await checkAndAwardBadges({
        userId: actorId,
        summary: refreshedSummary,
        awardedBy,
        refModel: refModel || context.refModel || "User",
        refId: refId || context.refId || actorId,
    });
    const finalSummary = await updateUserGamificationSummary(actorId);

    const pointsEvent = {
        userId: normalizeId(actorId),
        actionKey,
        points,
        totalPoints: finalSummary.totalPoints,
        level: finalSummary.level,
        reason: context.reason || rule.description || "",
        createdAt: transaction.createdAt,
    };

    const levelEvent =
        finalSummary.level > beforeSummary.level
            ? {
                userId: normalizeId(actorId),
                oldLevel: beforeSummary.level,
                newLevel: finalSummary.level,
                totalPoints: finalSummary.totalPoints,
            }
            : null;

    emitGamificationSocketEvents({
        userId: normalizeId(actorId),
        pointsEvent,
        badgeEvents,
        levelEvent,
        streakEvent: streakUpdate?.changed
            ? {
                userId: normalizeId(actorId),
                streakType: streakUpdate.streakType,
                currentCount: streakUpdate.currentCount,
                longestCount: streakUpdate.longestCount,
                broken: !!streakUpdate.broken,
                updatedAt: streakUpdate.lastQualifiedAt,
            }
            : null,
    });

    createGamificationNotification({
        userId: actorId,
        type: "GAMIFICATION_POINTS",
        title: `+${points} points earned`,
        body: buildNotificationBody({ actionKey, points, reason: context.reason || rule.description }),
        ref: transaction._id,
        refModel: "PointsTransaction",
        actorId: awardedBy,
    });

    if (levelEvent) {
        createGamificationNotification({
            userId: actorId,
            type: "GAMIFICATION_LEVEL",
            title: "Level up",
            body: `You reached level ${finalSummary.level}.`,
            ref: transaction._id,
            refModel: "PointsTransaction",
            actorId: awardedBy,
            priority: "high",
        });
    }

    if (streakUpdate?.changed) {
        createGamificationNotification({
            userId: actorId,
            type: "GAMIFICATION_STREAK",
            title: streakUpdate.broken ? "Streak restarted" : "Streak updated",
            body: streakUpdate.broken
                ? `Your ${streakUpdate.streakType.replaceAll("_", " ")} streak restarted at 1 day.`
                : `Your ${streakUpdate.streakType.replaceAll("_", " ")} streak is now ${streakUpdate.currentCount} day(s).`,
            ref: transaction._id,
            refModel: "PointsTransaction",
            actorId: awardedBy,
        });
    }

    return {
        skipped: false,
        rule,
        transaction,
        summary: finalSummary,
        badgeEvents,
        levelEvent,
        streakEvent: streakUpdate,
    };
};

export const safeAwardForAction = async (payload) => {
    try {
        return await awardForAction(payload);
    } catch (error) {
        const duplicate = error?.code === 11000;
        console.error(
            `[Gamification] Award failed for ${payload?.actionKey || "unknown_action"}:`,
            duplicate ? "duplicate reward blocked" : error.message
        );
        return {
            skipped: true,
            reason: duplicate ? "duplicate_reward_blocked" : "award_error",
            error: error.message,
        };
    }
};

export const safeAwardProfileCompletionIfEligible = async ({ beforeUser, afterUser, actorId, awardedBy = null }) => {
    const before = beforeUser?.profileCompleteness || 0;
    const after = afterUser?.profileCompleteness || 0;
    if (before < 100 && after >= 100) {
        return await safeAwardForAction({
            actionKey: "profile.completed_100",
            actorId,
            refModel: "User",
            refId: actorId,
            context: {
                reason: "Profile completion reached 100%.",
            },
            awardedBy,
        });
    }
    return { skipped: true, reason: "profile_threshold_not_reached" };
};

export const adjustPointsManually = async ({ userId, points, reason, adminUser }) => {
    const targetUser = await User.findById(userId).select("campusId");
    if (!targetUser) {
        throw new Error("Target user not found");
    }

    const amount = Number(points);
    if (!Number.isFinite(amount) || amount === 0) {
        throw new Error("points must be a non-zero number");
    }

    const transaction = await createPointsTransaction({
        userId,
        campusId: targetUser.campusId,
        actionKey: "admin.manual_adjustment",
        module: "admin",
        points: Math.abs(amount),
        direction: amount >= 0 ? "credit" : "debit",
        refModel: "User",
        refId: userId,
        dedupKey: crypto.randomUUID(),
        awardedBy: adminUser?._id || null,
        status: "awarded",
        reason: reason?.trim() || "Manual admin adjustment",
        meta: { manual: true, rawPoints: amount },
    });

    const summary = await updateUserGamificationSummary(userId);

    emitGamificationSocketEvents({
        userId: normalizeId(userId),
        pointsEvent: {
            userId: normalizeId(userId),
            actionKey: "admin.manual_adjustment",
            points: amount,
            totalPoints: summary.totalPoints,
            level: summary.level,
            reason: reason?.trim() || "Manual admin adjustment",
            createdAt: transaction.createdAt,
        },
    });

    createGamificationNotification({
        userId,
        type: "GAMIFICATION_POINTS",
        title: amount >= 0 ? "Points adjusted" : "Points deducted",
        body: reason?.trim() || "Your points were adjusted by an administrator.",
        ref: transaction._id,
        refModel: "PointsTransaction",
        actorId: adminUser?._id || null,
    });

    return { transaction, summary };
};

export const awardBadgeManually = async ({ userId, badgeId, adminUser, reason = "" }) => {
    const badge = await Badge.findById(badgeId);
    if (!badge) throw new Error("Badge not found");

    const existing = await UserBadge.findOne({ userId, badgeId });
    if (existing) return { skipped: true, badge, userBadge: existing };

    const userBadge = await UserBadge.create({
        userId,
        badgeId,
        awardedBy: adminUser?._id || null,
        refModel: "Badge",
        refId: badgeId,
        meta: { manual: true, reason },
    });

    await updateUserGamificationSummary(userId);

    const payload = {
        userId: normalizeId(userId),
        badge: buildBadgeNotificationPayload(badge),
        awardedAt: userBadge.awardedAt,
    };

    emitGamificationSocketEvents({
        userId: normalizeId(userId),
        badgeEvents: [payload],
    });

    createGamificationNotification({
        userId,
        type: "GAMIFICATION_BADGE",
        title: "Badge awarded",
        body: reason?.trim() || `You received the "${badge.name}" badge.`,
        ref: badge._id,
        refModel: "Badge",
        actorId: adminUser?._id || null,
        priority: "high",
    });

    return { badge, userBadge };
};
