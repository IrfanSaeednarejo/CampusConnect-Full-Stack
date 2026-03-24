import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Mentor } from "../models/mentor.model.js";
import { MentorBooking } from "../models/mentorBooking.model.js";
import { MentorReview } from "../models/mentorReview.model.js";
import { User } from "../models/user.model.js";
import { paginate } from "../utils/paginate.js";

const PLATFORM_FEE_RATE = 0.1;

const CANCELLATION_WINDOW_HOURS = 2;

const findMentorById = async (mentorId, select = "") => {
    if (!mongoose.isValidObjectId(mentorId)) {
        throw new ApiError(400, "Invalid mentor ID format");
    }
    const mentor = await Mentor.findById(mentorId).select(select || undefined);
    if (!mentor) throw new ApiError(404, "Mentor not found");
    return mentor;
};

const findBookingById = async (bookingId, select = "") => {
    if (!mongoose.isValidObjectId(bookingId)) {
        throw new ApiError(400, "Invalid booking ID format");
    }
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
    if (excludeBookingId) {
        filter._id = { $ne: excludeBookingId };
    }
    return MentorBooking.exists(filter);
};

const isWithinAvailability = (availability, startAt, endAt) => {
    if (!availability || availability.length === 0) return true;

    const dayOfWeek = startAt.getDay();

    const toMinutes = (hhmm) => {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    };

    const requestStart =
        startAt.getHours() * 60 + startAt.getMinutes();
    const requestEnd =
        endAt.getHours() * 60 + endAt.getMinutes();

    return availability.some((slot) => {
        if (slot.day !== dayOfWeek) return false;
        const slotStart = toMinutes(slot.startTime);
        const slotEnd = toMinutes(slot.endTime);
        return requestStart >= slotStart && requestEnd <= slotEnd;
    });
};
const syncMentorStats = async (mentorId) => {
    const [bookingStats, reviewStats] = await Promise.all([
        MentorBooking.aggregate([
            { $match: { mentorId: new mongoose.Types.ObjectId(mentorId), status: "completed" } },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    totalEarnings: { $sum: "$mentorPayout" },
                },
            },
        ]),
        MentorReview.aggregate([
            { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]),
    ]);

    const updates = {};

    if (bookingStats.length > 0) {
        updates.totalSessions = bookingStats[0].totalSessions;
        updates.totalEarnings = bookingStats[0].totalEarnings;
    }

    if (reviewStats.length > 0) {
        updates.averageRating =
            Math.round(reviewStats[0].averageRating * 10) / 10;
        updates.totalReviews = reviewStats[0].totalReviews;
    }

    if (Object.keys(updates).length > 0) {
        await Mentor.findByIdAndUpdate(mentorId, { $set: updates });
    }
};
/**
 * POST /api/v1/mentors/register
 */
const registerAsMentor = asyncHandler(async (req, res) => {
    const { bio, expertise, categories, hourlyRate, currency, availability, campusId } = req.body;
    const existing = await Mentor.findOne({ userId: req.user._id });
    if (existing) {
        throw new ApiError(409, "You already have a mentor profile");
    }

    if (!expertise || !Array.isArray(expertise) || expertise.length === 0) {
        throw new ApiError(400, "At least one expertise area is required");
    }

    const resolvedCampusId = campusId || req.user.campusId;

    const parsedAvailability = Array.isArray(availability)
        ? availability
        : typeof availability === "string"
            ? JSON.parse(availability)
            : [];

    const parsedCategories = Array.isArray(categories)
        ? categories
        : typeof categories === "string"
            ? JSON.parse(categories)
            : ["other"];

    const mentor = await Mentor.create({
        userId: req.user._id,
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

    await User.findByIdAndUpdate(req.user._id, {
        $set: { mentorProfile: mentor._id },
        $addToSet: { roles: "mentor" },
    });

    const created = await Mentor.findById(mentor._id).populate(
        "userId",
        "profile.displayName profile.avatar profile.firstName profile.lastName"
    );

    return res
        .status(201)
        .json(new ApiResponse(201, created, "Mentor profile created. Pending admin verification."));
});

/**
 * PATCH /api/v1/mentors/profile
 */
const updateMentorProfile = asyncHandler(async (req, res) => {
    const mentor = await Mentor.findOne({ userId: req.user._id });
    if (!mentor) {
        throw new ApiError(404, "Mentor profile not found. Register as a mentor first.");
    }

    const { bio, expertise, categories, hourlyRate, currency } = req.body;

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

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided — nothing to update");
    }

    const updated = await Mentor.findByIdAndUpdate(
        mentor._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).populate("userId", "profile.displayName profile.avatar profile.firstName profile.lastName");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Mentor profile updated successfully"));
});

/**
 * GET /api/v1/mentors
 */
const getMentors = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        campusId,
        category,
        expertise,
        tier,
        minRating,
        q,
    } = req.query;

    const filter = { isActive: true, verified: true };

    const resolvedCampusId = campusId || req.user?.campusId;
    if (resolvedCampusId) {
        if (!mongoose.isValidObjectId(resolvedCampusId)) {
            throw new ApiError(400, "Invalid campusId format");
        }
        filter.campusId = new mongoose.Types.ObjectId(resolvedCampusId);
    }

    if (category) filter.categories = category;
    if (expertise) filter.expertise = { $regex: expertise.trim(), $options: "i" };
    if (tier && ["bronze", "silver", "gold"].includes(tier)) filter.tier = tier;
    if (minRating) {
        const rating = parseFloat(minRating);
        if (!isNaN(rating)) filter.averageRating = { $gte: rating };
    }

    if (q?.trim()) {
        filter.$text = { $search: q.trim() };
    }

    const result = await paginate(Mentor, filter, {
        page,
        limit,
        select: "-pendingPayout -totalEarnings -lastPayoutAt -suspendReason -suspendedAt -verificationDetails",
        sort: q?.trim()
            ? { score: { $meta: "textScore" } }
            : { averageRating: -1, totalSessions: -1 },
        populate: [
            {
                path: "userId",
                select:
                    "profile.displayName profile.avatar profile.firstName profile.lastName academic.department",
            },
        ],
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Mentors fetched successfully"));
});

