import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Mentor } from "../models/mentor.model.js";
import { MentorBooking } from "../models/mentorBooking.model.js";
import { MentorReview } from "../models/mentorReview.model.js";
import { systemEvents } from "../utils/events.js";
import { User } from "../models/user.model.js";
import { paginate } from "../utils/paginate.js";

const PLATFORM_FEE_RATE = 0.1;
const CANCELLATION_WINDOW_HOURS = 2;

const findMentorById = async (mentorId, select = "") => {
    if (!mongoose.isValidObjectId(mentorId)) throw new ApiError(400, "Invalid mentor ID format");
    const mentor = await Mentor.findById(mentorId).select(select || undefined);
    if (!mentor) throw new ApiError(404, "Mentor not found");
    return mentor;
};

const findBookingById = async (bookingId, select = "") => {
    if (!mongoose.isValidObjectId(bookingId)) throw new ApiError(400, "Invalid booking ID format");
    const booking = await MentorBooking.findById(bookingId).select(select || undefined);
    if (!booking) throw new ApiError(404, "Booking not found");
    return booking;
};

const hasBookingConflict = async (mentorId, startAt, endAt, excludeBookingId = null) => {
    const filter = {
        mentorId,
        status: { $in: ["pending", "confirmed"] },
        $or: [
            { startAt: { $lt: endAt, $gte: startAt } },
            { endAt: { $gt: startAt, $lte: endAt } },
            { startAt: { $lte: startAt }, endAt: { $gte: endAt } },
        ],
    };
    if (excludeBookingId) filter._id = { $ne: excludeBookingId };
    return MentorBooking.exists(filter);
};

const isWithinAvailability = (availability, startAt, endAt) => {
    if (!availability || availability.length === 0) return true;
    const dayOfWeek = startAt.getUTCDay();
    const toMinutes = (hhmm) => {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    };
    const requestStart = startAt.getUTCHours() * 60 + startAt.getUTCMinutes();
    const requestEnd = endAt.getUTCHours() * 60 + endAt.getUTCMinutes();
    return availability.some((slot) => {
        if (slot.day !== dayOfWeek) return false;
        const slotStart = toMinutes(slot.startTime);
        const slotEnd = toMinutes(slot.endTime);
        return requestStart >= slotStart && requestEnd <= slotEnd;
    });
};

export const registerAsMentor = async (data, requestUser) => {
    const { bio, expertise, categories, hourlyRate, currency, availability, campusId } = data;
    const existing = await Mentor.findOne({ userId: requestUser._id });
    if (existing) throw new ApiError(409, "You already have a mentor profile");

    if (!expertise || !Array.isArray(expertise) || expertise.length === 0) {
        throw new ApiError(400, "At least one expertise area is required");
    }

    const resolvedCampusId = campusId || requestUser.campusId;
    const parsedAvailability = Array.isArray(availability) ? availability : typeof availability === "string" ? JSON.parse(availability) : [];
    const parsedCategories = Array.isArray(categories) ? categories : typeof categories === "string" ? JSON.parse(categories) : ["other"];

    const mentor = await Mentor.create({
        userId: requestUser._id,
        campusId: resolvedCampusId,
        bio: bio?.trim() || "",
        expertise,
        categories: parsedCategories,
        hourlyRate: parseFloat(hourlyRate) || 0,
        currency: currency?.toUpperCase() || "PKR",
        availability: parsedAvailability,
        verified: false,
        isActive: true,
    });

    await User.findByIdAndUpdate(requestUser._id, {
        $set: { mentorProfile: mentor._id },
        $addToSet: { roles: "mentor" },
    });

    // Notify all campus admins about the new mentor application
    const adminUsers = await User.find({ roles: { $in: ["admin"] }, status: "active" }).select("_id");
    adminUsers.forEach((admin) => {
        systemEvents.emit("notification:create", {
            userId: admin._id,
            type: "admin",
            title: "New Mentor Application",
            body: `${requestUser.profile.displayName} has submitted a mentor application and is awaiting verification.`,
            ref: mentor._id,
            refModel: "User",
            actorId: requestUser._id,
            priority: "high",
        });
    });

    return await Mentor.findById(mentor._id).populate("userId", "profile.displayName profile.avatar profile.firstName profile.lastName");
};

