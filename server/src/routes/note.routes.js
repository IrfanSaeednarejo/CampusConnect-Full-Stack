import express from "express";
import {
    getNotes,
    createNote,
    deleteNote,
    toggleShare,
    incrementDownload
} from "../controllers/note.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All note routes are protected
router.use(verifyJWT);

router.route("/")
    .get(getNotes)
    .post(createNote);

router.route("/:id")
    .delete(deleteNote);

router.patch("/:id/share", toggleShare);
router.patch("/:id/download", incrementDownload);

export default router;
