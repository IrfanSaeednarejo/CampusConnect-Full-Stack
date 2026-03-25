import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as fileService from "../services/file.service.js";

const uploadFile = asyncHandler(async (req, res) => {
    const fileDoc = await fileService.uploadFile(req.body, req.file, req.user);
    return res.status(201).json(new ApiResponse(201, fileDoc, "File uploaded successfully"));
});

const getFiles = asyncHandler(async (req, res) => {
    const result = await fileService.getFiles(req.query);
    return res.status(200).json(new ApiResponse(200, result, "Files fetched successfully"));
});

const getFileById = asyncHandler(async (req, res) => {
    const file = await fileService.getFileById(req.params.fileId);
    return res.status(200).json(new ApiResponse(200, file, "File fetched successfully"));
});

const deleteFile = asyncHandler(async (req, res) => {
    await fileService.deleteFile(req.params.fileId, req.user);
    return res.status(200).json(new ApiResponse(200, {}, "File deleted successfully"));
});

export { uploadFile, getFiles, getFileById, deleteFile };