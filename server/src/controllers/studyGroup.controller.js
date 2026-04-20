import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as studyGroupService from "../services/studyGroup.service.js";

const getStudyGroups = asyncHandler(async (req, res) => {
    const result = await studyGroupService.getStudyGroups(req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Study groups fetched successfully"));
});

const getMyStudyGroups = asyncHandler(async (req, res) => {
    const result = await studyGroupService.getMyStudyGroups(req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Your study groups fetched successfully"));
});

const getStudyGroupById = asyncHandler(async (req, res) => {
    const group = await studyGroupService.getStudyGroupById(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, group, "Study group fetched successfully"));
});

const createStudyGroup = asyncHandler(async (req, res) => {
    const isAdmin = req.user.roles?.includes("admin");
    const sanitizedBody = { ...req.body };
    
    // STRICT: Never trust user-provided audit fields
    delete sanitizedBody.approvedBy;
    delete sanitizedBy.rejectionReason;
    delete sanitizedBy.requestedBy;
    
    if (!isAdmin) {
        sanitizedBy.status = "pending"; // Enforce request flow
    }

    const created = await studyGroupService.createStudyGroup(sanitizedBy, req.user);
    return res.status(201).json(new ApiResponse(201, created, "Study group request submitted successfully"));
});

const updateStudyGroup = asyncHandler(async (req, res) => {
    const sanitizedBy = { ...req.body };
    
    // User cannot approve their own group or modify audit trail
    delete sanitizedBy.status; 
    delete sanitizedBy.approvedBy;
    delete sanitizedBy.rejectionReason;
    delete sanitizedBy.requestedBy;

    const updated = await studyGroupService.updateStudyGroup(req.params.id, sanitizedBy, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Study group updated successfully"));
});

const deleteStudyGroup = asyncHandler(async (req, res) => {
    const result = await studyGroupService.deleteStudyGroup(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Study group deleted successfully"));
});

const archiveStudyGroup = asyncHandler(async (req, res) => {
    const updated = await studyGroupService.archiveStudyGroup(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Study group archived successfully"));
});

const joinStudyGroup = asyncHandler(async (req, res) => {
    const result = await studyGroupService.joinStudyGroup(req.params.id, req.user);
    return res.status(201).json(new ApiResponse(201, result, "Joined study group successfully"));
});

const leaveStudyGroup = asyncHandler(async (req, res) => {
    await studyGroupService.leaveStudyGroup(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, null, "You have left the study group"));
});

const removeMember = asyncHandler(async (req, res) => {
    const result = await studyGroupService.removeMember(req.params.id, req.params.memberId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Member removed successfully"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
    const result = await studyGroupService.updateMemberRole(req.params.id, req.params.memberId, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, result, `Member role updated to "${result.role}"`));
});

const addResource = asyncHandler(async (req, res) => {
    const result = await studyGroupService.addResource(req.params.id, req.body, req.file, req.user);
    return res.status(201).json(new ApiResponse(201, result, "Resource uploaded successfully"));
});

const removeResource = asyncHandler(async (req, res) => {
    const result = await studyGroupService.removeResource(req.params.id, req.params.resourceId, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Resource removed successfully"));
});

const getResources = asyncHandler(async (req, res) => {
    const resources = await studyGroupService.getResources(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, resources, "Resources fetched successfully"));
});

const updateSchedule = asyncHandler(async (req, res) => {
    const updated = await studyGroupService.updateSchedule(req.params.id, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Schedule updated successfully"));
});

export {
    getStudyGroups,
    getMyStudyGroups,
    getStudyGroupById,
    createStudyGroup,
    updateStudyGroup,
    deleteStudyGroup,
    archiveStudyGroup,
    joinStudyGroup,
    leaveStudyGroup,
    removeMember,
    updateMemberRole,
    addResource,
    removeResource,
    getResources,
    updateSchedule,
};