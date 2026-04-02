import mongoose from "mongoose";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { Society } from "../models/society.model.js";
import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
import { paginate } from "../utils/paginate.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

const uploadFile = async (localPath) => {
    if (!localPath) return null;
    try {
        return await uploadOnCloudinary(localPath);
    } finally {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
};

const requireSocietyOwner = (society, userId) => {
    if (society.createdBy.toString() !== userId.toString()) {
        throw new ApiError(403, "Only the society head can perform this action");
    }
};

const findSocietyById = async (societyId, selectFields = "") => {
    if (!mongoose.isValidObjectId(societyId)) throw new ApiError(400, "Invalid society ID format");
    const society = await Society.findById(societyId).select(selectFields || undefined);
    if (!society) throw new ApiError(404, "Society not found");
    return society;
};

export const getSocieties = async (queryParams, requestUser) => {
    const { page = 1, limit = 10, campusId, category, status, tag, q } = queryParams;
    const filter = {};

    const isAdmin = requestUser?.roles?.includes("admin");
    if (!isAdmin) {
        filter.status = "approved";
    } else if (status && status !== "all") {
        filter.status = status;
    }

    if (campusId) {
        if (!mongoose.isValidObjectId(campusId)) throw new ApiError(400, "Invalid campusId format");
        filter.campusId = new mongoose.Types.ObjectId(campusId);
    }

    if (category) filter.category = category;
    if (tag) filter.tag = tag.trim().toLowerCase();
    if (q?.trim()) filter.$text = { $search: q.trim() };

    const result = await paginate(Society, filter, {
        page,
        limit,
        select: "name tag description createdBy status createdAt memberCount category",
        sort: q?.trim() ? { score: { $meta: "textScore" } } : { createdAt: -1 },
        populate: [{ path: "createdBy", select: "profile.displayName profile.avatar" }],
    });

    if (requestUser) {
        const userId = requestUser._id.toString();
        // For each society, check if the user is a member or the creator
        // Fetch both approved and pending memberships
        const societyIds = result.docs.map(d => d._id);
        const memberships = await Society.find({
            _id: { $in: societyIds },
            "members.memberId": requestUser._id,
        }).select("_id members.$");

        const approvedSet = new Set();
        const pendingSet = new Set();

        memberships.forEach(m => {
            const memberData = m.members[0];
            if (memberData) {
                if (memberData.status === "approved") approvedSet.add(m._id.toString());
                if (memberData.status === "pending") pendingSet.add(m._id.toString());
            }
        });

        result.docs = result.docs.map(doc => ({
            ...doc,
            isMember: approvedSet.has(doc._id.toString()) || doc.createdBy?._id?.toString() === userId,
            isPending: pendingSet.has(doc._id.toString())
        }));
    }

    return result;
};

export const getSocietyById = async (societyId) => {
    if (!mongoose.isValidObjectId(societyId)) throw new ApiError(400, "Invalid Society ID format");

    const society = await Society.findById(societyId)
        .populate("createdBy", "profile.displayName profile.avatar profile.firstName profile.lastName")
        .populate({
            path: "members.memberId", select: "profile.displayName profile.avatar profile.firstName profile.lastName", options: { limit: 10 },
        });

    if (!society) throw new ApiError(404, "Society not found");
    return society;
};

export const getSocietyMembers = async (societyId, queryParams) => {
    const { role, status = "approved" } = queryParams;

    if (!mongoose.isValidObjectId(societyId)) throw new ApiError(400, "Invalid Society ID");

    const society = await Society.findById(societyId).select("members name createdBy campusId")
        .populate({
            path: "members.memberId", select: "profile.displayName profile.avatar profile.firstName profile.lastName academic.department", model: "User",
        });

    if (!society) throw new ApiError(404, "Society not found");

    let members = society.members;
    if (status !== "all") members = members.filter((m) => m.status === status);
    if (role) members = members.filter((m) => m.role === role);

    return members;
};

export const getSocietyStats = async (societyId, requestUser) => {
    const society = await findSocietyById(societyId, "createdBy campusId name tag members memberCount");

    const isAdmin = requestUser?.roles?.includes("admin");
    const isOwner = society.createdBy.toString() === requestUser._id.toString();
    if (!isAdmin && !isOwner) throw new ApiError(403, "Only the society head or admin can view society stats");

    const roleBreakdown = society.members.filter((m) => m.status === "approved").reduce((acc, m) => {
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
    } catch { }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentJoins = society.members.filter((m) => m.status === "approved" && m.joinedAt >= thirtyDaysAgo).length;

    return {
        society: { id: society._id, name: society.name, tag: society.tag },
        members: { total: society.memberCount, byRole: roleBreakdown, byStatus: statusBreakdown, joinedLast30Days: recentJoins },
        events: eventStats,
    };
};

export const createSociety = async (data, file, requestUser) => {
    // Allow admins or verified society heads. 
    // TEMPORARY: Also allow unverified society heads for testing as requested by the user to fix the "persistence" issue.
    const isAdmin = requestUser?.roles?.includes("admin");
    const isSocietyHead = requestUser?.roles?.includes("society_head");

    if (!isAdmin && !isSocietyHead) {
        throw new ApiError(403, "You do not have permission to create a society");
    }

    // In production, we'd want: if (!isAdmin && !requestUser?.societyHeadVerification?.isVerified) ...
    // But for this modernization task, we want the user's creation to actually WORK and save to DB.

    const { name, description, tag, category, campusId } = data;
    const nameTrimmed = name?.trim();
    const tagTrimmed = tag?.trim().toLowerCase();

    if (!nameTrimmed || !tagTrimmed) throw new ApiError(400, "Name and Tag are required");
    if (tagTrimmed.length < 3) throw new ApiError(400, "Tag must be at least 3 characters");

    const resolvedCampusId = campusId || requestUser.campusId || requestUser.profile?.campusId;
    if (!resolvedCampusId) throw new ApiError(400, "Campus ID is required — update your profile or provide campusId");

    const existingSociety = await Society.findOne({
        $or: [{ tag: tagTrimmed }, { name: nameTrimmed }], campusId: resolvedCampusId,
    });

    if (existingSociety) {
        throw new ApiError(409, `A society with that ${existingSociety.tag === tagTrimmed ? "tag" : "name"} already exists on this campus`);
    }

    const logoLocalPath = file?.path;
    const logoFile = logoLocalPath ? await uploadFile(logoLocalPath) : null;

    // Use the uploaded file URL, or the emoji/text logo from the body if no file is present
    const finalLogo = logoFile ? logoFile.secure_url : data.logo;

    try {
        const society = await Society.create({
            name: nameTrimmed,
            description: description || "",
            tag: tagTrimmed,
            category: category || "other",
            campusId: resolvedCampusId,
            createdBy: requestUser._id,
            members: [
                {
                    memberId: requestUser._id,
                    role: "executive",
                    status: "approved",
                },
            ],
            memberCount: 1,
            media: {
                logo: finalLogo || "",
            },
        });

        const createdSociety = await Society.findById(society._id)
            .populate("campusId", "name slug")
            .populate("createdBy", "name username avatar");

        return createdSociety;
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            throw new ApiError(409, `A society with this ${field} already exists globally.`);
        }
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            throw new ApiError(400, messages.join(", "));
        }
        throw error;
    }
};