export const updateMentorProfile = async (data, requestUser) => {
    const mentor = await Mentor.findOne({ userId: requestUser._id });
    if (!mentor) throw new ApiError(404, "Mentor profile not found. Register as a mentor first.");

    const { bio, expertise, categories, hourlyRate, currency } = data;
    const updates = {};

    if (bio !== undefined) updates.bio = bio.trim();
    if (expertise !== undefined) {
        const parsed = Array.isArray(expertise) ? expertise : JSON.parse(expertise);
        if (parsed.length === 0) throw new ApiError(400, "Expertise cannot be empty");
        updates.expertise = parsed;
    }
    if (categories !== undefined) {
        updates.categories = Array.isArray(categories) ? categories : JSON.parse(categories);
    }
    if (hourlyRate !== undefined) {
        const rate = parseFloat(hourlyRate);
        if (isNaN(rate) || rate < 0) throw new ApiError(400, "hourlyRate must be a non-negative number");
        updates.hourlyRate = rate;
    }
    if (currency !== undefined) updates.currency = currency.toUpperCase();

    if (Object.keys(updates).length === 0) throw new ApiError(400, "No valid fields provided — nothing to update");

    return await Mentor.findByIdAndUpdate(mentor._id, { $set: updates }, { new: true, runValidators: true })
        .populate("userId", "profile.displayName profile.avatar profile.firstName profile.lastName");
};

export const getMentors = async (queryParams) => {
    const { page = 1, limit = 12, campusId, category, expertise, tier, minRating, q, verified } = queryParams;
    
    // Default: only show active & verified mentors (public API)
    // Admin bypass: when verified=false is explicitly requested, show unverified (pending) mentors
    const filter = verified === "false" || verified === false
        ? { isActive: true, verified: false } // Pending applications
        : { isActive: true, verified: true };  // Default public filter

    if (campusId) {
        if (!mongoose.isValidObjectId(campusId)) throw new ApiError(400, "Invalid campusId format");
        filter.campusId = new mongoose.Types.ObjectId(campusId);
    }
    if (category) filter.categories = category;
    if (expertise) filter.expertise = { $regex: expertise.trim(), $options: "i" };
    if (tier && ["bronze", "silver", "gold"].includes(tier)) filter.tier = tier;
    if (minRating) {
        const rating = parseFloat(minRating);
        if (!isNaN(rating)) filter.averageRating = { $gte: rating };
    }
    if (q?.trim()) filter.$text = { $search: q.trim() };

    const queryOptions = {
        page, limit,
        select: "-pendingPayout -totalEarnings -lastPayoutAt -suspendReason -suspendedAt -verificationDetails",
        sort: { averageRating: -1, totalSessions: -1 },
        populate: [{ path: "userId", select: "profile.displayName profile.avatar profile.firstName profile.lastName academic.department" }],
    };

    if (q?.trim()) {
        queryOptions.select += " score";
        queryOptions.sort = { score: { $meta: "textScore" } };
    }

    return await paginate(Mentor, filter, queryOptions);
};

export const getMyMentorProfile = async (requestUser) => {
    const mentor = await Mentor.findOne({ userId: requestUser._id }).populate(
        "userId", "profile.displayName profile.avatar profile.firstName profile.lastName email"
    );
    if (!mentor) throw new ApiError(404, "Mentor profile not found. Register as a mentor first.");
    return mentor;
};

export const getMentorById = async (mentorId, requestUser) => {
    const mentor = await Mentor.findById(mentorId)
        .select("-pendingPayout -totalEarnings -lastPayoutAt -suspendReason -suspendedAt -verificationDetails")
        .populate("userId", "profile.displayName profile.avatar profile.firstName profile.lastName academic.department academic.degree");

    if (!mentor) throw new ApiError(404, "Mentor not found");
    if (!mentor.isActive || !mentor.verified) {
        if (!requestUser?.roles?.includes("admin")) throw new ApiError(404, "Mentor not found");
    }

    const recentReviews = await MentorReview.find({ mentorId }).sort({ createdAt: -1 }).limit(5)
        .populate({ path: "menteeId", select: "profile.displayName profile.avatar" });

    return { ...mentor.toObject({ virtuals: true }), recentReviews };
};

