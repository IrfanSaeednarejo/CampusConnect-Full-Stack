import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Society } from "../models/society.model.js";
import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
import { paginate } from "../utils/paginate.js";
import mongoose from "mongoose";


const requireSocietyOwner = (society, userId) => {
    if (society.createdBy.toString() !== userId.toString()) {
        throw new ApiError(403, "Only the society head can perform this action");
    }
};


const findSocietyById = async (societyId, selectFields = "") => {
    if (!mongoose.isValidObjectId(societyId)) {
        throw new ApiError(400, "Invalid society ID format");
    }
    const society = await Society.findById(societyId).select(selectFields || undefined);
    if (!society) throw new ApiError(404, "Society not found");
    return society;
};

/**
 * GET /api/v1/societies
 */
const getSocieties = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        campusId,
        category,
        status,
        tag,
        q,
    } = req.query;

    const filter = {};

    const isAdmin = req.user?.roles?.includes("admin");
    if (!isAdmin) {
        filter.status = "approved";
    } else if (status && status !== "all") {
        filter.status = status;
    }

    if (campusId) {
        if (!mongoose.isValidObjectId(campusId)) {
            throw new ApiError(400, "Invalid campusId format");
        }
        filter.campusId = new mongoose.Types.ObjectId(campusId);
    }

    if (category) filter.category = category;
    if (tag) filter.tag = tag.trim().toLowerCase();

    if (q?.trim()) {
        filter.$text = { $search: q.trim() };
    }

    const result = await paginate(Society, filter, {
        page,
        limit,
        select: "-members -media.logoPublicId -media.coverImagePublicId",
        sort: q?.trim() ? { score: { $meta: "textScore" } } : { createdAt: -1 },
        populate: [{ path: "createdBy", select: "profile.displayName profile.avatar" }],
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Societies fetched successfully"));
});

/**
 * GET /api/v1/societies/:id
 */
const getSocietyById = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;

    if (!mongoose.isValidObjectId(societyId)) {
        throw new ApiError(400, "Invalid Society ID format");
    }

    const society = await Society.findById(societyId)
        .populate("createdBy", "profile.displayName profile.avatar profile.firstName profile.lastName")
        .populate({
            path: "members.memberId",
            select: "profile.displayName profile.avatar profile.firstName profile.lastName",
            options: { limit: 10 },
        });

    if (!society) throw new ApiError(404, "Society not found");

    return res
        .status(200)
        .json(new ApiResponse(200, society, "Society fetched successfully"));
});

/**
 * GET /api/v1/societies/:id/members
 */
const getSocietyMembers = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;
    const { role, status = "approved" } = req.query;

    if (!mongoose.isValidObjectId(societyId)) {
        throw new ApiError(400, "Invalid Society ID");
    }

    const society = await Society.findById(societyId)
        .select("members name createdBy campusId")
        .populate({
            path: "members.memberId",
            select: "profile.displayName profile.avatar profile.firstName profile.lastName academic.department",
            model: "User",
        });

    if (!society) throw new ApiError(404, "Society not found");

    let members = society.members;

    if (status !== "all") {
        members = members.filter((m) => m.status === status);
    }

    if (role) {
        members = members.filter((m) => m.role === role);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, members, "Society members fetched successfully"));
});

/**
 * GET /api/v1/societies/:id/stats
 */
