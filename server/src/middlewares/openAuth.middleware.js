import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const checkUser = asyncHandler(async (req, _res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded._id).select(
            "-password -refreshToken"
        );

        if (user) {
            req.user = user;
        }
    } catch (_err) {
    }

    next();
});
