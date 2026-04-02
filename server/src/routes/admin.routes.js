import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
    getStats,
    getUsers,
    getUser,
    updateRoles,
    suspendUser,
    unsuspendUser,
    deleteUser,
    getPendingMentors,
    approveMentor,
    rejectMentor,
    getPendingSocietyHeads,
    approveSocietyHead,
    rejectSocietyHead,
    getSocieties,
    deleteSociety,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyJWT, authorize("admin"));

// Platform stats
router.get("/stats", getStats);

// User management
router.route("/users")
    .get(getUsers);

router.route("/users/:id")
    .get(getUser)
    .delete(deleteUser);

router.patch("/users/:id/roles", updateRoles);
router.post("/users/:id/suspend", suspendUser);
router.post("/users/:id/unsuspend", unsuspendUser);

// Mentor verification
router.get("/mentor-applications/pending", getPendingMentors);
router.post("/mentor-applications/:id/approve", approveMentor);
router.post("/mentor-applications/:id/reject", rejectMentor);

// Society head verification
router.get("/society-head-applications/pending", getPendingSocietyHeads);
router.post("/society-head-applications/:id/approve", approveSocietyHead);
router.post("/society-head-applications/:id/reject", rejectSocietyHead);

// Society oversight
router.get("/societies", getSocieties);
router.delete("/societies/:id", deleteSociety);

export default router;