const getSocietyStats = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;

    const society = await findSocietyById(societyId, "createdBy campusId name tag members memberCount");

    const isAdmin = req.user?.roles?.includes("admin");
    const isOwner = society.createdBy.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
        throw new ApiError(403, "Only the society head or admin can view society stats");
    }

    const roleBreakdown = society.members
        .filter((m) => m.status === "approved")
        .reduce((acc, m) => {
            acc[m.role] = (acc[m.role] || 0) + 1;
            return acc;
        }, {});

    const statusBreakdown = society.members.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
    }, {});

    let eventStats = { total: 0, published: 0, completed: 0, cancelled: 0 };
    try {
        const eventAgg = await Event.aggregate([
            { $match: { societyId: society._id } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        eventAgg.forEach(({ _id, count }) => {
            eventStats[_id] = count;
            eventStats.total += count;
        });
    } catch {
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentJoins = society.members.filter(
        (m) => m.status === "approved" && m.joinedAt >= thirtyDaysAgo
    ).length;

    const stats = {
        society: {
            id: society._id,
            name: society.name,
            tag: society.tag,
        },
        members: {
            total: society.memberCount,
            byRole: roleBreakdown,
            byStatus: statusBreakdown,
            joinedLast30Days: recentJoins,
        },
        events: eventStats,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Society stats fetched successfully"));
});

/**
 * POST /api/v1/societies/create-society
 */
const createSociety = asyncHandler(async (req, res) => {
    if (
        !req.user?.roles?.includes("society_head") ||
        !req.user?.societyHeadVerification?.isVerified
    ) {
        throw new ApiError(403, "You must be a verified Society Head to create a society");
    }

    const { name, description, tag, category, campusId } = req.body;
    const nameTrimmed = name?.trim();
    const tagTrimmed = tag?.trim().toLowerCase();

    if (!nameTrimmed || !tagTrimmed) {
        throw new ApiError(400, "Name and Tag are required");
    }
    if (tagTrimmed.length < 3) {
        throw new ApiError(400, "Tag must be at least 3 characters");
    }

    const resolvedCampusId = campusId || req.user.campusId;
    if (!resolvedCampusId) {
        throw new ApiError(400, "Campus ID is required — update your profile or provide campusId");
    }

    const existingSociety = await Society.findOne({
        $or: [{ tag: tagTrimmed }, { name: nameTrimmed }],
        campusId: resolvedCampusId,
    });

    if (existingSociety) {
        throw new ApiError(
            409,
            `A society with that ${existingSociety.tag === tagTrimmed ? "tag" : "name"} already exists on this campus`
        );
    }

    const society = await Society.create({
        name: nameTrimmed,
        description: description?.trim() || "",
        tag: tagTrimmed,
        category: category || "other",
        campusId: resolvedCampusId,
        createdBy: req.user._id,
        members: [
            {
                memberId: req.user._id,
                role: "executive",
                status: "approved",
                joinedAt: new Date(),
            },
        ],
        memberCount: 1,
    });

    const created = await Society.findById(society._id)
        .populate("createdBy", "profile.displayName profile.avatar");

    return res
        .status(201)
        .json(new ApiResponse(201, created, "Society created successfully"));
});

/**
 * PATCH /api/v1/societies/update/:id
 */
const updateSociety = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;
    const { name, description, tag, category } = req.body;

    const society = await findSocietyById(societyId);
    requireSocietyOwner(society, req.user._id);

    if (name || tag) {
        const nameTrimmed = name?.trim() || society.name;
        const tagTrimmed = tag?.trim().toLowerCase() || society.tag;

        const conflict = await Society.findOne({
            _id: { $ne: societyId },
            campusId: society.campusId,
            $or: [{ name: nameTrimmed }, { tag: tagTrimmed }],
        });

        if (conflict) {
            throw new ApiError(
                409,
                `Another society on this campus already uses that ${conflict.name === nameTrimmed ? "name" : "tag"}`
            );
        }
    }

    const updatedSociety = await Society.findByIdAndUpdate(
        societyId,
        {
            $set: {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description.trim() }),
                ...(tag && { tag: tag.trim().toLowerCase() }),
                ...(category && { category }),
            },
        },
        { new: true, runValidators: true }
    ).populate("createdBy", "profile.displayName profile.avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSociety, "Society updated successfully"));
});

/**
 * DELETE /api/v1/societies/delete/:id
 */
