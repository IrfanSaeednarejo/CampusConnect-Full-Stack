import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { JWT_SECRET } from "../config/envConfig.js";

/**
 * Generates a signed JWT token.
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const createAdminUser = async (data) => {
    const { name, email, password } = data;

    if (!name || !email || !password) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "Admin user already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        roles: ["admin"],  // Default role for admin user
        isVerified: true,
    });

    const payload = {
        _id: user._id,
        roles: user.roles,
        campusId: user.campusId,
        permissions: { write: true }
    };

    const token = generateToken(payload);

    return { user, token };
};
