import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openAuth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

import {
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
} from "../controllers/mentor.controller.js";

const router = Router();

router
    .route("/")
    .get(checkUser, getMentors);

router
    .route("/me")
    .get(verifyJWT, getMyMentorProfile);

router
    .route("/profile")
    .patch(
        verifyJWT,
        authorize("mentor", "admin"),
        updateMentorProfile
    );

router
    .route("/availability")
    .put(
        verifyJWT,
        authorize("mentor", "admin"),
        setAvailability
    );
router
    .route("/bookings/my")
    .get(verifyJWT, getMyBookings);

router
    .route("/bookings/:bookingId")
    .get(verifyJWT, getBookingById);

router
    .route("/bookings/:bookingId/confirm")
    .patch(
        verifyJWT,
        authorize("mentor", "admin"),
        confirmBooking
    );

router
    .route("/bookings/:bookingId/cancel")
    .patch(verifyJWT, cancelBooking);

router
    .route("/bookings/:bookingId/complete")
    .patch(
        verifyJWT,
        authorize("mentor", "admin"),
        completeBooking
    );

router
    .route("/bookings/:bookingId/no-show")
    .patch(
        verifyJWT,
        authorize("mentor", "admin"),
        markNoShow
    );

router
    .route("/bookings/:bookingId/review")
    .post(verifyJWT, submitReview);

router
    .route("/register")
    .post(verifyJWT, registerAsMentor);
router
    .route("/:mentorId")
    .get(checkUser, getMentorById);

router
    .route("/:mentorId/availability")
    .get(checkUser, getMentorAvailability);

router
    .route("/:mentorId/book")
    .post(verifyJWT, bookSession);

router
    .route("/:mentorId/reviews")
    .get(checkUser, getMentorReviews);

router
    .route("/:mentorId/reviews/:reviewId/respond")
    .patch(
        verifyJWT,
        authorize("mentor", "admin"),
        respondToReview
    );

router
    .route("/:mentorId/verify")
    .patch(
        verifyJWT,
        authorize("admin"),
        verifyMentor
    );

router
    .route("/:mentorId/suspend")
    .patch(
        verifyJWT,
        authorize("admin"),
        suspendMentor
    );

export default router;