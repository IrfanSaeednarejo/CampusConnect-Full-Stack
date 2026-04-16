import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createNote,
    getMyNotes,
    getNoteById,
    updateNote,
    deleteNote,
} from "../controllers/note.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createNote)
    .get(getMyNotes);

router.route("/:id")
    .get(getNoteById)
    .patch(updateNote)
    .delete(deleteNote);

export default router;