const deleteSociety = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;

    const society = await findSocietyById(societyId, "createdBy memberCount");
    requireSocietyOwner(society, req.user._id);

    await Society.findByIdAndDelete(societyId);

    return res.status(200).json(
        new ApiResponse(
            200,
            { societyId: society._id, membersAffected: society.memberCount },
            "Society deleted successfully"
        )
    );
});

/**
 * POST /api/v1/societies/:id/join
 */
const joinSociety = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;

    const society = await findSocietyById(societyId, "members memberCount createdBy campusId status requireApproval");

    if (society.status !== "approved") {
        throw new ApiError(403, "This society is not currently accepting new members");
    }

    const userId = req.user._id.toString();

    const existing = society.members.find((m) => m.memberId.toString() === userId);
    if (existing) {
        if (existing.status === "approved") {
            throw new ApiError(409, "You are already a member of this society");
        }
        if (existing.status === "pending") {
            throw new ApiError(409, "Your join request is already pending approval");
        }
        if (existing.status === "rejected") {
            throw new ApiError(403, "Your previous join request was rejected. Contact the society head.");
        }
        existing.status = society.requireApproval ? "pending" : "approved";
        existing.joinedAt = new Date();
        await society.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                { status: existing.status },
                society.requireApproval
                    ? "Re-join request submitted — awaiting approval"
                    : "You have re-joined the society"
            )
        );
    }

    const memberStatus = society.requireApproval ? "pending" : "approved";

    society.members.push({
        memberId: req.user._id,
        role: "student",
        status: memberStatus,
        joinedAt: new Date(),
    });

    await society.save();

    return res.status(201).json(
        new ApiResponse(
            201,
            { status: memberStatus },
            society.requireApproval
                ? "Join request submitted — awaiting approval from the society head"
                : "You have successfully joined the society"
        )
    );
});

/**
 * POST /api/v1/societies/:id/leave
 */
const leaveSociety = asyncHandler(async (req, res) => {
    const { id: societyId } = req.params;

    const society = await findSocietyById(societyId, "members memberCount createdBy");

    if (society.createdBy.toString() === req.user._id.toString()) {
        throw new ApiError(
            400,
            "Society head cannot leave their own society. Transfer ownership or delete the society instead."
        );
    }

    const userId = req.user._id.toString();
    const memberIndex = society.members.findIndex(
        (m) => m.memberId.toString() === userId && m.status === "approved"
    );

    if (memberIndex === -1) {
        throw new ApiError(404, "You are not an active member of this society");
    }

    society.members[memberIndex].status = "left";
    await society.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "You have left the society"));
});

/**
 * POST /api/v1/societies/:id/members/add
 */
const addMemberToSociety = asyncHandler(async (req, res) => {
    if (
        !req.user?.roles?.includes("society_head") ||
        !req.user?.societyHeadVerification?.isVerified
    ) {
        throw new ApiError(403, "You must be a verified Society Head to add members");
    }

    const { id: societyId } = req.params;
    const { memberId, role } = req.body;

    if (!memberId) throw new ApiError(400, "Member ID is required");
    if (!mongoose.isValidObjectId(memberId)) {
        throw new ApiError(400, "Invalid member ID format");
    }

    const society = await findSocietyById(societyId, "members memberCount createdBy");
    requireSocietyOwner(society, req.user._id);

    const user = await User.findById(memberId).select("_id status profile.displayName");
    if (!user) throw new ApiError(404, "User not found");
    if (user.status !== "active") {
        throw new ApiError(400, "Cannot add an inactive or deleted user");
    }

    const validRoles = ["student", "active-member", "co-coordinator", "executive"];
    const assignedRole = validRoles.includes(role) ? role : "student";

    const alreadyMember = society.members.some(
        (m) => m.memberId.toString() === memberId && m.status !== "left"
    );
    if (alreadyMember) {
        throw new ApiError(409, "User is already an active member of this society");
    }

    const leftIndex = society.members.findIndex(
        (m) => m.memberId.toString() === memberId && m.status === "left"
    );

    if (leftIndex !== -1) {
        society.members[leftIndex].role = assignedRole;
        society.members[leftIndex].status = "approved";
        society.members[leftIndex].joinedAt = new Date();
    } else {
        society.members.push({
            memberId,
            role: assignedRole,
            status: "approved",
            joinedAt: new Date(),
        });
    }

    await society.save();

    const updated = await Society.findById(societyId)
        .select("members memberCount name tag")
        .populate({
            path: "members.memberId",
            select: "profile.displayName profile.avatar",
        });

    return res
        .status(201)
        .json(new ApiResponse(201, updated, "Member added successfully"));
});

