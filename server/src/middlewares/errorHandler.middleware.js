import { ApiError } from "../utils/ApiError.js";

/**
 * Global Express error-handling middleware.
 * Must be registered AFTER all routes in app.js.
 *
 * Handles:
 *  - ApiError instances  (custom app errors)
 *  - Mongoose ValidationError
 *  - Mongoose CastError   (invalid ObjectId, etc.)
 *  - Duplicate-key errors  (code 11000)
 *  - JWT errors
 *  - Multer errors
 *  - Everything else       (500 Internal Server Error)
 */
const errorHandler = (err, _req, res, _next) => {
    // ── Already an ApiError ───────────────────────────────────────────
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
        });
    }

    // ── Mongoose Validation Error ─────────────────────────────────────
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: messages,
        });
    }

    // ── Mongoose CastError (invalid ObjectId, etc.) ──────────────────
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`,
            errors: [],
        });
    }

    // ── Mongoose / MongoDB duplicate key ─────────────────────────────
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return res.status(409).json({
            success: false,
            message: `Duplicate value for "${field}" — that value is already in use`,
            errors: [],
        });
    }

    // ── JWT errors ───────────────────────────────────────────────────
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
            errors: [],
        });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token has expired",
            errors: [],
        });
    }

    // ── Multer errors ────────────────────────────────────────────────
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            success: false,
            message: "File is too large — maximum size is 10 MB",
            errors: [],
        });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            success: false,
            message: `Unexpected file field: "${err.field}"`,
            errors: [],
        });
    }

    // ── Fallback: generic 500 ────────────────────────────────────────
    console.error("UNHANDLED ERROR:", err);

    return res.status(500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : err.message || "Internal server error",
        errors: [],
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

export { errorHandler };