/**
 * GET /api/v1/mentors/me
 */
const getMyMentorProfile = asyncHandler(async (req, res) => {
    const mentor = await Mentor.findOne({ userId: req.user._id }).populate(
        "userId",
        "profile.displayName profile.avatar profile.firstName profile.lastName email"
    );

    if (!mentor) {
        throw new ApiError(404, "Mentor profile not found. Register as a mentor first.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, mentor, "Mentor profile fetched successfully"));
});

/**
 * GET /api/v1/mentors/:mentorId
 */
const getMentorById = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;

    if (!mongoose.isValidObjectId(mentorId)) {
        throw new ApiError(400, "Invalid mentor ID format");
    }

    const mentor = await Mentor.findById(mentorId)
        .select("-pendingPayout -totalEarnings -lastPayoutAt -suspendReason -suspendedAt -verificationDetails")
        .populate(
            "userId",
            "profile.displayName profile.avatar profile.firstName profile.lastName academic.department academic.degree"
        );

    if (!mentor) throw new ApiError(404, "Mentor not found");
    if (!mentor.isActive || !mentor.verified) {
        const isAdmin = req.user?.roles?.includes("admin");
        if (!isAdmin) throw new ApiError(404, "Mentor not found");
    }

    const recentReviews = await MentorReview.find({ mentorId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
            path: "menteeId",
            select: "profile.displayName profile.avatar",
        });

    return res.status(200).json(
        new ApiResponse(200, { ...mentor.toObject({ virtuals: true }), recentReviews },
            "Mentor fetched successfully")
    );
});

/**
 * PUT /api/v1/mentors/availability
 */
const setAvailability = asyncHandler(async (req, res) => {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
        throw new ApiError(400, "availability must be an array of time slots");
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    for (const slot of availability) {
        if (slot.day === undefined || slot.day < 0 || slot.day > 6) {
            throw new ApiError(400, "Each slot must have day between 0 (Sunday) and 6 (Saturday)");
        }
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
            throw new ApiError(400, `Slot times must be HH:mm format. Got: ${slot.startTime} - ${slot.endTime}`);
        }
        if (slot.startTime >= slot.endTime) {
            throw new ApiError(400, `startTime must be before endTime for day ${slot.day}`);
        }
    }

    const mentor = await Mentor.findOne({ userId: req.user._id });
    if (!mentor) {
        throw new ApiError(404, "Mentor profile not found. Register as a mentor first.");
    }

    const updated = await Mentor.findByIdAndUpdate(
        mentor._id,
        { $set: { availability } },
        { new: true, runValidators: true }
    ).select("_id availability");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Availability updated successfully"));
});

/**
 * GET /api/v1/mentors/:mentorId/availability
 */
