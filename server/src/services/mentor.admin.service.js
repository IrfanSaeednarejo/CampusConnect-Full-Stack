import mongoose from "mongoose";
import { Mentor } from "../models/mentor.model.js";
import { MentorBooking } from "../models/mentorBooking.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { paginate } from "../utils/paginate.js";
import { writeAuditLog } from "../utils/auditLog.js";
import { ADMIN_ACTIONS } from "../models/adminAuditLog.model.js";
import { systemEvents } from "../utils/events.js";
import { emitEvent } from "../utils/eventBus.js";
import { sendEmail } from "./email.service.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MENTOR_SELECT = "-pendingPayout -totalEarnings -lastPayoutAt -suspendReason -suspendedAt";
const MENTOR_ADMIN_SELECT = "-verificationDetails.verifiedBy";

const findMentorById = async (mentorId) => {
    if (!mongoose.isValidObjectId(mentorId)) throw new ApiError(400, "Invalid mentor ID");
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) throw new ApiError(404, "Mentor not found");
    return mentor;
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const listMentors = async (filter, options) => {
    return await paginate(Mentor, filter, {
        page: options.page,
        limit: options.limit,
        select: MENTOR_ADMIN_SELECT,
        sort: { createdAt: -1 },
        populate: [
            {
                path: "userId",
                select: "profile.displayName profile.avatar profile.firstName profile.lastName email campusId status",
                populate: { path: "campusId", select: "name code" },
            },
        ],
    });
};

export const listPendingMentors = async (filter, options) => {
    return await paginate(Mentor, filter, {
        page: options.page,
        limit: options.limit,
        sort: { createdAt: -1 },
        populate: [
            {
                path: "userId",
                select: "profile.displayName profile.avatar profile.firstName profile.lastName email campusId",
                populate: { path: "campusId", select: "name code" },
            },
        ],
    });
};

export const verifyMentor = async (mentorId, adminUser, req) => {
    const mentor = await findMentorById(mentorId);

    if (mentor.verified) {
        throw new ApiError(400, "Mentor is already verified");
    }

    const updated = await Mentor.findByIdAndUpdate(
        mentor._id,
        {
            $set: {
                verified: true,
                "verificationDetails.verifiedAt": new Date(),
                "verificationDetails.verifiedBy": adminUser._id,
            },
        },
        { new: true }
    ).populate("userId", "profile.displayName email campusId");

    await User.findByIdAndUpdate(mentor.userId, {
        $set: {
            "mentorVerification.isVerified": true,
            "mentorVerification.verifiedAt": new Date(),
            "mentorVerification.verifiedBy": adminUser._id,
        },
        $addToSet: { roles: "mentor" }
    });

    systemEvents.emit("notification:create", {
        userId: mentor.userId,
        type: "admin",
        title: "🎉 Mentor Profile Verified!",
        body: "Your mentor profile has been verified. You can now set your availability and accept bookings.",
        actorId: adminUser._id,
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.MENTOR_APPROVED,
        targetModel: "Mentor",
        targetId: mentor._id,
        payload: { userId: mentor.userId },
    });

    await emitEvent(ADMIN_ACTIONS.MENTOR_APPROVED + "@v1", {
        actorId: adminUser._id,
        targetId: mentor._id,
        payload: { userId: mentor.userId }
    });

    // Email the verified mentor
    const mentorUserVerified = await User.findById(mentor.userId).select("email profile.firstName");
    if (mentorUserVerified) {
        sendEmail(mentorUserVerified.email, "mentor_application", {
            firstName: mentorUserVerified.profile.firstName,
            status: "approved",
        });
    }

    return updated;
};

export const rejectMentor = async (mentorId, reason, adminUser, req) => {
    const mentor = await findMentorById(mentorId);

    if (mentor.verified) {
        throw new ApiError(400, "Cannot reject an already verified mentor. Use suspend instead.");
    }

    systemEvents.emit("notification:create", {
        userId: mentor.userId,
        type: "admin",
        title: "Mentor Application Update",
        body: reason
            ? `Your mentor application was not approved: ${reason}`
            : "Your mentor application was not approved at this time.",
        actorId: adminUser._id,
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.MENTOR_REJECTED,
        targetModel: "Mentor",
        targetId: mentor._id,
        payload: { reason: reason?.trim() || "", userId: mentor.userId },
    });

    await emitEvent(ADMIN_ACTIONS.MENTOR_REJECTED + "@v1", {
        actorId: adminUser._id,
        targetId: mentor._id,
        payload: { reason: reason?.trim() || "", userId: mentor.userId }
    });

    // Email the rejected applicant
    const mentorUser = await User.findById(mentor.userId).select("email profile.firstName");
    if (mentorUser) {
        sendEmail(mentorUser.email, "mentor_application", {
            firstName: mentorUser.profile.firstName,
            status: "rejected",
        });
    }

    // Delete the application so the user can reapply and it's removed from pending queues
    await Mentor.findByIdAndDelete(mentor._id);
};

export const suspendMentor = async (mentorId, reason, adminUser, req) => {
    const mentor = await findMentorById(mentorId);

    if (!mentor.isActive) {
        throw new ApiError(400, "Mentor is already suspended");
    }

    const updated = await Mentor.findByIdAndUpdate(
        mentor._id,
        {
            $set: {
                isActive: false,
                suspendedAt: new Date(),
                suspendReason: reason?.trim() || "",
            },
        },
        { new: true }
    ).select(MENTOR_SELECT);

    systemEvents.emit("notification:create", {
        userId: mentor.userId,
        type: "admin",
        title: "Mentor Profile Suspended",
        body: reason
            ? `Your mentor profile has been suspended: ${reason}`
            : "Your mentor profile has been suspended. Contact support for assistance.",
        actorId: adminUser._id,
    });

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.MENTOR_SUSPENDED,
        targetModel: "Mentor",
        targetId: mentor._id,
        payload: { reason: reason?.trim() || "" },
    });

    await emitEvent(ADMIN_ACTIONS.MENTOR_SUSPENDED + "@v1", {
        actorId: adminUser._id,
        targetId: mentor._id,
        payload: { reason: reason?.trim() || "" }
    });

    return updated;
};

export const overrideMentorTier = async (mentorId, tier, adminUser, req) => {
    if (!tier || !["bronze", "silver", "gold"].includes(tier)) {
        throw new ApiError(400, 'tier must be "bronze", "silver", or "gold"');
    }

    const mentor = await findMentorById(mentorId);
    const previousTier = mentor.tier;

    const updated = await Mentor.findByIdAndUpdate(
        mentor._id,
        { $set: { tier } },
        { new: true }
    ).select("_id tier userId");

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.MENTOR_TIER_OVERRIDDEN,
        targetModel: "Mentor",
        targetId: mentor._id,
        payload: { before: { tier: previousTier }, after: { tier } },
    });

    await emitEvent(ADMIN_ACTIONS.MENTOR_TIER_OVERRIDDEN + "@v1", {
        actorId: adminUser._id,
        targetId: mentor._id,
        payload: { before: previousTier, after: tier }
    });

    return updated;
};

export const getMentorSessions = async (mentorId, status, options) => {
    if (!mongoose.isValidObjectId(mentorId)) throw new ApiError(400, "Invalid mentor ID");

    const filter = { mentorId };
    const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled", "no-show"];
    if (status && VALID_STATUSES.includes(status)) filter.status = status;

    return await paginate(MentorBooking, filter, {
        page: options.page,
        limit: options.limit,
        sort: { startAt: -1 },
        populate: [
            { path: "menteeId", select: "profile.displayName profile.avatar email" },
        ],
    });
};
