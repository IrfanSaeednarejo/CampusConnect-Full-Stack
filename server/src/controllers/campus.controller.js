import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as campusService from "../services/campus.service.js";

const getAllCampuses = asyncHandler(async (req, res) => {
    const result = await campusService.getAllCampuses(req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Campuses fetched successfully"));
});

const getFacilitiesList = asyncHandler(async (_req, res) => {
    return res.status(200).json(new ApiResponse(200, campusService.getFacilitiesList(), "Facilities list fetched successfully"));
});

const getCampusById = asyncHandler(async (req, res) => {
    const campus = await campusService.getCampusById(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, campus, "Campus fetched successfully"));
});

const getCampusBySlug = asyncHandler(async (req, res) => {
    const campus = await campusService.getCampusBySlug(req.params.slug, req.user);
    return res.status(200).json(new ApiResponse(200, campus, "Campus fetched successfully"));
});

const getCampusSocieties = asyncHandler(async (req, res) => {
    const result = await campusService.getCampusSocieties(req.params.slug, req.query, req.user);
    return res.status(200).json(
        new ApiResponse(200, result, `${result.pagination.total} societ${result.pagination.total === 1 ? "y" : "ies"} found`)
    );
});

const createCampus = asyncHandler(async (req, res) => {
    const created = await campusService.createCampus(req.body, req.files, req.user);
    return res.status(201).json(new ApiResponse(201, created, "Campus created successfully"));
});

const updateCampusStatus = asyncHandler(async (req, res) => {
    const updated = await campusService.updateCampusStatus(req.params.slug, req.body.status, req.user);
    return res.status(200).json(new ApiResponse(200, updated, `Campus status updated to "${req.body.status}"`));
});

const assignCampusAdmin = asyncHandler(async (req, res) => {
    const updated = await campusService.assignCampusAdmin(req.params.slug, req.body.userId, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Campus admin assigned successfully"));
});

const removeCampusAdmin = asyncHandler(async (req, res) => {
    const updated = await campusService.removeCampusAdmin(req.params.slug, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Campus admin removed successfully"));
});

const deleteCampus = asyncHandler(async (req, res) => {
    const result = await campusService.deleteCampus(req.params.slug, req.user);
    if (result.archived) {
        return res.status(200).json(new ApiResponse(200, result, "Campus archived. Remove all linked users and societies first to permanently delete."));
    }
    return res.status(200).json(new ApiResponse(200, result, "Campus permanently deleted"));
});

const updateCampus = asyncHandler(async (req, res) => {
    const updated = await campusService.updateCampus(req.params.slug, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Campus updated successfully"));
});

const updateCampusLogo = asyncHandler(async (req, res) => {
    const localPath = req.file?.path;
    const updated = await campusService.updateCampusLogo(req.params.slug, localPath, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Campus logo updated successfully"));
});

const updateCampusCoverImage = asyncHandler(async (req, res) => {
    const localPath = req.file?.path;
    const updated = await campusService.updateCampusCoverImage(req.params.slug, localPath, req.user);
    return res.status(200).json(new ApiResponse(200, updated, "Campus cover image updated successfully"));
});

const getCampusStats = asyncHandler(async (req, res) => {
    const stats = await campusService.getCampusStats(req.params.slug, req.user);
    return res.status(200).json(new ApiResponse(200, stats, "Campus stats fetched successfully"));
});

const getCampusUsers = asyncHandler(async (req, res) => {
    const result = await campusService.getCampusUsers(req.params.slug, req.query, req.user);
    return res.status(200).json(
        new ApiResponse(200, result, `${result.pagination.total} user${result.pagination.total === 1 ? "" : "s"} found`)
    );
});

export {
    getAllCampuses,
    getFacilitiesList,
    getCampusById,
    getCampusBySlug,
    getCampusSocieties,
    createCampus,
    updateCampusStatus,
    assignCampusAdmin,
    removeCampusAdmin,
    deleteCampus,
    updateCampus,
    updateCampusLogo,
    updateCampusCoverImage,
    getCampusStats,
    getCampusUsers,
};
