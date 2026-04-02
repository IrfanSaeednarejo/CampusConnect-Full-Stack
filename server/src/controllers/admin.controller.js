import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as adminService from "../services/admin.service.js";

// ────────────── PLATFORM STATS ──────────────
const getStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getPlatformStats();
    res.status(200).json(new ApiResponse(200, stats, "Platform stats retrieved"));
});

// ────────────── USER MANAGEMENT ──────────────
const getUsers = asyncHandler(async (req, res) => {
    const result = await adminService.getAllUsersAdmin(req.query);
    res.status(200).json(new ApiResponse(200, result, "Users retrieved"));
});

const getUser = asyncHandler(async (req, res) => {
    const user = await adminService.getUserByIdAdmin(req.params.id);
    res.status(200).json(new ApiResponse(200, user, "User retrieved"));
});

const updateRoles = asyncHandler(async (req, res) => {
    const { roles } = req.body;
    if (!roles || !Array.isArray(roles)) {
        return res.status(400).json(new ApiResponse(400, null, "roles must be an array"));
    }
    const user = await adminService.updateUserRoles(req.params.id, roles);
    res.status(200).json(new ApiResponse(200, user, "User roles updated"));
});

const suspendUser = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const user = await adminService.suspendUserAdmin(req.params.id, reason);
    res.status(200).json(new ApiResponse(200, user, "User suspended"));
});

const unsuspendUser = asyncHandler(async (req, res) => {
    const user = await adminService.unsuspendUserAdmin(req.params.id);
    res.status(200).json(new ApiResponse(200, user, "User unsuspended"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const result = await adminService.deleteUserAdmin(req.params.id);
    res.status(200).json(new ApiResponse(200, result, "User deleted"));
});

// ────────────── MENTOR VERIFICATION ──────────────
const getPendingMentors = asyncHandler(async (req, res) => {
    const mentors = await adminService.getPendingMentorApprovals();
    res.status(200).json(new ApiResponse(200, mentors, "Pending mentor applications retrieved"));
});

const approveMentor = asyncHandler(async (req, res) => {
    const user = await adminService.approveMentor(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, user, "Mentor approved"));
});

const rejectMentor = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const user = await adminService.rejectMentor(req.params.id, reason);
    res.status(200).json(new ApiResponse(200, user, "Mentor rejected"));
});

// ────────────── SOCIETY HEAD VERIFICATION ──────────────
const getPendingSocietyHeads = asyncHandler(async (req, res) => {
    const heads = await adminService.getPendingSocietyHeadApprovals();
    res.status(200).json(new ApiResponse(200, heads, "Pending society head applications retrieved"));
});

const approveSocietyHead = asyncHandler(async (req, res) => {
    const user = await adminService.approveSocietyHead(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, user, "Society head approved"));
});

const rejectSocietyHead = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const user = await adminService.rejectSocietyHead(req.params.id, reason);
    res.status(200).json(new ApiResponse(200, user, "Society head rejected"));
});

// ────────────── SOCIETY OVERSIGHT ──────────────
const getSocieties = asyncHandler(async (req, res) => {
    const result = await adminService.getAllSocietiesAdmin(req.query);
    res.status(200).json(new ApiResponse(200, result, "Societies retrieved"));
});

const deleteSociety = asyncHandler(async (req, res) => {
    const result = await adminService.deleteSocietyAdmin(req.params.id);
    res.status(200).json(new ApiResponse(200, result, "Society deleted"));
});

export {
    getStats,
    getUsers,
    getUser,
    updateRoles,
    suspendUser,
    unsuspendUser,
    deleteUser,
    getPendingMentors,
    approveMentor,
    rejectMentor,
    getPendingSocietyHeads,
    approveSocietyHead,
    rejectSocietyHead,
    getSocieties,
    deleteSociety,
};