/**
 * DELETE /api/v1/societies/:id/members/remove/:memberId
 */
const removeMemberFromSociety = asyncHandler(async (req, res) => {
    const { id: societyId, memberId } = req.params;

    if (!mongoose.isValidObjectId(memberId)) {
        throw new ApiError(400, "Invalid member ID format");
    }

    const society = await findSocietyById(societyId, "members memberCount createdBy");
    requireSocietyOwner(society, req.user._id);

    if (memberId === req.user._id.toString()) {
        throw new ApiError(400, "Use /leave to remove yourself, or delete the society");
    }

    const memberIndex = society.members.findIndex(
        (m) => m.memberId.toString() === memberId && m.status !== "left"
    );

    if (memberIndex === -1) {
        throw new ApiError(404, "User is not an active member of this society");
    }

    society.members.splice(memberIndex, 1);
    await society.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { removedMemberId: memberId }, "Member removed successfully"));
});

/**
 * PATCH /api/v1/societies/:id/members/:memberId/role
 */
const updateMemberRole = asyncHandler(async (req, res) => {
    const { id: societyId, memberId } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(memberId)) {
        throw new ApiError(400, "Invalid member ID format");
    }

    const validRoles = ["student", "active-member", "co-coordinator", "executive"];
    if (!role || !validRoles.includes(role)) {
        throw new ApiError(400, `Role must be one of: ${validRoles.join(", ")}`);
    }

    const society = await findSocietyById(societyId, "members createdBy");
    requireSocietyOwner(society, req.user._id);

    const member = society.members.find(
        (m) => m.memberId.toString() === memberId && m.status === "approved"
    );

    if (!member) {
        throw new ApiError(404, "Approved member not found in this society");
    }

    if (member.role === role) {
        throw new ApiError(400, `Member already has the role "${role}"`);
    }

    member.role = role;
    await society.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { memberId, role }, `Member role updated to "${role}"`));
});

/**
 * PATCH /api/v1/societies/:id/members/:memberId/approve
 */
const approveMember = asyncHandler(async (req, res) => {
    const { id: societyId, memberId } = req.params;

    if (!mongoose.isValidObjectId(memberId)) {
        throw new ApiError(400, "Invalid member ID format");
    }

    const society = await findSocietyById(societyId, "members memberCount createdBy");
    requireSocietyOwner(society, req.user._id);

    const member = society.members.find(
        (m) => m.memberId.toString() === memberId && m.status === "pending"
    );

    if (!member) {
        throw new ApiError(404, "No pending join request found for this user");
    }

    member.status = "approved";
    member.joinedAt = new Date();
    await society.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { memberId, status: "approved" }, "Member request approved"));
});

/**
 * PATCH /api/v1/societies/:id/members/:memberId/reject
 */
const rejectMember = asyncHandler(async (req, res) => {
    const { id: societyId, memberId } = req.params;

    if (!mongoose.isValidObjectId(memberId)) {
        throw new ApiError(400, "Invalid member ID format");
    }

    const society = await findSocietyById(societyId, "members createdBy");
    requireSocietyOwner(society, req.user._id);

    const member = society.members.find(
        (m) => m.memberId.toString() === memberId && m.status === "pending"
    );

    if (!member) {
        throw new ApiError(404, "No pending join request found for this user");
    }

    member.status = "rejected";
    await society.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { memberId, status: "rejected" }, "Member request rejected"));
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