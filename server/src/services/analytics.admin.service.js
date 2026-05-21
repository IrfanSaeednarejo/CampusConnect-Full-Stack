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
        { $unwind: { path: "$mentor", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "users",
                localField: "mentor.userId",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
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
        totalSocieties,
        activeSocieties,
        pendingMentors,
        pendingSocieties,
        pendingEvents,
        pendingStudyGroups,
        activeSessionsProjected,
    ] = await Promise.all([
        User.countDocuments({ ...scope, status: "active" }),
        Society.countDocuments({ ...scope }),
        Society.countDocuments({ ...scope, status: "approved" }),
        Mentor.countDocuments({ ...scope, verified: false, isActive: true }),
        Society.countDocuments({ ...scope, status: "pending" }),
        Event.countDocuments({ ...scope, approvalStatus: "pending_admin_review" }),
        StudyGroup.countDocuments({ ...scope, status: "pending" }),
        campusId
            ? MentorBooking.aggregate([
                {
                    $match: {
                        status: "confirmed",
                        startAt: { $lte: new Date() },
                        endAt: { $gte: new Date() },
                    },
                },
                {
                    $lookup: {
                        from: "mentors",
                        localField: "mentorId",
                        foreignField: "_id",
                        as: "mentor",
                    },
                },
                { $unwind: "$mentor" },
                { $match: { "mentor.campusId": new mongoose.Types.ObjectId(campusId) } },
                { $count: "count" },
            ]).then((rows) => rows[0]?.count || 0)
            : MentorBooking.countDocuments({ status: "confirmed", startAt: { $lte: new Date() }, endAt: { $gte: new Date() } }),
    ]);

    return {
        totalActiveUsers: totalUsers,
        pendingApprovals: pendingMentors + pendingSocieties + pendingEvents + pendingStudyGroups,
        pendingMentors,
        pendingSocieties,
        pendingEvents,
        pendingStudyGroups,
        activeSessions: activeSessionsProjected,
        totalSocieties,
        activeSocieties,
    };
};

export const getDashboardFeed = async (campusId) => {
    const scope = campusMatch(campusId);
    const limit = 5;

    const [
        recentUsers,
        recentMentors,
        recentSocieties,
        recentEvents,
        recentBookings,
    ] = await Promise.all([
        User.find({ ...scope, status: { $ne: "deleted" } })
            .select("profile.displayName campusId createdAt")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(),
        Mentor.find({ ...scope, verified: false, isActive: true })
            .select("userId campusId createdAt")
            .populate("userId", "profile.displayName")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(),
        Society.find({ ...scope, status: "pending" })
            .select("name campusId createdAt")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(),
        Event.find({ ...scope, approvalStatus: "pending_admin_review" })
            .select("title campusId createdAt")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(),
        campusId
            ? MentorBooking.aggregate([
                { $sort: { createdAt: -1 } },
                {
                    $lookup: {
                        from: "mentors",
                        localField: "mentorId",
                        foreignField: "_id",
                        as: "mentor",
                    },
                },
                { $unwind: "$mentor" },
                { $match: { "mentor.campusId": new mongoose.Types.ObjectId(campusId) } },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        topic: 1,
                        createdAt: 1,
                        campusId: "$mentor.campusId",
                    },
                },
            ])
            : MentorBooking.find({})
                .select("topic createdAt")
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
    ]);

    return [
        ...recentUsers.map((user) => ({
            _id: `user-${user._id}`,
            type: "admin:user_registered",
            displayName: user.profile?.displayName || "New user",
            summary: "A new user joined the platform.",
            campusId: user.campusId || null,
            _ts: user.createdAt,
        })),
        ...recentMentors.map((mentor) => ({
            _id: `mentor-${mentor._id}`,
            type: "admin:mentor_applied",
            displayName: mentor.userId?.profile?.displayName || "Mentor application",
            summary: "A mentor application is waiting for review.",
            campusId: mentor.campusId || null,
            _ts: mentor.createdAt,
        })),
        ...recentSocieties.map((society) => ({
            _id: `society-${society._id}`,
            type: "admin:society_created",
            title: society.name,
            summary: "A society request is waiting for approval.",
            campusId: society.campusId || null,
            _ts: society.createdAt,
        })),
        ...recentEvents.map((event) => ({
            _id: `event-${event._id}`,
            type: "admin:event_created",
            title: event.title,
            summary: "An event has been submitted for admin review.",
            campusId: event.campusId || null,
            _ts: event.createdAt,
        })),
        ...recentBookings.map((booking) => ({
            _id: `booking-${booking._id}`,
            type: "admin:booking_created",
            title: booking.topic || "Mentor session booking",
            summary: "A new mentoring booking was created.",
            campusId: booking.campusId || null,
            _ts: booking.createdAt,
        })),
    ]
        .sort((a, b) => new Date(b._ts) - new Date(a._ts))
        .slice(0, 12);
};
