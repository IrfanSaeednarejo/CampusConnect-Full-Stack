import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openAuth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  getSocieties,
  getSocietyById,
  getSocietyMembers,
  getSocietyStats,
  createSociety,
  updateSociety,
  deleteSociety,
  joinSociety,
  leaveSociety,
  addMemberToSociety,
  removeMemberFromSociety,
  updateMemberRole,
  approveMember,
  rejectMember,
} from "../controllers/society.controller.js";

const router = Router();

router.get("/", checkUser, getSocieties);

router.get("/:id", checkUser, getSocietyById);

router.post(
  "/create-society",
  verifyJWT,
  authorize("society_head", "admin"),
  upload.single("logo"),
  createSociety
);

router.patch(
  "/update/:id",
  verifyJWT,
  authorize("society_head", "admin"),
  upload.single("logo"),
  updateSociety
);

router.delete(
  "/delete/:id",
  verifyJWT,
  authorize("society_head", "admin"),
  deleteSociety
);

router.get(
  "/:id/stats",
  verifyJWT,
  authorize("society_head", "admin"),
  getSocietyStats
);

router.post("/:id/join", verifyJWT, joinSociety);

router.post("/:id/leave", verifyJWT, leaveSociety);

router.get("/:id/members", verifyJWT, getSocietyMembers);

router.post(
  "/:id/members/add",
  verifyJWT,
  authorize("society_head", "admin"),
  addMemberToSociety
);

router.delete(
  "/:id/members/remove/:memberId",
  verifyJWT,
  authorize("society_head", "admin"),
  removeMemberFromSociety
);

router.patch(
  "/:id/members/:memberId/role",
  verifyJWT,
  authorize("society_head", "admin"),
  updateMemberRole
);

router.patch(
  "/:id/members/:memberId/approve",
  verifyJWT,
  authorize("society_head", "admin"),
  approveMember
);

router.patch(
  "/:id/members/:memberId/reject",
  verifyJWT,
  authorize("society_head", "admin"),
  rejectMember
);

export default router;