export const setAvailability = async (data, requestUser) => {
    const { availability } = data;
    if (!Array.isArray(availability)) throw new ApiError(400, "availability must be an array of time slots");

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    for (const slot of availability) {
        if (slot.day === undefined || slot.day < 0 || slot.day > 6) throw new ApiError(400, "Each slot must have day between 0 (Sunday) and 6 (Saturday)");
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) throw new ApiError(400, `Slot times must be HH:mm format. Got: ${slot.startTime} - ${slot.endTime}`);
        if (slot.startTime >= slot.endTime) throw new ApiError(400, `startTime must be before endTime for day ${slot.day}`);
    }

    const mentor = await Mentor.findOne({ userId: requestUser._id });
    if (!mentor) throw new ApiError(404, "Mentor profile not found. Register as a mentor first.");
    if (!mentor.verified) throw new ApiError(403, "Your mentor profile must be verified by an admin before you can set availability.");

    return await Mentor.findByIdAndUpdate(mentor._id, { $set: { availability } }, { new: true, runValidators: true }).select("_id availability");
};

export const getMentorAvailability = async (mentorId, queryParams, requestUser) => {
    const { date } = queryParams;
    const mentor = await findMentorById(mentorId, "availability isActive verified");

    if (!mentor.isActive || !mentor.verified) {
        if (!requestUser?.roles?.includes("admin")) throw new ApiError(404, "Mentor not found");
    }

    let bookedSlots = [];
    if (date) {
        const anchor = new Date(date);
        if (isNaN(anchor.getTime())) throw new ApiError(400, "Invalid date format");
        const weekStart = new Date(anchor);
        weekStart.setDate(anchor.getDate() - anchor.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        bookedSlots = await MentorBooking.find({
            mentorId, status: { $in: ["pending", "confirmed"] }, startAt: { $gte: weekStart, $lt: weekEnd }
        }).select("startAt endAt status");
    }
    return { availability: mentor.availability, bookedSlots };
};

export const bookSession = async (mentorId, data, requestUser) => {
    const { startAt, endAt, topic, notes } = data;
    if (!startAt || !endAt) throw new ApiError(400, "startAt and endAt are required");

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new ApiError(400, "Invalid date format for startAt or endAt");
    if (start <= new Date()) throw new ApiError(400, "Session must be scheduled in the future");
    if (end <= start) throw new ApiError(400, "endAt must be after startAt");

    const durationMinutes = Math.round((end - start) / 60000);
    if (durationMinutes < 15) throw new ApiError(400, "Minimum session duration is 15 minutes");
    if (durationMinutes > 180) throw new ApiError(400, "Maximum session duration is 3 hours (180 minutes)");

    const mentor = await findMentorById(mentorId, "userId isActive verified availability hourlyRate currency campusId");
    if (mentor.userId.toString() === requestUser._id.toString()) throw new ApiError(400, "You cannot book a session with yourself");
    if (!mentor.isActive || !mentor.verified) throw new ApiError(400, "This mentor is not currently accepting bookings");
    if (!isWithinAvailability(mentor.availability, start, end)) throw new ApiError(400, "The requested time slot is outside the mentor's available hours. Check their availability calendar.");

    const conflict = await hasBookingConflict(mentor._id, start, end);
    if (conflict) throw new ApiError(409, "This time slot is already booked. Please choose a different time.");

    const sessionFee = parseFloat((((mentor.hourlyRate || 0) / 60) * durationMinutes).toFixed(2));
    const platformFee = parseFloat((sessionFee * PLATFORM_FEE_RATE).toFixed(2));
    const mentorPayout = parseFloat((sessionFee - platformFee).toFixed(2));

    const booking = await MentorBooking.create({
        mentorId: mentor._id, mentorUserId: mentor.userId, menteeId: requestUser._id,
        startAt: start, endAt: end, duration: durationMinutes, topic: topic?.trim() || "", notes: notes?.trim() || "",
        fee: sessionFee, currency: mentor.currency, platformFee, mentorPayout, status: "pending",
    });

    const created = await MentorBooking.findById(booking._id)
        .populate("mentorId", "userId hourlyRate currency tier averageRating")
        .populate("menteeId", "profile.displayName profile.avatar");

    systemEvents.emit("notification:create", {
        userId: mentor.userId, type: "mentor_booking", title: "New Mentorship Request",
        body: `${requestUser.profile.displayName} has requested a mentoring session with you on ${start.toDateString()}.`,
        ref: booking._id, refModel: "MentorBooking", actorId: requestUser._id,
    });
    return created;
};

export const confirmBooking = async (bookingId, requestUser) => {
    const booking = await findBookingById(bookingId, "mentorId mentorUserId menteeId status startAt");
    if (booking.mentorUserId.toString() !== requestUser._id.toString()) throw new ApiError(403, "Only the mentor can confirm bookings");
    if (booking.status !== "pending") throw new ApiError(400, `Cannot confirm a booking with status "${booking.status}"`);
    if (booking.startAt <= new Date()) throw new ApiError(400, "Cannot confirm a booking that has already started");

    const updated = await MentorBooking.findByIdAndUpdate(bookingId, { $set: { status: "confirmed", confirmedAt: new Date() } }, { new: true })
        .populate("mentorId", "userId tier averageRating").populate("menteeId", "profile.displayName profile.avatar");

    systemEvents.emit("notification:create", {
        userId: booking.menteeId._id || booking.menteeId, type: "mentor_booking", title: "Session Confirmed",
        body: `Your mentoring session on ${booking.startAt.toDateString()} has been confirmed!`, ref: booking._id, refModel: "MentorBooking", actorId: requestUser._id,
    });
    return updated;
};

export const cancelBooking = async (bookingId, reason, requestUser) => {
    const booking = await findBookingById(bookingId, "mentorId mentorUserId menteeId status startAt");
    const userId = requestUser._id.toString();
    const isMentor = booking.mentorUserId.toString() === userId;
    const isMentee = booking.menteeId.toString() === userId;
    const isAdmin = requestUser.roles?.includes("admin");

    if (!isMentor && !isMentee && !isAdmin) throw new ApiError(403, "You are not a participant in this booking");
    if (!["pending", "confirmed"].includes(booking.status)) throw new ApiError(400, `Cannot cancel a booking with status "${booking.status}"`);

    if (isMentee && !isAdmin) {
        if ((booking.startAt - new Date()) / 3600000 < CANCELLATION_WINDOW_HOURS) {
            throw new ApiError(400, `Cancellations must be made at least ${CANCELLATION_WINDOW_HOURS} hours before the session starts`);
        }
    }

    const updated = await MentorBooking.findByIdAndUpdate(bookingId, {
        $set: { status: "cancelled", cancelledAt: new Date(), cancelledBy: requestUser._id, cancellationReason: reason?.trim() || "" },
    }, { new: true });

    const otherUserId = isMentor ? (booking.menteeId._id || booking.menteeId) : booking.mentorUserId;
    systemEvents.emit("notification:create", {
        userId: otherUserId, type: "mentor_booking", title: "Session Cancelled",
        body: `${requestUser.profile.displayName} has cancelled the session scheduled for ${booking.startAt.toDateString()}.`,
        ref: booking._id, refModel: "MentorBooking", actorId: requestUser._id, priority: "high"
    });
    return updated;
};

export const completeBooking = async (bookingId, requestUser) => {
    const booking = await findBookingById(bookingId, "mentorId mentorUserId menteeId status startAt mentorPayout");
    if (booking.mentorUserId.toString() !== requestUser._id.toString()) throw new ApiError(403, "Only the mentor can mark a session as completed");
    if (booking.status !== "confirmed") throw new ApiError(400, `Cannot complete a booking with status "${booking.status}". Session must be confirmed first.`);
    if (booking.startAt > new Date()) throw new ApiError(400, "Cannot complete a session that has not started yet");

    const updated = await MentorBooking.findByIdAndUpdate(bookingId, { $set: { status: "completed", completedAt: new Date() } }, { new: true });

    await Mentor.findByIdAndUpdate(booking.mentorId, { $inc: { pendingPayout: booking.mentorPayout } });
    Mentor.syncStats(booking.mentorId).catch((err) => console.error("[Mentor] Failed to sync stats after session complete:", err.message));

    systemEvents.emit("notification:create", {
        userId: booking.menteeId._id || booking.menteeId, type: "mentor_booking", title: "Session Completed",
        body: `Your mentoring session is complete! Please leave a review.`, ref: booking._id, refModel: "MentorBooking", actorId: requestUser._id
    });
    return updated;
};

export const markNoShow = async (bookingId, requestUser) => {
    const booking = await findBookingById(bookingId, "mentorUserId status startAt");
    if (booking.mentorUserId.toString() !== requestUser._id.toString()) throw new ApiError(403, "Only the mentor can mark a no-show");
    if (booking.status !== "confirmed") throw new ApiError(400, `Cannot mark no-show for a booking with status "${booking.status}"`);
    if (booking.startAt > new Date()) throw new ApiError(400, "Cannot mark a no-show before the session start time");

    return await MentorBooking.findByIdAndUpdate(bookingId, { $set: { status: "no-show" } }, { new: true });
};

export const getMyBookings = async (queryParams, requestUser) => {
    const { page = 1, limit = 10, role = "all", status } = queryParams;
    const filter = {};
    if (role === "mentor") filter.mentorUserId = requestUser._id;
    else if (role === "mentee") filter.menteeId = requestUser._id;
    else filter.$or = [{ mentorUserId: requestUser._id }, { menteeId: requestUser._id }];
    
    if (status && ["pending", "confirmed", "completed", "cancelled", "no-show"].includes(status)) filter.status = status;

    return await paginate(MentorBooking, filter, {
        page, limit, sort: { startAt: -1 },
        populate: [
            { path: "mentorId", select: "userId tier averageRating hourlyRate currency", populate: { path: "userId", select: "profile.displayName profile.avatar" } },
            { path: "menteeId", select: "profile.displayName profile.avatar profile.firstName profile.lastName" },
        ],
    });
};

export const getBookingById = async (bookingId, requestUser) => {
    const booking = await findBookingById(bookingId);
    const userId = requestUser._id.toString();
    const isAdmin = requestUser.roles?.includes("admin");
    const isParticipant = booking.mentorUserId.toString() === userId || booking.menteeId.toString() === userId;

    if (!isAdmin && !isParticipant) throw new ApiError(403, "You are not a participant in this booking");

    await MentorBooking.populate(booking, [
        { path: "mentorId", select: "userId tier averageRating hourlyRate currency", populate: { path: "userId", select: "profile.displayName profile.avatar" } },
        { path: "menteeId", select: "profile.displayName profile.avatar profile.firstName profile.lastName" },
        { path: "reviewId" },
    ]);
    return booking;
};

export const submitReview = async (bookingId, data, requestUser) => {
    const { rating, comment, isAnonymous, detailedRatings } = data;
    if (!rating || rating < 1 || rating > 5) throw new ApiError(400, "Rating must be a number between 1 and 5");

    const booking = await findBookingById(bookingId, "mentorId menteeId status reviewId");
    if (booking.menteeId.toString() !== requestUser._id.toString()) throw new ApiError(403, "Only the mentee can submit a review");
    if (booking.status !== "completed") throw new ApiError(400, "Reviews can only be submitted for completed sessions");
    if (booking.reviewId) throw new ApiError(409, "A review has already been submitted for this session");

    const review = await MentorReview.create({
        bookingId: booking._id, mentorId: booking.mentorId, menteeId: requestUser._id,
        rating: parseInt(rating, 10), comment: comment?.trim() || "", isAnonymous: isAnonymous === true || isAnonymous === "true",
        detailedRatings: detailedRatings || undefined,
    });

    await MentorBooking.findByIdAndUpdate(bookingId, { $set: { reviewId: review._id } });
    Mentor.syncStats(booking.mentorId).catch((err) => console.error("[Mentor] Failed to sync stats after review:", err.message));

    const mentorDoc = await Mentor.findById(booking.mentorId).select("userId");
    systemEvents.emit("notification:create", {
        userId: booking.mentorId.userId || mentorDoc.userId, type: "mentor_review", title: "New Review Received",
        body: `You received a ${rating}-star review for a recent session.`, ref: review._id, refModel: "MentorBooking", actorId: requestUser._id
    });
    return review;
};

export const getMentorReviews = async (mentorId, queryParams) => {
    const { page = 1, limit = 10 } = queryParams;
    if (!mongoose.isValidObjectId(mentorId)) throw new ApiError(400, "Invalid mentor ID format");
    if (!(await Mentor.exists({ _id: mentorId }))) throw new ApiError(404, "Mentor not found");

    const result = await paginate(MentorReview, { mentorId }, {
        page, limit, sort: { createdAt: -1 }, populate: [{ path: "menteeId", select: "profile.displayName profile.avatar" }],
    });

    result.docs = result.docs.map((review) => {
        const r = review.toObject ? review.toObject() : { ...review };
        if (r.isAnonymous) r.menteeId = { profile: { displayName: "Anonymous", avatar: "" } };
        return r;
    });

    const distribution = await MentorReview.aggregate([
        { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);

    return { ...result, distribution: Object.fromEntries(distribution.map(({ _id, count }) => [_id, count])) };
};

export const respondToReview = async (mentorId, reviewId, data, requestUser) => {
    const { content } = data;
    if (!content?.trim()) throw new ApiError(400, "Response content is required");

    const mentor = await findMentorById(mentorId, "userId");
    if (mentor.userId.toString() !== requestUser._id.toString()) throw new ApiError(403, "Only the mentor can respond to their own reviews");
    if (!mongoose.isValidObjectId(reviewId)) throw new ApiError(400, "Invalid review ID format");

    const review = await MentorReview.findOne({ _id: reviewId, mentorId });
    if (!review) throw new ApiError(404, "Review not found");
    if (review.mentorResponse?.content) throw new ApiError(409, "You have already responded to this review");

    return await MentorReview.findByIdAndUpdate(reviewId, {
        $set: { "mentorResponse.content": content.trim(), "mentorResponse.respondedAt": new Date() },
    }, { new: true });
};

export const verifyMentor = async (mentorId, requestUser) => {
    if (!requestUser.roles?.includes("admin")) throw new ApiError(403, "Only admins can verify mentor profiles");
    const mentor = await findMentorById(mentorId, "verified userId");
    if (mentor.verified) throw new ApiError(400, "Mentor is already verified");

    const updated = await Mentor.findByIdAndUpdate(mentor._id, {
        $set: { verified: true, "verificationDetails.verifiedAt": new Date(), "verificationDetails.verifiedBy": requestUser._id },
    }, { new: true }).populate("userId", "profile.displayName profile.avatar");

    await User.findByIdAndUpdate(mentor.userId, {
        $set: { "mentorVerification.isVerified": true, "mentorVerification.verifiedAt": new Date(), "mentorVerification.verifiedBy": requestUser._id },
    });

    // Notify the mentor that they have been verified
    systemEvents.emit("notification:create", {
        userId: mentor.userId,
        type: "admin",
        title: "🎉 Mentor Profile Verified!",
        body: "Congratulations! Your mentor profile has been approved. You can now set your availability and start accepting sessions.",
        ref: mentor._id,
        refModel: "User",
        actorId: requestUser._id,
        priority: "high",
    });

    return updated;
};

export const suspendMentor = async (mentorId, data, requestUser) => {
    if (!requestUser.roles?.includes("admin")) throw new ApiError(403, "Only admins can suspend mentor profiles");
    const mentor = await findMentorById(mentorId, "isActive userId");
    if (!mentor.isActive) throw new ApiError(400, "Mentor is already suspended");
    const result = await Mentor.findByIdAndUpdate(mentor._id, {
        $set: { isActive: false, suspendedAt: new Date(), suspendReason: data.reason?.trim() || "" },
    }, { new: true }).select("-pendingPayout -totalEarnings");

    // Notify the mentor about the suspension
    systemEvents.emit("notification:create", {
        userId: mentor.userId,
        type: "admin",
        title: "Mentor Profile Suspended",
        body: `Your mentor profile has been suspended${data.reason ? `: ${data.reason.trim()}` : ". Please contact admin for more information."} `,
        ref: mentor._id,
        refModel: "User",
        actorId: requestUser._id,
        priority: "high",
    });

    return result;
};
