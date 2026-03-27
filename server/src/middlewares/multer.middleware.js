import multer from "multer";
import crypto from "crypto";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

// ── Allowed MIME types ──────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Text / Code
    "text/plain",
    "text/csv",
    "text/markdown",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    // Video (for mentor session recordings, event coverage)
    "video/mp4",
    "video/webm",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
]);

// ── Size limit ──────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ── Storage config ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, "./public/temp");
    },
    filename(_req, file, cb) {
        const uniqueId = crypto.randomUUID();
        const ext = path.extname(file.originalname) || "";
        cb(null, `${uniqueId}${ext}`);
    },
});

// ── File filter ─────────────────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new ApiError(
                400,
                `File type "${file.mimetype}" is not allowed. Accepted types: images, documents, videos, audio, and archives.`
            ),
            false
        );
    }
};

// ── Multer instance ─────────────────────────────────────────────────────────
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});
