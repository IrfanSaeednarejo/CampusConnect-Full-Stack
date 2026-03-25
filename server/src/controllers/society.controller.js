import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as societyService from "../services/society.service.js";

const getSocieties = asyncHandler(async (req, res) => {
    const result = await societyService.getSocieties(req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Societies fetched successfully"));
});

const getSocietyById = asyncHandler(async (req, res) => {
    const society = await societyService.getSocietyById(req.params.id);
    return res.status(200).json(new ApiResponse(200, society, "Society fetched successfully"));
});

const getSocietyMembers = asyncHandler(async (req, res) => {
    const members = await societyService.getSocietyMembers(req.params.id, req.query);
    return res.status(200).json(new ApiResponse(200, members, "Society members fetched successfully"));
});

const getSocietyStats = asyncHandler(async (req, res) => {
    const stats = await societyService.getSocietyStats(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, stats, "Society stats fetched successfully"));
});

const createSociety = asyncHandler(async (req, res) => {
    const created = await societyService.createSociety(req.body, req.file, req.user);
    return res.status(201).json(new ApiResponse(201, created, "Society created successfully"));
});

const updateSociety = asyncHandler(async (req, res) => {
    const updated = await societyService.updateSociety(req.params.id, req.body, req.file, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Society updated successfully"));
});

const deleteSociety = asyncHandler(async (req, res) => {
    const result = await societyService.deleteSociety(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Society deleted successfully"));
});

const joinSociety = asyncHandler(async (req, res) => {
    const { status, message, isNew } = await societyService.joinSociety(req.params.id, req.user);
    return res.status(isNew ? 201 : 200).json(new ApiResponse(isNew ? 201 : 200, { status }, message));
});

const leaveSociety = asyncHandler(async (req, res) => {
    await societyService.leaveSociety(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, null, "You have left the society"));
});

const addMemberToSociety = asyncHandler(async (req, res) => {
    const updated = await societyService.addMemberToSociety(req.params.id, req.body, req.user);
    return res.status(201).json(new ApiResponse(201, updated, "Member added successfully"));
});

const removeMemberFromSociety = asyncHandler(async (req, res) => {
    const result = await societyService.removeMemberFromSociety(req.params.id, req.params.memberId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Member removed successfully"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
    const result = await societyService.updateMemberRole(req.params.id, req.params.memberId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, result, `Member role updated to "${result.role}"`));
});

const approveMember = asyncHandler(async (req, res) => {
    const result = await societyService.approveMember(req.params.id, req.params.memberId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Member request approved"));
});

const rejectMember = asyncHandler(async (req, res) => {
    const result = await societyService.rejectMember(req.params.id, req.params.memberId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Member request rejected"));
});

export {
    getSocieties,
    getSocietyById,
    getSocietyMembers,
    getSocietyStats,
    createSociety,
    updateSociety,
    deleteSociety,
    joinSociety,
    leaveSociety,
    addMemberToSociety,
    removeMemberFromSociety,
    updateMemberRole,
    approveMember,
    rejectMember,
};