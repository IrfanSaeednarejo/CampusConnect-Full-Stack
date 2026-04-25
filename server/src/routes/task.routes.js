import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createTask,
    getMyTasks,
    getTaskById,
    updateTask,
    completeTask,
    deleteTask,
} from "../controllers/task.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/")
    .get(getMyTasks)
    .post(createTask);

router.route("/:id")
    .get(getTaskById)
    .patch(updateTask)
    .delete(deleteTask);

router.patch("/:id/complete", completeTask);

export default router;
