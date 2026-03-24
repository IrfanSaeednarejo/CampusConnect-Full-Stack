import { Router } from "express";
import {
    uploadFile,
    getFiles,
    getFileById,
    deleteFile,
} from "../controllers/file.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/upload", upload.single("file"), uploadFile);

router.get("/", getFiles);
router.get("/:fileId", getFileById);
router.delete("/:fileId", deleteFile);

export default router;