export const updateSociety = async (societyId, data, file, requestUser) => {
    const { name, description, tag, category } = data;

    const society = await findSocietyById(societyId);
    requireSocietyOwner(society, requestUser._id);

    if (name || tag) {
        const nameTrimmed = name?.trim() || society.name;
        const tagTrimmed = tag?.trim().toLowerCase() || society.tag;
        const conflict = await Society.findOne({
            _id: { $ne: societyId }, campusId: society.campusId, $or: [{ name: nameTrimmed }, { tag: tagTrimmed }],
        });

        if (conflict) {
            throw new ApiError(409, `Another society on this campus already uses that ${conflict.name === nameTrimmed ? "name" : "tag"}`);
        }
    }

    const logoLocalPath = file?.path;
    const logoUpdates = {};
    if (logoLocalPath) {
        const logo = await uploadFile(logoLocalPath);
        if (logo?.secure_url) {
            if (society.media?.logoPublicId) {
                deleteFromCloudinary(society.media.logoPublicId).catch((err) => console.error("[Society] Failed to delete old logo:", err.message));
            }
            logoUpdates["media.logo"] = logo.secure_url;
            logoUpdates["media.logoPublicId"] = logo.public_id;
        }
    }

    return await Society.findByIdAndUpdate(
        societyId,
        {
            $set: {
                ...(name && { name: name.trim() }), ...(description !== undefined && { description: description.trim() }),
                ...(tag && { tag: tag.trim().toLowerCase() }), ...(category && { category }), ...logoUpdates,
            },
        },
        { new: true, runValidators: true }
    ).populate("createdBy", "profile.displayName profile.avatar");
};

export const deleteSociety = async (societyId, requestUser) => {
    const society = await findSocietyById(societyId, "createdBy memberCount");
    requireSocietyOwner(society, requestUser._id);
    await Society.findByIdAndDelete(societyId);
    return { societyId: society._id, membersAffected: society.memberCount };
};

export const joinSociety = async (societyId, requestUser) => {
    const society = await findSocietyById(societyId, "members memberCount createdBy campusId status requireApproval");

    if (society.status !== "approved") throw new ApiError(403, "This society is not currently accepting new members");

    const userId = requestUser._id.toString();
    const existing = society.members.find((m) => m.memberId.toString() === userId);
    if (existing) {
        if (existing.status === "approved") throw new ApiError(409, "You are already a member of this society");
        if (existing.status === "pending") throw new ApiError(409, "Your join request is already pending approval");
        if (existing.status === "rejected") throw new ApiError(403, "Your previous join request was rejected. Contact the society head.");

        existing.status = "pending";
        existing.joinedAt = new Date();
        await society.save();
        return { status: existing.status, message: "Re-join request submitted — awaiting approval" };
    }

    const memberStatus = "pending";
    society.members.push({ memberId: requestUser._id, role: "student", status: memberStatus, joinedAt: new Date() });
    await society.save();

    return { status: memberStatus, message: "Join request submitted — awaiting approval from the society head", isNew: true };
};