const getMentorAvailability = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    const { date } = req.query;

    const mentor = await findMentorById(mentorId, "availability isActive verified");

    if (!mentor.isActive || !mentor.verified) {
        const isAdmin = req.user?.roles?.includes("admin");
        if (!isAdmin) throw new ApiError(404, "Mentor not found");
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
            mentorId,
            status: { $in: ["pending", "confirmed"] },
            startAt: { $gte: weekStart, $lt: weekEnd },
        }).select("startAt endAt status");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            availability: mentor.availability,
            bookedSlots,
        }, "Availability fetched successfully")
    );
});

/**
 * POST /api/v1/mentors/:mentorId/book
 */
const bookSession = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    const { startAt, endAt, topic, notes } = req.body;

    if (!startAt || !endAt) {
        throw new ApiError(400, "startAt and endAt are required");
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ApiError(400, "Invalid date format for startAt or endAt");
    }
    if (start <= new Date()) {
        throw new ApiError(400, "Session must be scheduled in the future");
    }
    if (end <= start) {
        throw new ApiError(400, "endAt must be after startAt");
    }

    const durationMinutes = Math.round((end - start) / 60000);
    if (durationMinutes < 15) {
        throw new ApiError(400, "Minimum session duration is 15 minutes");
    }
    if (durationMinutes > 180) {
        throw new ApiError(400, "Maximum session duration is 3 hours (180 minutes)");
    }

    const mentor = await findMentorById(
        mentorId,
        "userId isActive verified availability hourlyRate currency campusId"
    );
    if (mentor.userId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot book a session with yourself");
    }

    if (!mentor.isActive || !mentor.verified) {
        throw new ApiError(400, "This mentor is not currently accepting bookings");
    }
    if (!isWithinAvailability(mentor.availability, start, end)) {
        throw new ApiError(
            400,
            "The requested time slot is outside the mentor's available hours. Check their availability calendar."
        );
    }
    const conflict = await hasBookingConflict(mentor._id, start, end);
    if (conflict) {
        throw new ApiError(
            409,
            "This time slot is already booked. Please choose a different time."
        );
    }
    const hourlyRate = mentor.hourlyRate || 0;
    const sessionFee = parseFloat(((hourlyRate / 60) * durationMinutes).toFixed(2));
    const platformFee = parseFloat((sessionFee * PLATFORM_FEE_RATE).toFixed(2));
    const mentorPayout = parseFloat((sessionFee - platformFee).toFixed(2));

    const booking = await MentorBooking.create({
        mentorId: mentor._id,
        mentorUserId: mentor.userId,
        menteeId: req.user._id,
        startAt: start,
        endAt: end,
        duration: durationMinutes,
        topic: topic?.trim() || "",
        notes: notes?.trim() || "",
        fee: sessionFee,
        currency: mentor.currency,
        platformFee,
        mentorPayout,
        status: "pending",
    });

    const created = await MentorBooking.findById(booking._id)
        .populate("mentorId", "userId hourlyRate currency tier averageRating")
        .populate("menteeId", "profile.displayName profile.avatar");

    return res
        .status(201)
        .json(new ApiResponse(201, created, "Session booked successfully. Awaiting mentor confirmation."));
});

/**
 * PATCH /api/v1/mentors/bookings/:bookingId/confirm
 */
const confirmBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await findBookingById(
        bookingId,
        "mentorId mentorUserId menteeId status startAt"
    );
    if (booking.mentorUserId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the mentor can confirm bookings");
    }

    if (booking.status !== "pending") {
        throw new ApiError(400, `Cannot confirm a booking with status "${booking.status}"`);
    }

    if (booking.startAt <= new Date()) {
        throw new ApiError(400, "Cannot confirm a booking that has already started");
    }

    const updated = await MentorBooking.findByIdAndUpdate(
        bookingId,
        { $set: { status: "confirmed", confirmedAt: new Date() } },
        { new: true }
    )
        .populate("mentorId", "userId tier averageRating")
        .populate("menteeId", "profile.displayName profile.avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Booking confirmed successfully"));
});

/**
 * PATCH /api/v1/mentors/bookings/:bookingId/cancel
 */
