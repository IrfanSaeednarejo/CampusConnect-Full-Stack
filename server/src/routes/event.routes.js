import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openAuth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    getEvents,
    getUpcomingEvents,
    getEventById,
    getEventAttendees,
    getMyRegisteredEvents,
    getMyCreatedEvents,
    createEvent,
    updateEvent,
    publishEvent,
    cancelEvent,
    completeEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    submitFeedback,
    getEventFeedback,
} from "../controllers/event.controller.js";

const router = Router();

router
    .route("/")
    .get(checkUser, getEvents)
    .post(
        verifyJWT,
        authorize("society_head", "admin"),
        upload.single("coverImage"),
        createEvent
    );

router
    .route("/upcoming")
    .get(checkUser, getUpcomingEvents);


router
    .route("/my/registered")
    .get(verifyJWT, getMyRegisteredEvents);

router
    .route("/my/created")
    .get(
        verifyJWT,
        authorize("society_head", "admin"),
        getMyCreatedEvents
    );

router
    .route("/:eventId")
    .get(checkUser, getEventById)
    .patch(
        verifyJWT,
        authorize("society_head", "admin"),
        upload.single("coverImage"),
        updateEvent
    )
    .delete(
        verifyJWT,
        authorize("society_head", "admin"),
        deleteEvent
    );


router
    .route("/:eventId/publish")
    .patch(
        verifyJWT,
        authorize("society_head", "admin"),
        publishEvent
    );

router
    .route("/:eventId/cancel")
    .patch(
        verifyJWT,
        authorize("society_head", "admin"),
        cancelEvent
    );

router
    .route("/:eventId/complete")
    .patch(
        verifyJWT,
        authorize("society_head", "admin"),
        completeEvent
    );

router
    .route("/:eventId/attendees")
    .get(
        verifyJWT,
        authorize("society_head", "admin"),
        getEventAttendees
    );

router
    .route("/:eventId/register")
    .post(verifyJWT, registerForEvent)
    .delete(verifyJWT, unregisterFromEvent);


router
    .route("/:eventId/feedback")
    .post(verifyJWT, submitFeedback)
    .get(
        verifyJWT,
        authorize("society_head", "admin"),
        getEventFeedback
    );

export default router;