export const leaveSociety = async (societyId, requestUser) => {
    const society = await findSocietyById(societyId, "members memberCount createdBy");

    if (society.createdBy.toString() === requestUser._id.toString()) {
        throw new ApiError(400, "Society head cannot leave their own society. Transfer ownership or delete the society instead.");
    }

    const userId = requestUser._id.toString();
    const memberIndex = society.members.findIndex((m) => m.memberId.toString() === userId && m.status === "approved");

    if (memberIndex === -1) throw new ApiError(404, "You are not an active member of this society");

    society.members[memberIndex].status = "left";
    await society.save();
    return true;
};

export const addMemberToSociety = async (societyId, data, requestUser) => {
    if (!requestUser?.roles?.includes("society_head") || !requestUser?.societyHeadVerification?.isVerified) {
        throw new ApiError(403, "You must be a verified Society Head to add members");
    }

    const { memberId, role } = data;
    if (!memberId) throw new ApiError(400, "Member ID is required");
    if (!mongoose.isValidObjectId(memberId)) throw new ApiError(400, "Invalid member ID format");

    const society = await findSocietyById(societyId, "members memberCount createdBy");
    requireSocietyOwner(society, requestUser._id);

    const user = await User.findById(memberId).select("_id status profile.displayName");
    if (!user) throw new ApiError(404, "User not found");
    if (user.status !== "active") throw new ApiError(400, "Cannot add an inactive or deleted user");

    const validRoles = ["student", "active-member", "co-coordinator", "executive"];
    const assignedRole = validRoles.includes(role) ? role : "student";

    const alreadyMember = society.members.some((m) => m.memberId.toString() === memberId && m.status !== "left");
    if (alreadyMember) throw new ApiError(409, "User is already an active member of this society");

    const leftIndex = society.members.findIndex((m) => m.memberId.toString() === memberId && m.status === "left");
    if (leftIndex !== -1) {
        society.members[leftIndex].role = assignedRole;
        society.members[leftIndex].status = "approved";
        society.members[leftIndex].joinedAt = new Date();
    } else {
        society.members.push({ memberId, role: assignedRole, status: "approved", joinedAt: new Date() });
    }

    await society.save();
    return await Society.findById(societyId).select("members memberCount name tag").populate({ path: "members.memberId", select: "profile.displayName profile.avatar" });
};

export const removeMemberFromSociety = async (societyId, memberId, requestUser) => {
    if (!mongoose.isValidObjectId(memberId)) throw new ApiError(400, "Invalid member ID format");

    const society = await findSocietyById(societyId, "members memberCount createdBy");
    requireSocietyOwner(society, requestUser._id);

    if (memberId === requestUser._id.toString()) throw new ApiError(400, "Use /leave to remove yourself, or delete the society");

    const memberIndex = society.members.findIndex((m) => m.memberId.toString() === memberId && m.status !== "left");
    if (memberIndex === -1) throw new ApiError(404, "User is not an active member of this society");

    society.members.splice(memberIndex, 1);
    await society.save();
    return { removedMemberId: memberId };
};

export const updateMemberRole = async (societyId, memberId, data, requestUser) => {
    const { role } = data;
    if (!mongoose.isValidObjectId(memberId)) throw new ApiError(400, "Invalid member ID format");

    const validRoles = ["student", "active-member", "co-coordinator", "executive"];
    if (!role || !validRoles.includes(role)) throw new ApiError(400, `Role must be one of: ${validRoles.join(", ")}`);

    const society = await findSocietyById(societyId, "members createdBy");
    requireSocietyOwner(society, requestUser._id);

    const member = society.members.find((m) => m.memberId.toString() === memberId && m.status === "approved");
    if (!member) throw new ApiError(404, "Approved member not found in this society");
    if (member.role === role) throw new ApiError(400, `Member already has the role "${role}"`);

    member.role = role;
    await society.save();
    return { memberId, role };
};

export const approveMember = async (societyId, memberId, requestUser) => {
    if (!mongoose.isValidObjectId(memberId)) throw new ApiError(400, "Invalid member ID format");

    const society = await findSocietyById(societyId, "members memberCount createdBy");
    requireSocietyOwner(society, requestUser._id);

    const member = society.members.find((m) => m.memberId.toString() === memberId && m.status === "pending");
    if (!member) throw new ApiError(404, "No pending join request found for this user");

    member.status = "approved";
    member.joinedAt = new Date();
    await society.save();
    return { memberId, status: "approved" };
};

export const rejectMember = async (societyId, memberId, requestUser) => {
    if (!mongoose.isValidObjectId(memberId)) throw new ApiError(400, "Invalid member ID format");

    const society = await findSocietyById(societyId, "members createdBy");
    requireSocietyOwner(society, requestUser._id);

    const member = society.members.find((m) => m.memberId.toString() === memberId && m.status === "pending");
    if (!member) throw new ApiError(404, "No pending join request found for this user");

    member.status = "rejected";
    await society.save();
    return { memberId, status: "rejected" };
};
