import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Society } from "../models/society.model.js";

const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } }
        ];
    }

    const users = await User.find(query)
        .select("-password")
        .sort("-createdAt")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = await User.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: page
            }
        }, "Users fetched successfully")
    );
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    
    if (!["student", "mentor", "society_head", "admin"].includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { role } },
        { new: true }
    ).select("-password");

    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponse(200, user, "User role updated successfully")
    );
});

const toggleUserSuspension = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) throw new ApiError(404, "User not found");
    
    user.isSuspended = !user.isSuspended;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user, `User ${user.isSuspended ? "suspended" : "activated"} successfully`)
    );
});

const getPendingSocieties = asyncHandler(async (req, res) => {
    const societies = await Society.find({ status: "pending" })
        .populate("createdBy", "name email");
    
    return res.status(200).json(
        new ApiResponse(200, societies, "Pending societies fetched successfully")
    );
});

const updateSocietyStatus = asyncHandler(async (req, res) => {
    const { societyId } = req.params;
    const { status, reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const society = await Society.findById(societyId);
    if (!society) throw new ApiError(404, "Society not found");

    society.status = status;
    // Optionally handle reason for rejection in a separate field if it exists
    await society.save();

    return res.status(200).json(
        new ApiResponse(200, society, `Society ${status} successfully`)
    );
});

export {
    getAllUsers,
    updateUserRole,
    toggleUserSuspension,
    getPendingSocieties,
    updateSocietyStatus
};