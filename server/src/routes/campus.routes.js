import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openAuth.middleware.js";

import {
    getAllCampuses,
    getFacilitiesList,
    getCampusById,
    getCampusBySlug,
    getCampusSocieties,
    createCampus,
    updateCampusStatus,
    assignCampusAdmin,
    removeCampusAdmin,
    deleteCampus,
    updateCampus,
    updateCampusLogo,
    updateCampusCoverImage,
    getCampusStats,
    getCampusUsers,
} from "../controllers/campus.controller.js";

const router = Router();

router
    .route("/")
    .get(checkUser, getAllCampuses)
    .post(
        verifyJWT,
        upload.fields([
            { name: "logo", maxCount: 1 },
            { name: "coverImage", maxCount: 1 },
        ]),
        createCampus
    );

router
    .route("/facilities")
    .get(getFacilitiesList);

router
    .route("/id/:id")
    .get(checkUser, getCampusById);

router
    .route("/:slug")
    .get(checkUser, getCampusBySlug)
    .patch(verifyJWT, updateCampus)
    .delete(verifyJWT, deleteCampus);

router
    .route("/:slug/status")
    .patch(verifyJWT, updateCampusStatus);

router
    .route("/:slug/admin")
    .patch(verifyJWT, assignCampusAdmin)
    .delete(verifyJWT, removeCampusAdmin);

router
    .route("/:slug/logo")
    .patch(verifyJWT, upload.single("logo"), updateCampusLogo);

router
    .route("/:slug/cover")
    .patch(verifyJWT, upload.single("coverImage"), updateCampusCoverImage);

router
    .route("/:slug/stats")
    .get(verifyJWT, getCampusStats);

router
    .route("/:slug/users")
    .get(verifyJWT, getCampusUsers);

router
    .route("/:slug/societies")
    .get(checkUser, getCampusSocieties);

export default router;