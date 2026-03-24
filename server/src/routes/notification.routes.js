import { Router } from "express";
import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);


router
    .route("/")
    .get(getMyNotifications);

router
    .route("/unread-count")
    .get(getUnreadCount);

router
    .route("/read-all")
    .patch(markAllAsRead);


router
    .route("/:id")
    .delete(deleteNotification);

router
    .route("/:id/read")
    .patch(markAsRead);

export default router;