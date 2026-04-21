import { Router } from "express";
import { verifyJWT, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    getStudyGroups,
    getMyStudyGroups,
    getStudyGroupById,
    createStudyGroup,
    updateStudyGroup,
    deleteStudyGroup,
    archiveStudyGroup,
    joinStudyGroup,
    leaveStudyGroup,
    removeMember,
    updateMemberRole,
    addResource,
    removeResource,
    getResources,
    updateSchedule,
    approveMember,
    rejectMember,
} from "../controllers/studyGroup.controller.js";

const router = Router();

router
    .route("/")
    .get(optionalAuth, getStudyGroups)
    .post(verifyJWT, createStudyGroup);

router
    .route("/my")
    .get(verifyJWT, getMyStudyGroups);

router
    .route("/:id")
    .get(optionalAuth, getStudyGroupById)
    .patch(verifyJWT, updateStudyGroup)
    .delete(verifyJWT, deleteStudyGroup);


router
    .route("/:id/archive")
    .patch(verifyJWT, authorize("admin"), archiveStudyGroup);


router
    .route("/:id/schedule")
    .put(verifyJWT, updateSchedule);


router
    .route("/:id/join")
    .post(verifyJWT, joinStudyGroup);

router
    .route("/:id/leave")
    .post(verifyJWT, leaveStudyGroup);


router
    .route("/:id/members/:memberId")
    .delete(verifyJWT, removeMember);

router
    .route("/:id/members/:memberId/role")
    .patch(verifyJWT, updateMemberRole);

router
    .route("/:id/members/:memberUserId/approve")
    .patch(verifyJWT, approveMember);

router
    .route("/:id/members/:memberUserId/reject")
    .patch(verifyJWT, rejectMember);

router
    .route("/:id/resources")
    .get(verifyJWT, getResources)
    .post(verifyJWT, upload.single("file"), addResource);

router
    .route("/:id/resources/:resourceId")
    .delete(verifyJWT, removeResource);

export default router;