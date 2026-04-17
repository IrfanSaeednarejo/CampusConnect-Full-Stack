import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
    getAllUsers,
    updateUserRole,
    toggleUserSuspension,
    getPendingSocieties,
    updateSocietyStatus,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require JWT and "admin" role
router.use(verifyJWT, authorize("admin"));

router.get("/users", getAllUsers);
router.patch("/users/role", updateUserRole);
router.patch("/users/:userId/suspend", toggleUserSuspension);

router.get("/societies/pending", getPendingSocieties);
router.patch("/societies/:societyId/status", updateSocietyStatus);

export default router;
