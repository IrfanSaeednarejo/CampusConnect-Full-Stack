import mongoose from "mongoose";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { Society } from "../models/society.model.js";
import { SocietyPost } from "../models/societyPost.model.js";
import { Event } from "../models/event.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const uploadFile = async (localPath) => {
    if (!localPath) return null;
    try {
        return await uploadOnCloudinary(localPath);
    } finally {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
};

/**
 * Returns the member record for the given userId in the society,
 * throwing 404 if they are not an approved member.
 */
const getApprovedMemberRecord = async (societyId, userId) => {
    const society = await Society.findById(societyId).select("members createdBy");
    if (!society) throw new ApiError(404, "Society not found");

    const member = society.members.find(
        (m) => m.memberId.toString() === userId.toString() && m.status === "approved"
    );

    // Society creator is always treated as society_head regardless of members array
    const isCreator = society.createdBy.toString() === userId.toString();
    if (!member && !isCreator) {
        throw new ApiError(403, "You must be an approved member to access this");
    }

    return { society, member, isCreator };
};

/**
 * Returns the effective role of a user inside a society.
 * Creators are always "society_head".
 */
const getEffectiveMemberRole = (society, userId) => {
    if (society.createdBy.toString() === userId.toString()) return "society_head";
    const member = society.members.find(
        (m) => m.memberId.toString() === userId.toString() && m.status === "approved"
    );
    return member?.role ?? null;
};

// ── Post CRUD ─────────────────────────────────────────────────────────────────

export const getPosts = async (societyId, queryParams, requestUser) => {
    if (!mongoose.isValidObjectId(societyId)) throw new ApiError(400, "Invalid society ID");

    const { page = 1, limit = 20 } = queryParams;

    // Require the user to be an approved member to read posts
    await getApprovedMemberRecord(societyId, requestUser._id);

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
        SocietyPost.find({ societyId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("authorId", "profile.displayName profile.avatar profile.firstName profile.lastName"),
        SocietyPost.countDocuments({ societyId }),
    ]);

    return {
        posts,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
        },
    };
};

export const createPost = async (societyId, data, files, requestUser) => {
    if (!mongoose.isValidObjectId(societyId)) throw new ApiError(400, "Invalid society ID");

    const society = await Society.findById(societyId).select("members createdBy name status");
    if (!society) throw new ApiError(404, "Society not found");
    if (society.status !== "approved") throw new ApiError(403, "This society is not currently active");

    // Role gate: only society_head or co-coordinator can post
    const role = getEffectiveMemberRole(society, requestUser._id);
    if (!role) throw new ApiError(403, "You must be an approved member of this society");
    if (!["society_head", "co-coordinator"].includes(role)) {
        throw new ApiError(403, "Only the Society Head or Co-Coordinators can create announcements");
    }

    const { content } = data;
    if (!content?.trim()) throw new ApiError(400, "Post content is required");

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 150) throw new ApiError(400, `Post content exceeds 150 words (got ${wordCount})`);

    // Upload images (max 2)
    const imageFiles = files || [];
    if (imageFiles.length > 2) throw new ApiError(400, "You can attach a maximum of 2 images per post");

    const uploadedImages = [];
    const uploadedPublicIds = [];

    for (const file of imageFiles) {
        const result = await uploadFile(file.path);
        if (result?.secure_url) {
            uploadedImages.push(result.secure_url);
            uploadedPublicIds.push(result.public_id);
        }
    }

    const post = await SocietyPost.create({
        societyId,
        authorId: requestUser._id,
        content: content.trim(),
        images: uploadedImages,
        imagePublicIds: uploadedPublicIds,
    });

    return await SocietyPost.findById(post._id).populate(
        "authorId",
        "profile.displayName profile.avatar profile.firstName profile.lastName"
    );
};

export const deletePost = async (societyId, postId, requestUser) => {
    if (!mongoose.isValidObjectId(postId)) throw new ApiError(400, "Invalid post ID");

    const post = await SocietyPost.findById(postId).select("+imagePublicIds");
    if (!post) throw new ApiError(404, "Post not found");
    if (post.societyId.toString() !== societyId) throw new ApiError(400, "Post does not belong to this society");

    const society = await Society.findById(societyId).select("createdBy members");
    if (!society) throw new ApiError(404, "Society not found");

    const isAuthor = post.authorId.toString() === requestUser._id.toString();
    const isHead = society.createdBy.toString() === requestUser._id.toString();

    if (!isAuthor && !isHead) {
        throw new ApiError(403, "You can only delete your own posts, or you must be the Society Head");
    }

    // Clean up Cloudinary assets
    for (const publicId of post.imagePublicIds || []) {
        deleteFromCloudinary(publicId).catch((err) =>
            console.error("[SocietyPost] Cloudinary cleanup failed:", err.message)
        );
    }

    await SocietyPost.findByIdAndDelete(postId);
    return { postId };
};

// ── Society Events ────────────────────────────────────────────────────────────

export const getSocietyEvents = async (societyId, queryParams = {}, requestUser = null) => {
    if (!mongoose.isValidObjectId(societyId)) throw new ApiError(400, "Invalid society ID");

    const now = new Date();
    const sId = new mongoose.Types.ObjectId(societyId);
    
    const { approvalStatus } = queryParams;
    const filter = { societyId: sId };

    if (approvalStatus) {
        filter.approvalStatus = approvalStatus;
    } else {
        filter.approvalStatus = "approved";
        filter.status = { $in: ["published", "registration", "ongoing", "submission_locked", "judging", "completed"] };
    }

    const events = await Event.find(filter)
        .select("title description banner startAt endAt venue status format registrationCount coverImage approvalStatus rejectionReason")
        .sort({ startAt: 1 })
        .lean();

    if (approvalStatus) {
        return { events };
    }

    const upcoming = [];
    const ongoing = [];
    const past = [];

    for (const ev of events) {
        const start = ev.startAt ? new Date(ev.startAt) : null;
        const end = ev.endAt ? new Date(ev.endAt) : null;

        if (ev.status === "cancelled" || ev.status === "completed" || (end && end < now)) {
            past.push(ev);
        } else if (start && start <= now && (!end || end >= now)) {
            ongoing.push(ev);
        } else {
            upcoming.push(ev);
        }
    }

    return { upcoming, ongoing, past };
};
