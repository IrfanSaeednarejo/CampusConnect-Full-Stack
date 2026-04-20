import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new ApiError(401, "Token has expired");
        }
        throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(decoded?._id).select(
        "-password -refreshToken -lastLoginIp"
    );
    
    if (!user) {
        throw new ApiError(401, "Invalid access token: user record deleted or missing");
    }

    // CRITICAL: Block suspended users immediately
    if (user.status === "suspended") {
        throw new ApiError(403, user.suspendReason || "Your account has been suspended by an administrator.");
    }

    // CRITICAL: Force Logout Check (Session Versioning)
    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined) {
        if (decoded.tokenVersion !== user.tokenVersion) {
            throw new ApiError(401, "Session expired: Your access has been invalidated by a system administrator.");
        }
    }

    req.user = user;
    next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select(
            "-password -refreshToken"
        );
        req.user = user || null;
    } catch (err) {
        req.user = null;
    }

    next();
});
