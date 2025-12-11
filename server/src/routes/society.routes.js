import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  getSocieties,
  getSocietyById,
  createSociety,
  updateSociety,
  deleteSociety,
  getSocietyMembers,
  addMemberToSociety,
  removeMemberFromSociety,
} from "../controllers/society.controller.js";

const router = Router();

//Public routes
router.get("/", getSocieties);
router.get("/:id", getSocietyById);

// Secured routes
router.post("/create-society", verifyJWT, upload.single("logo"), createSociety);
router.patch("/update/:id", verifyJWT, upload.single("logo"), updateSociety);
router.delete("/delete/:id", verifyJWT, deleteSociety);

//Society members related routes
router.get("/:id/members", getSocietyMembers);
router.post("/:id/members/add", verifyJWT, addMemberToSociety);
router.delete("/:id/members/remove/:memberId", verifyJWT, removeMemberFromSociety);

export default router;
