import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            success: false,
            data: null,
            message: err.message,
            errors: err.errors,
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
        });
    }

    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            statusCode: 400,
            success: false,
            data: null,
            message: "Validation failed",
            errors: messages,
        });
    }
    if (err.name === "CastError") {
        return res.status(400).json({
            statusCode: 400,
            success: false,
            data: null,
            message: `Invalid ${err.path}: ${err.value}`,
            errors: [],
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return res.status(409).json({
            statusCode: 409,
            success: false,
            data: null,
            message: `Duplicate value for "${field}" — that value is already in use`,
            errors: [],
        });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            statusCode: 401,
            success: false,
            data: null,
            message: "Invalid token",
            errors: [],
        });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            statusCode: 401,
            success: false,
            data: null,
            message: "Token has expired",
            errors: [],
        });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            statusCode: 413,
            success: false,
            data: null,
            message: "File is too large — maximum size is 10 MB",
            errors: [],
        });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            statusCode: 400,
            success: false,
            data: null,
            message: `Unexpected file field: "${err.field}"`,
            errors: [],
        });
    }

    console.error("UNHANDLED ERROR:", err);

    return res.status(500).json({
        statusCode: 500,
        success: false,
        data: null,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : err.message || "Internal server error",
        errors: [],
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

export { errorHandler };
