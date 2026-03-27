import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { File, FILE_CONTEXTS } from "../models/file.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { paginate } from "../utils/paginate.js";

export const uploadFile = async (data, file, requestUser) => {
    const { context, contextId, description, isPublic } = data;

    if (!file) {
        throw new ApiError(400, "No file uploaded");
    }

    if (context && !FILE_CONTEXTS.includes(context)) {
        throw new ApiError(400, `Invalid context. Allowed values: ${FILE_CONTEXTS.join(", ")}`);
    }

    if (contextId && !mongoose.isValidObjectId(contextId)) {
        throw new ApiError(400, "Invalid contextId format");
    }

    const localFilePath = file.path;
    const mimeType = file.mimetype;
    const fileSize = file.size;
    const originalName = file.originalname;

    const cloudinaryResponse = await uploadOnCloudinary(localFilePath, `campusconnect/${context || "general"}`);

    if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload file to Cloudinary");
    }

    return await File.create({
        userId: requestUser._id,
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
};

export const getFiles = async (queryParams) => {
    const { page = 1, limit = 20, context, contextId, userId, mimeType } = queryParams;

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

    return await paginate(File, filter, {
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
};

export const getFileById = async (fileId) => {
    if (!mongoose.isValidObjectId(fileId)) {
        throw new ApiError(400, "Invalid file ID format");
    }

    const file = await File.findById(fileId).populate("userId", "profile.displayName profile.avatar");

    if (!file) {
        throw new ApiError(404, "File not found");
    }

    return file;
};

export const deleteFile = async (fileId, requestUser) => {
    if (!mongoose.isValidObjectId(fileId)) {
        throw new ApiError(400, "Invalid file ID format");
    }

    const file = await File.findById(fileId).select("+publicId");

    if (!file) {
        throw new ApiError(404, "File not found");
    }

    const isAdmin = requestUser.roles?.includes("admin");
    const isOwner = file.userId.toString() === requestUser._id.toString();

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "You do not have permission to delete this file");
    }

    if (file.publicId) {
        const resourceType = file.mimeType.startsWith("video/") || file.mimeType.startsWith("audio/") ? "video" : "image";
        deleteFromCloudinary(file.publicId, resourceType === "image" ? "image" : "video").catch(err =>
            console.error("[FileService] Cloudinary deletion error:", err.message)
        );
    }

    await File.findByIdAndDelete(fileId);
    return true;
};
