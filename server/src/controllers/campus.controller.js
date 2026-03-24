import fs from "fs";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Campus, CAMPUS_FACILITIES } from "../models/campus.model.js";
import { User } from "../models/user.model.js";
import { Society } from "../models/society.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
// import { Event } from "../models/event.model.js"; // Uncomment when Event model is refactored

const CAMPUS_SELECT = "-media.logoPublicId -media.coverImagePublicId";

const uploadFile = async (localPath) => {
    if (!localPath) return null;
    try {
        return await uploadOnCloudinary(localPath);
    } finally {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
};

const generateUniqueSlug = async (name, excludeId) => {
    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    let candidate = base;
    let counter = 1;

    while (
        await Campus.exists({ slug: candidate, _id: { $ne: excludeId } })
    ) {
        candidate = `${base}-${counter++}`;
    }

    return candidate;
};

const requireSuperAdmin = (user) => {
    if (!user?.roles?.includes("admin")) {
        throw new ApiError(403, "Only super-admins can perform this action");
    }
};

const requireCampusAdminOrSuperAdmin = (campus, user) => {
    const isSuperAdmin = user?.roles?.includes("admin");
    const isCampusAdmin = campus.adminId?.toString() === user?._id?.toString();
    if (!isSuperAdmin && !isCampusAdmin) {
        throw new ApiError(403, "You do not have permission to manage this campus");
    }
};

const safeParse = (value, fieldName) => {
    if (!value) return {};
    if (typeof value === "object") return value;
    try {
        return JSON.parse(value);
    } catch {
        throw new ApiError(400, `Invalid ${fieldName} format — must be valid JSON`);
    }
};

// GET /api/v1/campuses
const getAllCampuses = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        country,
        city,
        type,
        status = "active",
        q,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const isAdmin = req.user?.roles?.includes("admin");
    const filter = {};

    if (!isAdmin || !status || status === "active") {
        filter.status = "active";
    } else if (status !== "all") {
        filter.status = status;
    }

    if (country) filter["location.country"] = { $regex: country.trim(), $options: "i" };
    if (city) filter["location.city"] = { $regex: city.trim(), $options: "i" };

    if (type && ["main", "satellite", "online"].includes(type)) {
        filter.type = type;
    }

    if (q?.trim()) {
        const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { name: { $regex: esc, $options: "i" } },
            { code: { $regex: esc, $options: "i" } },
        ];
    }

    const [campuses, total] = await Promise.all([
        Campus.find(filter)
            .select(`${CAMPUS_SELECT} -facilities`)
            .populate("adminId", "profile.displayName profile.avatar")
            .sort({ "location.country": 1, name: 1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Campus.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            campuses,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
        }, "Campuses fetched successfully")
    );
});

// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/campuses/facilities
const getFacilitiesList = asyncHandler(async (_req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, CAMPUS_FACILITIES, "Facilities list fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/campuses/id/:id
// ObjectId-based lookup — for admin panel and internal service calls where
// the slug is not available but the _id is.
// MUST be registered before /:slug.
const getCampusById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid campus ID format");
    }

    const campus = await Campus.findById(id)
        .select(CAMPUS_SELECT)
        .populate("adminId", "profile.displayName profile.avatar profile.firstName profile.lastName");

    if (!campus) throw new ApiError(404, "Campus not found");

    if (campus.status !== "active" && !req.user?.roles?.includes("admin")) {
        throw new ApiError(404, "Campus not found");
    }

    return res.status(200).json(new ApiResponse(200, campus, "Campus fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/campuses/:slug
const getCampusBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const campus = await Campus.findBySlug(slug)
        .select(CAMPUS_SELECT)
        .populate("adminId", "profile.displayName profile.avatar profile.firstName profile.lastName");

    if (!campus) throw new ApiError(404, "Campus not found");

    if (campus.status !== "active" && !req.user?.roles?.includes("admin")) {
        throw new ApiError(404, "Campus not found");
    }

    return res.status(200).json(new ApiResponse(200, campus, "Campus fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/campuses/:slug/societies
const getCampusSocieties = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { page = 1, limit = 12, q } = req.query;

    const campus = await Campus.findBySlug(slug).select("_id name status");
    if (!campus) throw new ApiError(404, "Campus not found");

    if (campus.status !== "active" && !req.user?.roles?.includes("admin")) {
        throw new ApiError(404, "Campus not found");
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = { campusId: campus._id, status: "approved" };

    if (q?.trim()) {
        const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { name: { $regex: esc, $options: "i" } },
            { tag: { $regex: esc, $options: "i" } },
        ];
    }

    const [societies, total] = await Promise.all([
        Society.find(filter)
            .select("name tag description createdBy status createdAt")
            .populate("createdBy", "profile.displayName profile.avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Society.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            societies,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
        }, `${total} societ${total === 1 ? "y" : "ies"} found`)
    );
});

// POST /api/v1/campuses
const createCampus = asyncHandler(async (req, res) => {
    requireSuperAdmin(req.user);

    const {
        name, description, established,
        type, timezone, code,
        location, contact, facilities,
    } = req.body;

    if (!name?.trim()) throw new ApiError(400, "Campus name is required");

    const parsedLocation = safeParse(location, "location");
    const parsedContact = safeParse(contact, "contact");
    const parsedFacilities = safeParse(facilities, "facilities");

    if (!parsedLocation?.city?.trim()) throw new ApiError(400, "Campus city is required");
    if (!parsedLocation?.country?.trim()) throw new ApiError(400, "Campus country is required");

    const exists = await Campus.findOne({ name: name.trim() });
    if (exists) {
        throw new ApiError(409, `A campus named "${name.trim()}" already exists`);
    }

    const logoLocalPath = req.files?.logo?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    const [logo, cover] = await Promise.all([
        logoLocalPath ? uploadFile(logoLocalPath) : Promise.resolve(null),
        coverLocalPath ? uploadFile(coverLocalPath) : Promise.resolve(null),
    ]);

    const campus = await Campus.create({
        name: name.trim(),
        description: description?.trim() || "",
        type: type || "main",
        timezone: timezone || "Asia/Karachi",
        code: code?.trim().toUpperCase() || undefined,

        ...(established && { established: parseInt(established, 10) }),

        location: {
            address: parsedLocation.address?.trim(),
            city: parsedLocation.city.trim(),
            province: parsedLocation.province?.trim(),
            country: parsedLocation.country.trim(),
            postalCode: parsedLocation.postalCode?.trim(),
            ...(parsedLocation.coordinates?.length === 2 && {
                coordinates: {
                    type: "Point",
                    coordinates: parsedLocation.coordinates,
                },
            }),
        },

        contact: {
            website: parsedContact.website?.trim(),
            email: parsedContact.email?.trim().toLowerCase(),
            phone: parsedContact.phone?.trim(),
        },

        media: {
            logo: logo?.secure_url || "",
            logoPublicId: logo?.public_id || "",
            coverImage: cover?.secure_url || "",
            coverImagePublicId: cover?.public_id || "",
        },

        facilities: Array.isArray(parsedFacilities)
            ? [...new Set(parsedFacilities)]
            : [],
    });

    const created = await Campus.findById(campus._id).select(CAMPUS_SELECT);

    return res
        .status(201)
        .json(new ApiResponse(201, created, "Campus created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/campuses/:slug/status
const updateCampusStatus = asyncHandler(async (req, res) => {
    requireSuperAdmin(req.user);

    const { slug } = req.params;
    const { status } = req.body;

    const VALID = ["active", "inactive", "archived"];
    if (!status || !VALID.includes(status)) {
        throw new ApiError(400, `Status must be one of: ${VALID.join(", ")}`);
    }

    const campus = await Campus.findBySlug(slug);
    if (!campus) throw new ApiError(404, "Campus not found");

    if (campus.status === status) {
        throw new ApiError(400, `Campus is already "${status}"`);
    }

    const updated = await Campus.findByIdAndUpdate(
        campus._id,
        { $set: { status } },
        { new: true }
    ).select(CAMPUS_SELECT);

    return res
        .status(200)
        .json(new ApiResponse(200, updated, `Campus status updated to "${status}"`));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/campuses/:slug/admin
const assignCampusAdmin = asyncHandler(async (req, res) => {
    requireSuperAdmin(req.user);

    const { slug } = req.params;
    const { userId } = req.body;

    if (!userId) throw new ApiError(400, "User ID is required");
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID format");
    }

    const [campus, user] = await Promise.all([
        Campus.findBySlug(slug),
        User.findById(userId).select("profile.displayName profile.avatar roles status"),
    ]);

    if (!campus) throw new ApiError(404, "Campus not found");
    if (!user) throw new ApiError(404, "User not found");

    if (user.status !== "active") {
        throw new ApiError(400, "Cannot assign an inactive or deleted user as campus admin");
    }

    const updated = await Campus.findByIdAndUpdate(
        campus._id,
        { $set: { adminId: userId } },
        { new: true }
    )
        .select(CAMPUS_SELECT)
        .populate("adminId", "profile.displayName profile.avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Campus admin assigned successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// DELETE /api/v1/campuses/:slug/admin
const removeCampusAdmin = asyncHandler(async (req, res) => {
    requireSuperAdmin(req.user);

    const { slug } = req.params;
    const campus = await Campus.findBySlug(slug);

    if (!campus) throw new ApiError(404, "Campus not found");
    if (!campus.adminId) {
        throw new ApiError(400, "This campus has no assigned admin to remove");
    }

    const updated = await Campus.findByIdAndUpdate(
        campus._id,
        { $unset: { adminId: 1 } },
        { new: true }
    ).select(CAMPUS_SELECT);

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Campus admin removed successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// DELETE /api/v1/campuses/:slug
const deleteCampus = asyncHandler(async (req, res) => {
    requireSuperAdmin(req.user);

    const { slug } = req.params;
    const campus = await Campus.findBySlug(slug);

    if (!campus) throw new ApiError(404, "Campus not found");

    const [userCount, societyCount] = await Promise.all([
        User.countDocuments({ campusId: campus._id }),
        Society.countDocuments({ campusId: campus._id }),
    ]);

    if (userCount > 0 || societyCount > 0) {
        await Campus.findByIdAndUpdate(campus._id, { $set: { status: "archived" } });

        return res.status(200).json(
            new ApiResponse(200, {
                archived: true,
                campusId: campus._id,
                reason: `Campus has ${userCount} user(s) and ${societyCount} society/ies — archived instead of deleted.`,
            },
                "Campus archived. Remove all linked users and societies first to permanently delete.")
        );
    }

    const mediaDoc = await Campus.findById(campus._id)
        .select("+media.logoPublicId +media.coverImagePublicId");

    await Promise.allSettled([
        mediaDoc?.media?.logoPublicId ? deleteFromCloudinary(mediaDoc.media.logoPublicId) : null,
        mediaDoc?.media?.coverImagePublicId ? deleteFromCloudinary(mediaDoc.media.coverImagePublicId) : null,
    ]);

    await Campus.findByIdAndDelete(campus._id);

    return res
        .status(200)
        .json(new ApiResponse(200, { campusId: campus._id }, "Campus permanently deleted"));
});


// PATCH /api/v1/campuses/:slug
const updateCampus = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const campus = await Campus.findBySlug(slug);
    if (!campus) throw new ApiError(404, "Campus not found");

    requireCampusAdminOrSuperAdmin(campus, req.user);

    const {
        name, description, established,
        type, timezone, code,
        location, contact, facilities,
    } = req.body;

    const updates = {};

    if (name?.trim() && name.trim() !== campus.name) {
        const taken = await Campus.findOne({
            name: name.trim(),
            _id: { $ne: campus._id },
        });
        if (taken) throw new ApiError(409, `A campus named "${name.trim()}" already exists`);

        updates.name = name.trim();
        updates.slug = await generateUniqueSlug(name.trim(), campus._id);
    }

    if (description !== undefined) updates.description = description.trim();
    if (type !== undefined) updates.type = type;
    if (timezone !== undefined) updates.timezone = timezone;

    if (established !== undefined) {
        updates.established = parseInt(established, 10);
    }

    if (code !== undefined) {
        updates.code = code.trim() ? code.trim().toUpperCase() : undefined;
    }

    if (location) {
        const loc = safeParse(location, "location");
        if (loc.address !== undefined) updates["location.address"] = loc.address.trim();
        if (loc.city !== undefined) updates["location.city"] = loc.city.trim();
        if (loc.province !== undefined) updates["location.province"] = loc.province.trim();
        if (loc.country !== undefined) updates["location.country"] = loc.country.trim();
        if (loc.postalCode !== undefined) updates["location.postalCode"] = loc.postalCode.trim();
        if (loc.coordinates?.length === 2) {
            updates["location.coordinates"] = {
                type: "Point",
                coordinates: loc.coordinates,
            };
        }
    }

    if (contact) {
        const ct = safeParse(contact, "contact");
        if (ct.website !== undefined) updates["contact.website"] = ct.website.trim();
        if (ct.email !== undefined) updates["contact.email"] = ct.email.trim().toLowerCase();
        if (ct.phone !== undefined) updates["contact.phone"] = ct.phone.trim();
    }

    if (facilities !== undefined) {
        const facs = Array.isArray(facilities)
            ? facilities
            : safeParse(facilities, "facilities");
        updates.facilities = [...new Set(facs)];
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided — nothing to update");
    }

    const updated = await Campus.findByIdAndUpdate(
        campus._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select(CAMPUS_SELECT);

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Campus updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/campuses/:slug/logo

const updateCampusLogo = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const localPath = req.file?.path;

    if (!localPath) throw new ApiError(400, "Logo file is missing");

    const campus = await Campus.findBySlug(slug)
        .select(`${CAMPUS_SELECT} +media.logoPublicId`);

    if (!campus) throw new ApiError(404, "Campus not found");

    requireCampusAdminOrSuperAdmin(campus, req.user);

    const uploaded = await uploadFile(localPath);
    if (!uploaded?.secure_url) {
        throw new ApiError(500, "Logo upload failed — please try again");
    }

    if (campus.media?.logoPublicId) {
        deleteFromCloudinary(campus.media.logoPublicId).catch((err) =>
            console.error("[Cloudinary] Failed to delete old campus logo:", err)
        );
    }

    const updated = await Campus.findByIdAndUpdate(
        campus._id,
        {
            $set: {
                "media.logo": uploaded.secure_url,
                "media.logoPublicId": uploaded.public_id,
            },
        },
        { new: true }
    ).select(CAMPUS_SELECT);

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Campus logo updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/v1/campuses/:slug/cover
const updateCampusCoverImage = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const localPath = req.file?.path;

    if (!localPath) throw new ApiError(400, "Cover image file is missing");

    const campus = await Campus.findBySlug(slug)
        .select(`${CAMPUS_SELECT} +media.coverImagePublicId`);

    if (!campus) throw new ApiError(404, "Campus not found");

    requireCampusAdminOrSuperAdmin(campus, req.user);

    const uploaded = await uploadFile(localPath);
    if (!uploaded?.secure_url) {
        throw new ApiError(500, "Cover image upload failed — please try again");
    }

    if (campus.media?.coverImagePublicId) {
        deleteFromCloudinary(campus.media.coverImagePublicId).catch((err) =>
            console.error("[Cloudinary] Failed to delete old campus cover image:", err)
        );
    }

    const updated = await Campus.findByIdAndUpdate(
        campus._id,
        {
            $set: {
                "media.coverImage": uploaded.secure_url,
                "media.coverImagePublicId": uploaded.public_id,
            },
        },
        { new: true }
    ).select(CAMPUS_SELECT);

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Campus cover image updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/campuses/:slug/stats

const getCampusStats = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const campus = await Campus.findBySlug(slug).select("_id name slug adminId");
    if (!campus) throw new ApiError(404, "Campus not found");

    requireCampusAdminOrSuperAdmin(campus, req.user);

    const [
        totalUsers,
        activeUsers,
        totalSocieties,
        activeSocieties,
        roleBreakdown,
    ] = await Promise.all([
        User.countDocuments({ campusId: campus._id }),
        User.countDocuments({ campusId: campus._id, status: "active" }),
        Society.countDocuments({ campusId: campus._id }),
        Society.countDocuments({ campusId: campus._id, status: "approved" }),
        User.aggregate([
            { $match: { campusId: campus._id, status: "active" } },
            { $unwind: "$roles" },
            { $group: { _id: "$roles", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        // TODO: add event count once Event model is refactored
        // Event.countDocuments({ campus: campus._id, isCanceled: false })
    ]);

    const stats = {
        campus: {
            id: campus._id,
            name: campus.name,
            slug: campus.slug,
        },
        users: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers,
        },
        societies: {
            total: totalSocieties,
            active: activeSocieties,
        },
        roles: Object.fromEntries(
            roleBreakdown.map((r) => [r._id, r.count])
        ),
        // events: { total: eventCount },  // TODO
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Campus stats fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/campuses/:slug/users
const getCampusUsers = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const {
        page = 1,
        limit = 20,
        role,
        status = "active",
        q,
    } = req.query;

    const campus = await Campus.findBySlug(slug).select("_id name adminId");
    if (!campus) throw new ApiError(404, "Campus not found");

    requireCampusAdminOrSuperAdmin(campus, req.user);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = { campusId: campus._id };

    if (status && status !== "all") filter.status = status;
    if (role) filter.roles = role;

    if (q?.trim()) {
        const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { "profile.displayName": { $regex: esc, $options: "i" } },
            { "profile.firstName": { $regex: esc, $options: "i" } },
            { "profile.lastName": { $regex: esc, $options: "i" } },
            { email: { $regex: esc, $options: "i" } },
        ];
    }

    const [users, total] = await Promise.all([
        User.find(filter)
            .select(
                "profile.displayName profile.firstName profile.lastName " +
                "profile.avatar roles status lastLoginAt createdAt email"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        User.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
        }, `${total} user${total === 1 ? "" : "s"} found`)
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

