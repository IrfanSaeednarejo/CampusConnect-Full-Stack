import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import { Society } from "../models/society.model.js";
import { Chat } from "../models/chat.model.js";
import { Mentor } from "../models/mentor.model.js";
import { MentorBooking } from "../models/mentorBooking.model.js";
import { StudyGroup } from "../models/studyGroup.model.js";

const getDashboardSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [
        activeEventsCount,
        mySocietiesCount,
        availableMentorsCount,
        myStudyGroupsCount,
        unreadMessagesResult
    ] = await Promise.all([
        Event.countDocuments({ 
            status: { $in: ["registration_open", "ongoing", "submission_open"] } 
        }),
        Society.countDocuments({ 
            "members.memberId": userId 
        }),
        Mentor.countDocuments({ 
            isVerified: true 
        }),
        StudyGroup.countDocuments({
            "groupMembers.memberId": userId
        }),
        Chat.aggregate([
            { $match: { "members.userId": userId } },
            { $unwind: "$members" },
            { $match: { "members.userId": userId } },
            { $group: { _id: null, totalUnread: { $sum: "$members.unreadCount" } } }
        ])
    ]);

    const unreadMessagesCount = unreadMessagesResult[0]?.totalUnread || 0;

    let mentorStats = {};
    if (req.user.roles.includes("mentor")) {
        mentorStats.pendingSessionsCount = await MentorBooking.countDocuments({
            mentorUserId: userId,
            status: "pending"
        });
    }

    let adminStats = {};
    if (req.user.roles.includes("admin")) {
        const [pendingSocieties, pendingMentors] = await Promise.all([
            Society.countDocuments({ isVerified: false }),
            Mentor.countDocuments({ isVerified: false })
        ]);
        adminStats.pendingApprovalsCount = pendingSocieties + pendingMentors;
    }

    return res.status(200).json(
        new ApiResponse(200, {
            activeEventsCount,
            mySocietiesCount,
            unreadMessagesCount,
            availableMentorsCount,
            myStudyGroupsCount,
            ...mentorStats,
            ...adminStats
        }, "Dashboard summary fetched successfully")
    );
});

const getDashboardTimeline = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [upcomingEvents, upcomingMenteesSessions, upcomingMentorSessions] = await Promise.all([
        Event.find({
            startAt: { $gte: now, $lte: sevenDaysLater },
            status: { $ne: "draft" }
        })
        .select("title startAt endAt venue category status coverImage")
        .sort({ startAt: 1 })
        .limit(5),
        
        MentorBooking.find({
            menteeId: userId, // Sessions I booked as a mentee
            startAt: { $gte: now, $lte: sevenDaysLater },
            status: { $in: ["pending", "confirmed"] }
        })
        .populate("mentorUserId", "profile.displayName profile.avatar")
        .sort({ startAt: 1 })
        .limit(5),

        MentorBooking.find({
            mentorUserId: userId, // Sessions I am hosting as a mentor
            startAt: { $gte: now, $lte: sevenDaysLater },
            status: { $in: ["pending", "confirmed"] }
        })
        .populate("menteeId", "profile.displayName profile.avatar")
        .sort({ startAt: 1 })
        .limit(5)
    ]);

    // Format timeline items
    const timeline = [
        ...upcomingEvents.map(e => ({
            id: e._id,
            type: "event",
            title: e.title,
            time: e.startAt,
            category: e.category,
            status: e.status,
            coverImage: e.coverImage
        })),
        ...upcomingMenteesSessions.map(b => ({
            id: b._id,
            type: "mentor_session",
            title: `Session with ${b.mentorUserId?.profile?.displayName || 'Mentor'}`,
            time: b.startAt,
            category: b.topic,
            status: b.status,
            role: "mentee"
        })),
        ...upcomingMentorSessions.map(b => ({
            id: b._id,
            type: "mentor_session",
            title: `Hosting: ${b.menteeId?.profile?.displayName || 'Student'}`,
            time: b.startAt,
            category: b.topic,
            status: b.status,
            role: "mentor"
        }))
    ].sort((a, b) => new Date(a.time) - new Date(b.time));

    return res.status(200).json(
        new ApiResponse(200, timeline, "Dashboard timeline fetched successfully")
    );
});

export {
    getDashboardSummary,
    getDashboardTimeline
};
