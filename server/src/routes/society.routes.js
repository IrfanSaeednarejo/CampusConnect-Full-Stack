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

router
  .route("/")
  .get(checkUser, getSocieties);

router
  .route("/create-society")
  .post(
    verifyJWT,
    authorize("society_head", "admin"),
    upload.single("logo"),
    createSociety
  );

router
  .route("/:id")
  .get(checkUser, getSocietyById);

router
  .route("/update/:id")
  .patch(
    verifyJWT,
    authorize("society_head", "admin"),
    upload.single("logo"),
    updateSociety
  );

router
  .route("/delete/:id")
  .delete(
    verifyJWT,
    authorize("society_head", "admin"),
    deleteSociety
  );

router
  .route("/:id/stats")
  .get(
    verifyJWT,
    authorize("society_head", "admin"),
    getSocietyStats
  );


router
  .route("/:id/join")
  .post(verifyJWT, joinSociety);

router
  .route("/:id/leave")
  .post(verifyJWT, leaveSociety);

router
  .route("/:id/members")
  .get(verifyJWT, getSocietyMembers);

router
  .route("/:id/members/add")
  .post(
    verifyJWT,
    authorize("society_head", "admin"),
    addMemberToSociety
  );

router
  .route("/:id/members/remove/:memberId")
  .delete(
    verifyJWT,
    authorize("society_head", "admin"),
    removeMemberFromSociety
  );

router
  .route("/:id/members/:memberId/role")
  .patch(
    verifyJWT,
    authorize("society_head", "admin"),
    updateMemberRole
  );

router
  .route("/:id/members/:memberId/approve")
  .patch(
    verifyJWT,
    authorize("society_head", "admin"),
    approveMember
  );

router
  .route("/:id/members/:memberId/reject")
  .patch(
    verifyJWT,
    authorize("society_head", "admin"),
    rejectMember
  );

export default router;