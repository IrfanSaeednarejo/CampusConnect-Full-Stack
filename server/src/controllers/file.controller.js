import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { File, FILE_CONTEXTS } from "../models/file.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { paginate } from "../utils/paginate.js";
import fs from "fs";

/**
 * POST /api/v1/files/upload
 */
const uploadFile = asyncHandler(async (req, res) => {
    const { context, contextId, description, isPublic } = req.body;

    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    if (context && !FILE_CONTEXTS.includes(context)) {
        throw new ApiError(400, `Invalid context. Allowed values: ${FILE_CONTEXTS.join(", ")}`);
    }

    if (contextId && !mongoose.isValidObjectId(contextId)) {
        throw new ApiError(400, "Invalid contextId format");
    }

    const localFilePath = req.file.path;
    const mimeType = req.file.mimetype;
    const fileSize = req.file.size;
    const originalName = req.file.originalname;

    const cloudinaryResponse = await uploadOnCloudinary(localFilePath, `campusconnect/${context || "general"}`);

    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload file to Cloudinary");
    }

    const fileDoc = await File.create({
        userId: req.user._id,
        fileName: originalName,
        fileUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        mimeType,
        fileSize,
        context: context || "general",
        contextId: contextId || undefined,
        description: description?.trim() || "",
        isPublic: isPublic === true || isPublic === "true",
    });

    return res
        .status(201)
        .json(new ApiResponse(201, fileDoc, "File uploaded successfully"));
});

/**
 * GET /api/v1/files
 */
const getFiles = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, context, contextId, userId, mimeType } = req.query;

    const filter = {};

    if (context) {
        if (!FILE_CONTEXTS.includes(context)) {
            throw new ApiError(400, `Invalid context. Allowed values: ${FILE_CONTEXTS.join(", ")}`);
        }
        filter.context = context;
    }

    if (contextId) {
        if (!mongoose.isValidObjectId(contextId)) {
            throw new ApiError(400, "Invalid contextId format");
        }
        filter.contextId = contextId;
    }

    if (userId) {
        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId format");
        }
        filter.userId = userId;
    }

    if (mimeType) {
        filter.mimeType = { $regex: mimeType, $options: "i" };
    }

    const result = await paginate(File, filter, {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: [
            {
                path: "userId",
                select: "profile.displayName profile.avatar",
            },
        ],
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Files fetched successfully"));
});

/**
 * GET /api/v1/files/:fileId
 */
const getFileById = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

    if (!mongoose.isValidObjectId(fileId)) {
        throw new ApiError(400, "Invalid file ID format");
    }

    const file = await File.findById(fileId).populate("userId", "profile.displayName profile.avatar");

    if (!file) {
        throw new ApiError(404, "File not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, file, "File fetched successfully"));
});

/**
 * DELETE /api/v1/files/:fileId
 */
const deleteFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

    if (!mongoose.isValidObjectId(fileId)) {
        throw new ApiError(400, "Invalid file ID format");
    }
    const file = await File.findById(fileId).select("+publicId");

    if (!file) {
        throw new ApiError(404, "File not found");
    }

    const isAdmin = req.user.roles?.includes("admin");
    const isOwner = file.userId.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "You do not have permission to delete this file");
    }

    if (file.publicId) {
        const resourceType = file.mimeType.startsWith("video/") || file.mimeType.startsWith("audio/") ? "video" : "image";
        deleteFromCloudinary(file.publicId, resourceType === "image" ? "image" : "video").catch(err =>
            console.error("[FileController] Cloudinary deletion error:", err.message)
        );
    }

    await File.findByIdAndDelete(fileId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "File deleted successfully"));
});

export { uploadFile, getFiles, getFileById, deleteFile };