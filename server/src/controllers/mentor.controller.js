import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as mentoringService from "../services/mentoring.service.js";

const registerAsMentor = asyncHandler(async (req, res) => {
    const created = await mentoringService.registerAsMentor(req.body, req.user);
    return res.status(201).json(new ApiResponse(201, created, "Mentor profile created. Pending admin verification."));
});

const updateMentorProfile = asyncHandler(async (req, res) => {
    const updated = await mentoringService.updateMentorProfile(req.body, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Mentor profile updated successfully"));
});

const getMentors = asyncHandler(async (req, res) => {
    const result = await mentoringService.getMentors(req.query);
    return res.status(200).json(new ApiResponse(200, result, "Mentors fetched successfully"));
});

const getMyMentorProfile = asyncHandler(async (req, res) => {
    const mentor = await mentoringService.getMyMentorProfile(req.user);
    return res.status(200).json(new ApiResponse(200, mentor, "Mentor profile fetched successfully"));
});

const getMentorById = asyncHandler(async (req, res) => {
    const mentor = await mentoringService.getMentorById(req.params.mentorId, req.user);
    return res.status(200).json(new ApiResponse(200, mentor, "Mentor fetched successfully"));
});

const setAvailability = asyncHandler(async (req, res) => {
    const updated = await mentoringService.setAvailability(req.body, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Availability updated successfully"));
});

const getMentorAvailability = asyncHandler(async (req, res) => {
    const data = await mentoringService.getMentorAvailability(req.params.mentorId, req.query, req.user);
    return res.status(200).json(new ApiResponse(200, data, "Availability fetched successfully"));
});

const bookSession = asyncHandler(async (req, res) => {
    const created = await mentoringService.bookSession(req.params.mentorId, req.body, req.user);
    return res.status(201).json(new ApiResponse(201, created, "Session booked successfully. Awaiting mentor confirmation."));
});

const confirmBooking = asyncHandler(async (req, res) => {
    const updated = await mentoringService.confirmBooking(req.params.bookingId, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Booking confirmed successfully"));
});

const cancelBooking = asyncHandler(async (req, res) => {
    const updated = await mentoringService.cancelBooking(req.params.bookingId, req.body.reason, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Booking cancelled successfully"));
});

const completeBooking = asyncHandler(async (req, res) => {
    const updated = await mentoringService.completeBooking(req.params.bookingId, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Session marked as completed"));
});

const markNoShow = asyncHandler(async (req, res) => {
    const updated = await mentoringService.markNoShow(req.params.bookingId, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Session marked as no-show"));
});

const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await mentoringService.getMyBookings(req.query, req.user);
    return res.status(200).json(new ApiResponse(200, bookings, "Bookings fetched successfully"));
});

const getBookingById = asyncHandler(async (req, res) => {
    const booking = await mentoringService.getBookingById(req.params.bookingId, req.user);
    return res.status(200).json(new ApiResponse(200, booking, "Booking fetched successfully"));
});

const submitReview = asyncHandler(async (req, res) => {
    const review = await mentoringService.submitReview(req.params.bookingId, req.body, req.user);
    return res.status(201).json(new ApiResponse(201, review, "Review submitted successfully"));
});

const getMentorReviews = asyncHandler(async (req, res) => {
    const reviews = await mentoringService.getMentorReviews(req.params.mentorId, req.query);
    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

const respondToReview = asyncHandler(async (req, res) => {
    const updated = await mentoringService.respondToReview(req.params.mentorId, req.params.reviewId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Response added to review"));
});

const verifyMentor = asyncHandler(async (req, res) => {
    const updated = await mentoringService.verifyMentor(req.params.mentorId, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Mentor verified successfully"));
});

const suspendMentor = asyncHandler(async (req, res) => {
    const updated = await mentoringService.suspendMentor(req.params.mentorId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Mentor suspended successfully"));
});

export {
    registerAsMentor, updateMentorProfile, getMentors, getMyMentorProfile, getMentorById,
    setAvailability, getMentorAvailability, bookSession, confirmBooking, cancelBooking,
    completeBooking, markNoShow, getMyBookings, getBookingById, submitReview,
    getMentorReviews, respondToReview, verifyMentor, suspendMentor,
};