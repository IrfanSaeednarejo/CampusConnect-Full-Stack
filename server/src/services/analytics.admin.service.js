import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Mentor } from "../models/mentor.model.js";
import { MentorBooking } from "../models/mentorBooking.model.js";
import { Society } from "../models/society.model.js";
import { Event } from "../models/event.model.js";
import { StudyGroup } from "../models/studyGroup.model.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const campusMatch = (campusId) =>
    campusId
        ? { campusId: new mongoose.Types.ObjectId(campusId) }
        : {};

const parsePeriodToDays = (period = "30d") => {
    const map = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
    return map[period] || 30;
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const getOverview = async (campusId) => {
    const scope = campusMatch(campusId);

    const [
        totalUsers,
        activeUsers,
        totalMentors,
        verifiedMentors,
        totalSocieties,
        activeSocieties,
        totalEvents,
        activeEvents,
        totalStudyGroups,
        completedSessions,
        pendingMentorApprovals,
        pendingSocietyApprovals,
        pendingEventApprovals,
        pendingStudyGroupApprovals,
    ] = await Promise.all([
        User.countDocuments({ ...scope, status: { $ne: "deleted" } }),
        User.countDocuments({ ...scope, status: "active" }),
        Mentor.countDocuments({ ...scope }),
        Mentor.countDocuments({ ...scope, verified: true, isActive: true }),
        Society.countDocuments({ ...scope }),
        Society.countDocuments({ ...scope, status: "approved" }),
        Event.countDocuments({ ...scope }),
        Event.countDocuments({ ...scope, status: { $in: ["published", "registration", "ongoing"] } }),
        StudyGroup.countDocuments({ ...scope, status: "active" }),
        MentorBooking.countDocuments({ ...scope, status: "completed" }),
        Mentor.countDocuments({ ...scope, verified: false, isActive: true }),
        Society.countDocuments({ ...scope, status: "pending" }),
        Event.countDocuments({ ...scope, status: "pending" }),
        StudyGroup.countDocuments({ ...scope, status: "pending" }),
    ]);

    return {
        users: { total: totalUsers, active: activeUsers, inactive: totalUsers - activeUsers },
        mentors: { total: totalMentors, verified: verifiedMentors, pendingApprovals: pendingMentorApprovals },
        societies: { total: totalSocieties, active: activeSocieties, pendingApprovals: pendingSocietyApprovals },
        events: { total: totalEvents, active: activeEvents, pendingApprovals: pendingEventApprovals },
        studyGroups: { total: totalStudyGroups, pendingApprovals: pendingStudyGroupApprovals },
        sessions: { completed: completedSessions },
    };
};

export const getUserGrowth = async (campusId, period) => {
    const days = parsePeriodToDays(period);
    const since = new Date(Date.now() - days * 86400000);
    const scope = campusMatch(campusId);
    const groupByFormat = days <= 30 ? "%Y-%m-%d" : days <= 90 ? "%Y-%U" : "%Y-%m";

    const data = await User.aggregate([
        { $match: { ...scope, createdAt: { $gte: since } } },
        {
            $group: {
                _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    return { period: period || "30d", data };
};

export const getMentorEngagement = async (campusId) => {
    const scope = campusMatch(campusId);

    return await MentorBooking.aggregate([
        { $match: { ...scope } },
        {
            $group: {
                _id: "$mentorId",
                totalSessions: { $sum: 1 },
                completedSessions: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                cancelledSessions: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$fee", 0] } },
            },
        },
        {
            $addFields: {
                completionRate: {
                    $cond: [
                        { $gt: ["$totalSessions", 0] },
                        { $round: [{ $multiply: [{ $divide: ["$completedSessions", "$totalSessions"] }, 100] }, 1] },
                        0,
                    ],
                },
            },
        },
        { $sort: { completedSessions: -1 } },
        { $limit: 20 },
        {
            $lookup: {
                from: "mentors",
                localField: "_id",
                foreignField: "_id",
                as: "mentor",
            },
        },
        { $unwind: { path: "$mentor", preserveNullAndEmpty: true } },
        {
            $lookup: {
                from: "users",
                localField: "mentor.userId",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: { path: "$user", preserveNullAndEmpty: true } },
        {
            $project: {
                _id: 0,
                mentorId: "$_id",
                displayName: "$user.profile.displayName",
                avatar: "$user.profile.avatar",
                tier: "$mentor.tier",
                averageRating: "$mentor.averageRating",
                totalSessions: 1,
                completedSessions: 1,
                cancelledSessions: 1,
                completionRate: 1,
                totalRevenue: 1,
            },
        },
    ]);
};

export const getEventParticipation = async (campusId) => {
    const scope = campusMatch(campusId);

    return await Event.aggregate([
        { $match: { ...scope } },
        {
            $project: {
                title: 1,
                status: 1,
                startAt: 1,
                registrationCount: 1,
                attendedCount: {
                    $size: {
                        $filter: { input: "$registrations", cond: { $eq: ["$$this.status", "attended"] } },
                    },
                },
                averageRating: 1,
                feedbackCount: { $size: "$feedback" },
            },
        },
        { $sort: { registrationCount: -1 } },
        { $limit: 20 },
        {
            $addFields: {
                attendanceRate: {
                    $cond: [
                        { $gt: ["$registrationCount", 0] },
                        { $round: [{ $multiply: [{ $divide: ["$attendedCount", "$registrationCount"] }, 100] }, 1] },
                        0,
                    ],
                },
            },
        },
    ]);
};

export const getSocietyActivity = async (campusId) => {
    const scope = campusMatch(campusId);

    return await Society.aggregate([
        { $match: { ...scope, status: "approved" } },
        {
            $lookup: {
                from: "events",
                localField: "_id",
                foreignField: "societyId",
                as: "events",
            },
        },
        {
            $project: {
                name: 1,
                tag: 1,
                category: 1,
                memberCount: 1,
                campusId: 1,
                eventCount: { $size: "$events" },
                lastEventAt: { $max: "$events.createdAt" },
            },
        },
        { $sort: { memberCount: -1 } },
        { $limit: 30 },
    ]);
};

export const getSessionsAnalytics = async (campusId, period) => {
    const days = parsePeriodToDays(period);
    const since = new Date(Date.now() - days * 86400000);
    const scope = campusMatch(campusId);

    const [breakdown, trend] = await Promise.all([
        MentorBooking.aggregate([
            { $match: { ...scope } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } },
        ]),
        MentorBooking.aggregate([
            { $match: { ...scope, createdAt: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", total: 1, completed: 1 } },
        ]),
    ]);

    return { breakdown, trend, period: period || "30d" };
};

export const getDashboardStats = async (campusId) => {
    const scope = campusMatch(campusId);

    const [
        totalUsers,
        pendingMentors,
        pendingSocieties,
        pendingEvents,
        pendingStudyGroups,
        activeSessionsProjected,
    ] = await Promise.all([
        User.countDocuments({ ...scope, status: "active" }),
        Mentor.countDocuments({ ...scope, verified: false, isActive: true }),
        Society.countDocuments({ ...scope, status: "pending" }),
        Event.countDocuments({ ...scope, status: "pending" }),
        StudyGroup.countDocuments({ ...scope, status: "pending" }),
        MentorBooking.countDocuments({ ...scope, status: "confirmed", startAt: { $lte: new Date() }, endAt: { $gte: new Date() } }),
    ]);

    return {
        totalActiveUsers: totalUsers,
        pendingApprovals: pendingMentors + pendingSocieties + pendingEvents + pendingStudyGroups,
        pendingMentors,
        pendingSocieties,
        pendingEvents,
        pendingStudyGroups,
        activeSessions: activeSessionsProjected,
    };
};