const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await findBookingById(
        bookingId,
        "mentorId mentorUserId menteeId status startAt"
    );

    const userId = req.user._id.toString();
    const isMentor = booking.mentorUserId.toString() === userId;
    const isMentee = booking.menteeId.toString() === userId;
    const isAdmin = req.user.roles?.includes("admin");

    if (!isMentor && !isMentee && !isAdmin) {
        throw new ApiError(403, "You are not a participant in this booking");
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
        throw new ApiError(400, `Cannot cancel a booking with status "${booking.status}"`);
    }

    if (isMentee && !isAdmin) {
        const hoursUntilStart = (booking.startAt - new Date()) / (1000 * 60 * 60);
        if (hoursUntilStart < CANCELLATION_WINDOW_HOURS) {
            throw new ApiError(
                400,
                `Cancellations must be made at least ${CANCELLATION_WINDOW_HOURS} hours before the session starts`
            );
        }
    }

    const updated = await MentorBooking.findByIdAndUpdate(
        bookingId,
        {
            $set: {
                status: "cancelled",
                cancelledAt: new Date(),
                cancelledBy: req.user._id,
                cancellationReason: reason?.trim() || "",
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Booking cancelled successfully"));
});

/**
 * PATCH /api/v1/mentors/bookings/:bookingId/complete
 */
const completeBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await findBookingById(
        bookingId,
        "mentorId mentorUserId menteeId status startAt mentorPayout"
    );

    if (booking.mentorUserId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the mentor can mark a session as completed");
    }

    if (booking.status !== "confirmed") {
        throw new ApiError(400, `Cannot complete a booking with status "${booking.status}". Session must be confirmed first.`);
    }

    if (booking.startAt > new Date()) {
        throw new ApiError(400, "Cannot complete a session that has not started yet");
    }

    const updated = await MentorBooking.findByIdAndUpdate(
        bookingId,
        { $set: { status: "completed", completedAt: new Date() } },
        { new: true }
    );

    await Mentor.findByIdAndUpdate(booking.mentorId, {
        $inc: { pendingPayout: booking.mentorPayout },
    });

    syncMentorStats(booking.mentorId).catch((err) =>
        console.error("[Mentor] Failed to sync stats after session complete:", err.message)
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Session marked as completed"));
});

/**
 * PATCH /api/v1/mentors/bookings/:bookingId/no-show
 */
const markNoShow = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await findBookingById(bookingId, "mentorUserId status startAt");

    if (booking.mentorUserId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the mentor can mark a no-show");
    }

    if (booking.status !== "confirmed") {
        throw new ApiError(400, `Cannot mark no-show for a booking with status "${booking.status}"`);
    }

    if (booking.startAt > new Date()) {
        throw new ApiError(400, "Cannot mark a no-show before the session start time");
    }

    const updated = await MentorBooking.findByIdAndUpdate(
        bookingId,
        { $set: { status: "no-show" } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Session marked as no-show"));
});

/**
 * GET /api/v1/mentors/bookings/my
 */
const getMyBookings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role = "all", status } = req.query;

    const filter = {};
    const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled", "no-show"];

    if (role === "mentor") {
        filter.mentorUserId = req.user._id;
    } else if (role === "mentee") {
        filter.menteeId = req.user._id;
    } else {
        filter.$or = [
            { mentorUserId: req.user._id },
            { menteeId: req.user._id },
        ];
    }

    if (status && VALID_STATUSES.includes(status)) {
        filter.status = status;
    }

    const result = await paginate(MentorBooking, filter, {
        page,
        limit,
        sort: { startAt: -1 },
        populate: [
            {
                path: "mentorId",
                select: "userId tier averageRating hourlyRate currency",
                populate: {
                    path: "userId",
                    select: "profile.displayName profile.avatar",
                },
            },
            {
                path: "menteeId",
                select: "profile.displayName profile.avatar profile.firstName profile.lastName",
            },
        ],
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Bookings fetched successfully"));
});

/**
 * GET /api/v1/mentors/bookings/:bookingId
 */
const getBookingById = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await findBookingById(bookingId);

    const userId = req.user._id.toString();
    const isAdmin = req.user.roles?.includes("admin");
    const isParticipant =
        booking.mentorUserId.toString() === userId ||
        booking.menteeId.toString() === userId;

    if (!isAdmin && !isParticipant) {
        throw new ApiError(403, "You are not a participant in this booking");
    }

    await MentorBooking.populate(booking, [
        {
            path: "mentorId",
            select: "userId tier averageRating hourlyRate currency",
            populate: { path: "userId", select: "profile.displayName profile.avatar" },
        },
        {
            path: "menteeId",
            select: "profile.displayName profile.avatar profile.firstName profile.lastName",
        },
        { path: "reviewId" },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, booking, "Booking fetched successfully"));
});

/**
 * POST /api/v1/mentors/bookings/:bookingId/review
 */
