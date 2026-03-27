import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
} from "../controllers/studyGroup.controller.js";

const router = Router();

router.use(verifyJWT);


router
    .route("/")
    .get(getStudyGroups)
    .post(createStudyGroup);

router
    .route("/my")
    .get(getMyStudyGroups);

router
    .route("/:id")
    .get(getStudyGroupById)
    .patch(updateStudyGroup)
    .delete(deleteStudyGroup);


router
    .route("/:id/archive")
    .patch(authorize("admin"), archiveStudyGroup);


router
    .route("/:id/schedule")
    .put(updateSchedule);


router
    .route("/:id/join")
    .post(joinStudyGroup);

router
    .route("/:id/leave")
    .post(leaveStudyGroup);


router
    .route("/:id/members/:memberId")
    .delete(removeMember);

router
    .route("/:id/members/:memberId/role")
    .patch(updateMemberRole);

router
    .route("/:id/resources")
    .get(getResources)
    .post(upload.single("file"), addResource);

router
    .route("/:id/resources/:resourceId")
    .delete(removeResource);

export default router;