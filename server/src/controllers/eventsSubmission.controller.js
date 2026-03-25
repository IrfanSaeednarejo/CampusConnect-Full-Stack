import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as submissionService from "../services/eventsSubmission.service.js";

const upsertSubmission = asyncHandler(async (req, res) => {
    const io = req.app.get("io");
    const { submission, isCreated } = await submissionService.upsertSubmission(req.params.eventId, req.body, io, req.user);
    const statusCode = isCreated ? 201 : 200;
    const message = isCreated ? "Submission created" : `Submission updated (version ${submission.version})`;
    return res.status(statusCode).json(new ApiResponse(statusCode, submission, message));
});

const getSubmissions = asyncHandler(async (req, res) => {
    const result = await submissionService.getSubmissions(req.params.eventId, req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Submissions fetched successfully"));
});

const getMySubmission = asyncHandler(async (req, res) => {
    const submission = await submissionService.getMySubmission(req.params.eventId, req.user);
    return res.status(200).json(new ApiResponse(200, submission, submission ? "Submission fetched" : "No submission found"));
});

const getSubmissionById = asyncHandler(async (req, res) => {
    const submission = await submissionService.getSubmissionById(req.params.eventId, req.params.subId, req.user);
    return res.status(200).json(new ApiResponse(200, submission, "Submission fetched"));
});

const addFileToSubmission = asyncHandler(async (req, res) => {
    const result = await submissionService.addFileToSubmission(req.params.eventId, req.file, req.user);
    return res.status(201).json(new ApiResponse(201, result, "File uploaded and attached to submission"));
});

const removeFileFromSubmission = asyncHandler(async (req, res) => {
    const removedFileId = await submissionService.removeFileFromSubmission(req.params.eventId, req.params.fileId, req.user);
    return res.status(200).json(new ApiResponse(200, { removedFileId }, "File removed from submission"));
});

export {
    upsertSubmission,
    getSubmissions,
    getMySubmission,
    getSubmissionById,
    addFileToSubmission,
    removeFileFromSubmission,
};