const submitReview = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { rating, comment, isAnonymous, detailedRatings } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be a number between 1 and 5");
    }

    const booking = await findBookingById(
        bookingId,
        "mentorId menteeId status reviewId"
    );

    if (booking.menteeId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the mentee can submit a review");
    }

    if (booking.status !== "completed") {
        throw new ApiError(400, "Reviews can only be submitted for completed sessions");
    }

    if (booking.reviewId) {
        throw new ApiError(409, "A review has already been submitted for this session");
    }

    const review = await MentorReview.create({
        bookingId: booking._id,
        mentorId: booking.mentorId,
        menteeId: req.user._id,
        rating: parseInt(rating, 10),
        comment: comment?.trim() || "",
        isAnonymous: isAnonymous === true || isAnonymous === "true",
        detailedRatings: detailedRatings || undefined,
    });

    await MentorBooking.findByIdAndUpdate(bookingId, {
        $set: { reviewId: review._id },
    });

    syncMentorStats(booking.mentorId).catch((err) =>
        console.error("[Mentor] Failed to sync stats after review:", err.message)
    );

    return res
        .status(201)
        .json(new ApiResponse(201, review, "Review submitted successfully"));
});

/**
 * GET /api/v1/mentors/:mentorId/reviews
 */
const getMentorReviews = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(mentorId)) {
        throw new ApiError(400, "Invalid mentor ID format");
    }

    const mentorExists = await Mentor.exists({ _id: mentorId });
    if (!mentorExists) throw new ApiError(404, "Mentor not found");

    const result = await paginate(MentorReview, { mentorId }, {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: [
            {
                path: "menteeId",
                select: "profile.displayName profile.avatar",
            },
        ],
    });

    result.docs = result.docs.map((review) => {
        const r = review.toObject ? review.toObject() : { ...review };
        if (r.isAnonymous) {
            r.menteeId = { profile: { displayName: "Anonymous", avatar: "" } };
        }
        return r;
    });

    const distribution = await MentorReview.aggregate([
        { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            ...result,
            distribution: Object.fromEntries(
                distribution.map(({ _id, count }) => [_id, count])
            ),
        }, "Reviews fetched successfully")
    );
});


/**
 * PATCH /api/v1/mentors/:mentorId/reviews/:reviewId/respond
 */
const respondToReview = asyncHandler(async (req, res) => {
    const { mentorId, reviewId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Response content is required");
    }

    const mentor = await findMentorById(mentorId, "userId");

    if (mentor.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the mentor can respond to their own reviews");
    }

    if (!mongoose.isValidObjectId(reviewId)) {
        throw new ApiError(400, "Invalid review ID format");
    }

    const review = await MentorReview.findOne({ _id: reviewId, mentorId });
    if (!review) throw new ApiError(404, "Review not found");

    if (review.mentorResponse?.content) {
        throw new ApiError(409, "You have already responded to this review");
    }

    const updated = await MentorReview.findByIdAndUpdate(
        reviewId,
        {
            $set: {
                "mentorResponse.content": content.trim(),
                "mentorResponse.respondedAt": new Date(),
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Response added to review"));
});

/**
 * PATCH /api/v1/mentors/:mentorId/verify
*/
const verifyMentor = asyncHandler(async (req, res) => {
    if (!req.user.roles?.includes("admin")) {
        throw new ApiError(403, "Only admins can verify mentor profiles");
    }

    const mentor = await findMentorById(req.params.mentorId, "verified userId");

    if (mentor.verified) {
        throw new ApiError(400, "Mentor is already verified");
    }

    const updated = await Mentor.findByIdAndUpdate(
        mentor._id,
        {
            $set: {
                verified: true,
                "verificationDetails.verifiedAt": new Date(),
                "verificationDetails.verifiedBy": req.user._id,
            },
        },
        { new: true }
    ).populate("userId", "profile.displayName profile.avatar");
    await User.findByIdAndUpdate(mentor.userId, {
        $set: {
            "mentorVerification.isVerified": true,
            "mentorVerification.verifiedAt": new Date(),
            "mentorVerification.verifiedBy": req.user._id,
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Mentor verified successfully"));
});

/**
 * PATCH /api/v1/mentors/:mentorId/suspend
 */
const suspendMentor = asyncHandler(async (req, res) => {
    if (!req.user.roles?.includes("admin")) {
        throw new ApiError(403, "Only admins can suspend mentor profiles");
    }

    const { reason } = req.body;
    const mentor = await findMentorById(req.params.mentorId, "isActive");

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
    ).select("-pendingPayout -totalEarnings");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Mentor suspended successfully"));
});

export {
    registerAsMentor,
    updateMentorProfile,
    getMentors,
    getMyMentorProfile,
    getMentorById,
    setAvailability,
    getMentorAvailability,
    bookSession,
    confirmBooking,
    cancelBooking,
    completeBooking,
    markNoShow,
    getMyBookings,
    getBookingById,
    submitReview,
    getMentorReviews,
    respondToReview,
    verifyMentor,
    suspendMentor,
};