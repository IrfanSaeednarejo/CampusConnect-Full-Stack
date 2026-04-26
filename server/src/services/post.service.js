import mongoose from "mongoose";
import { Post }        from "../models/post.model.js";
import { PostComment } from "../models/postComment.model.js";
import { Connection }  from "../models/connection.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { paginate }    from "../utils/paginate.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { systemEvents } from "../utils/events.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const AUTHOR_POPULATE = {
    path: "authorId",
    select: "profile.displayName profile.avatar profile.firstName profile.lastName roles campusId",
    populate: { path: "campusId", select: "name code" },
};

const REPOST_POPULATE = {
    path: "repostOf",
    select: "body media type authorId poll hashtags createdAt",
    populate: AUTHOR_POPULATE,
};

/** Extract hashtags from post body text */
function extractHashtags(text = "") {
    const matches = text.match(/#(\w+)/g) || [];
    return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}

/** Emit a notification safely (fire-and-forget) */
function notify(payload) {
    try { systemEvents.emit("notification:create", payload); } catch {}
}

// ── Create Post ───────────────────────────────────────────────────────────────

export const createPost = async ({ body, type = "text", visibility = "public", poll, mentions = [] }, files = [], authorUser) => {
    if (!body?.trim() && type !== "poll" && (!files || files.length === 0)) {
        throw new ApiError(400, "Post must have a body or at least one image");
    }

    // Upload images to Cloudinary
    const mediaItems = [];
    for (const file of files) {
        const result = await uploadOnCloudinary(file.path, "posts");
        if (!result) throw new ApiError(500, "Image upload failed");
        mediaItems.push({ url: result.secure_url, publicId: result.public_id });
    }

    // Determine type from content
    let resolvedType = type;
    if (mediaItems.length > 0 && type !== "poll") resolvedType = "media";

    // Validate poll
    if (resolvedType === "poll") {
        if (!poll?.options || poll.options.length < 2 || poll.options.length > 5) {
            throw new ApiError(400, "Poll must have 2–5 options");
        }
    }

    const hashtags = extractHashtags(body);
    const validMentions = (Array.isArray(mentions) ? mentions : [])
        .filter((id) => mongoose.isValidObjectId(id));

    const post = await Post.create({
        authorId: authorUser._id,
        campusId: authorUser.campusId,
        type: resolvedType,
        body: body?.trim() || "",
        media: mediaItems,
        poll: resolvedType === "poll" ? {
            options: poll.options.map((o) => ({ text: o.text })),
            endsAt: poll.endsAt ? new Date(poll.endsAt) : null,
            allowMultiple: poll.allowMultiple || false,
        } : undefined,
        hashtags,
        mentions: validMentions,
        visibility,
        status: "published",
    });

    // Notify mentioned users
    validMentions.forEach((userId) => {
        notify({
            userId,
            type: "post_mention",
            title: `${authorUser.profile?.displayName} mentioned you in a post`,
            body: body?.substring(0, 100) || "",
            ref: post._id,
            refModel: "Post",
            actorId: authorUser._id,
            priority: "normal",
        });
    });

    return Post.findById(post._id).populate(AUTHOR_POPULATE).lean();
};

// ── Feed ──────────────────────────────────────────────────────────────────────

export const getFeed = async (feedType = "campus", page = 1, limit = 15, requestingUser) => {
    const filter = { status: "published" };

    if (feedType === "following") {
        // Get accepted connections
        const connections = await Connection.find({
            $or: [{ requester: requestingUser._id }, { recipient: requestingUser._id }],
            status: "accepted",
        }).select("requester recipient").lean();

        const followedIds = connections.map((c) =>
            c.requester.toString() === requestingUser._id.toString()
                ? c.recipient
                : c.requester
        );
        followedIds.push(requestingUser._id); // Include own posts
        filter.authorId = { $in: followedIds };
    } else {
        // campus (default) — scope to the same campus
        if (requestingUser.campusId) {
            filter.campusId = requestingUser.campusId;
        }
        // "connections" visibility posts are excluded from campus feed
        filter.visibility = { $ne: "connections" };
    }

    return paginate(Post, filter, {
        page,
        limit,
        sort: { isPinned: -1, createdAt: -1 },
        populate: [AUTHOR_POPULATE, REPOST_POPULATE],
    });
};

// ── Get Single Post ───────────────────────────────────────────────────────────

export const getPostById = async (postId, requestingUserId) => {
    if (!mongoose.isValidObjectId(postId)) throw new ApiError(400, "Invalid post ID");
    const post = await Post.findOne({ _id: postId, status: { $ne: "removed" } })
        .populate(AUTHOR_POPULATE)
        .populate(REPOST_POPULATE)
        .lean();
    if (!post) throw new ApiError(404, "Post not found");

    // Fire-and-forget view increment
    Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } }).exec().catch(() => {});

    return post;
};

// ── Update Post ───────────────────────────────────────────────────────────────

export const updatePost = async (postId, requestingUserId, { body, visibility, hashtags: customTags }) => {
    if (!mongoose.isValidObjectId(postId)) throw new ApiError(400, "Invalid post ID");

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");
    if (post.authorId.toString() !== requestingUserId.toString()) throw new ApiError(403, "Not your post");
    if (post.status === "removed") throw new ApiError(400, "Post has been removed");

    // Allow edit within 15 min OR if no engagement yet
    const ageMs = Date.now() - post.createdAt.getTime();
    const hasEngagement = post.commentCount > 0 || post.reactions.length > 0;
    if (ageMs > 15 * 60 * 1000 && hasEngagement) {
        throw new ApiError(400, "Post can no longer be edited — it has received reactions or comments");
    }

    const newHashtags = customTags ?? extractHashtags(body ?? post.body);
    await Post.findByIdAndUpdate(postId, {
        $set: {
            body: body?.trim() ?? post.body,
            visibility: visibility ?? post.visibility,
            hashtags: newHashtags,
            isEdited: true,
            editedAt: new Date(),
        },
    });

    return Post.findById(postId).populate(AUTHOR_POPULATE).lean();
};

// ── Delete Post ───────────────────────────────────────────────────────────────

export const deletePost = async (postId, requestingUser) => {
    if (!mongoose.isValidObjectId(postId)) throw new ApiError(400, "Invalid post ID");

    const post = await Post.findById(postId).select("+media.publicId");
    if (!post) throw new ApiError(404, "Post not found");

    const isOwner = post.authorId.toString() === requestingUser._id.toString();
    const isAdmin = requestingUser.roles?.some((r) => ["super_admin", "campus_admin"].includes(r));

    if (!isOwner && !isAdmin) throw new ApiError(403, "Not authorized to delete this post");

    // Soft-delete
    await Post.findByIdAndUpdate(postId, { $set: { status: "removed" } });

    // Delete images from Cloudinary async
    if (post.media?.length > 0) {
        post.media.forEach((m) => {
            if (m.publicId) deleteFromCloudinary(m.publicId).catch(() => {});
        });
    }
};

// ── React to Post ─────────────────────────────────────────────────────────────

export const reactToPost = async (postId, userId, reactionType) => {
    if (!mongoose.isValidObjectId(postId)) throw new ApiError(400, "Invalid post ID");

    const post = await Post.findOne({ _id: postId, status: "published" });
    if (!post) throw new ApiError(404, "Post not found");

    const existingIdx = post.reactions.findIndex((r) => r.userId.toString() === userId.toString());

    let action;
    if (existingIdx >= 0) {
        if (post.reactions[existingIdx].type === reactionType) {
            // Toggle off
            post.reactions.splice(existingIdx, 1);
            action = "removed";
        } else {
            // Change type
            post.reactions[existingIdx].type = reactionType;
            action = "changed";
        }
    } else {
        post.reactions.push({ userId, type: reactionType });
        action = "added";
    }

    await post.save();

    // Notify post author (not self-reactions)
    if (action === "added" && post.authorId.toString() !== userId.toString()) {
        notify({
            userId: post.authorId,
            type: "post_reaction",
            title: "Reacted to your post",
            body: `Someone reacted with ${reactionType}`,
            ref: post._id,
            refModel: "Post",
            actorId: userId,
            priority: "low",
        });
    }

    return { reactionCount: post.reactions.length, userReaction: action === "removed" ? null : reactionType };
};

// ── Repost ────────────────────────────────────────────────────────────────────

export const repostPost = async (originalPostId, authorUser, comment = "") => {
    if (!mongoose.isValidObjectId(originalPostId)) throw new ApiError(400, "Invalid post ID");

    const original = await Post.findOne({ _id: originalPostId, status: "published" });
    if (!original) throw new ApiError(404, "Original post not found");

    const repost = await Post.create({
        authorId: authorUser._id,
        campusId: authorUser.campusId,
        type: "text",
        body: comment?.trim() || "",
        visibility: "public",
        isRepost: true,
        repostOf: originalPostId,
        repostComment: comment?.trim() || "",
        status: "published",
    });

    await Post.findByIdAndUpdate(originalPostId, { $inc: { repostCount: 1 } });

    if (original.authorId.toString() !== authorUser._id.toString()) {
        notify({
            userId: original.authorId,
            type: "post_repost",
            title: `${authorUser.profile?.displayName} reposted your post`,
            body: comment?.substring(0, 100) || "",
            ref: repost._id,
            refModel: "Post",
            actorId: authorUser._id,
            priority: "low",
        });
    }

    return Post.findById(repost._id).populate(AUTHOR_POPULATE).populate(REPOST_POPULATE).lean();
};

// ── Poll Vote ─────────────────────────────────────────────────────────────────

export const voteOnPoll = async (postId, userId, optionIndexes) => {
    if (!mongoose.isValidObjectId(postId)) throw new ApiError(400, "Invalid post ID");

    const post = await Post.findOne({ _id: postId, type: "poll", status: "published" });
    if (!post) throw new ApiError(404, "Poll not found");
    if (post.poll?.endsAt && new Date() > post.poll.endsAt) throw new ApiError(400, "Poll has ended");

    if (!Array.isArray(optionIndexes) || optionIndexes.length === 0) {
        throw new ApiError(400, "Select at least one option");
    }
    if (!post.poll.allowMultiple && optionIndexes.length > 1) {
        throw new ApiError(400, "This poll only allows one selection");
    }

    // Remove user from all options (re-vote / clear)
    post.poll.options.forEach((opt) => {
        opt.voters = opt.voters.filter((v) => v.toString() !== userId.toString());
    });

    // Add to selected
    optionIndexes.forEach((idx) => {
        if (post.poll.options[idx]) {
            post.poll.options[idx].voters.push(userId);
        }
    });

    await post.save();
    return post.poll;
};

// ── Comments ──────────────────────────────────────────────────────────────────

export const addComment = async (postId, authorUser, { body, parentId, mentions = [] }) => {
    if (!mongoose.isValidObjectId(postId)) throw new ApiError(400, "Invalid post ID");
    if (!body?.trim()) throw new ApiError(400, "Comment body is required");

    const post = await Post.findOne({ _id: postId, status: "published" }).select("authorId commentCount");
    if (!post) throw new ApiError(404, "Post not found");

    let parentComment = null;
    if (parentId) {
        if (!mongoose.isValidObjectId(parentId)) throw new ApiError(400, "Invalid parent comment ID");
        parentComment = await PostComment.findById(parentId).select("authorId postId");
        if (!parentComment || parentComment.postId.toString() !== postId) {
            throw new ApiError(404, "Parent comment not found on this post");
        }
    }

    const validMentions = (Array.isArray(mentions) ? mentions : [])
        .filter((id) => mongoose.isValidObjectId(id));

    const comment = await PostComment.create({
        postId,
        authorId: authorUser._id,
        parentId: parentId || null,
        body: body.trim(),
        mentions: validMentions,
    });

    // Increment counters
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    if (parentComment) {
        await PostComment.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });
    }

    // Notify post author (not if self-commenting)
    if (post.authorId.toString() !== authorUser._id.toString()) {
        notify({
            userId: post.authorId,
            type: "post_comment",
            title: `${authorUser.profile?.displayName} commented on your post`,
            body: body.substring(0, 100),
            ref: postId,
            refModel: "Post",
            actorId: authorUser._id,
            priority: "normal",
        });
    }

    // Notify parent comment author (if reply)
    if (parentComment && parentComment.authorId.toString() !== authorUser._id.toString()
        && parentComment.authorId.toString() !== post.authorId.toString()) {
        notify({
            userId: parentComment.authorId,
            type: "post_comment",
            title: `${authorUser.profile?.displayName} replied to your comment`,
            body: body.substring(0, 100),
            ref: postId,
            refModel: "Post",
            actorId: authorUser._id,
            priority: "normal",
        });
    }

    // Notify mentions
    validMentions.forEach((userId) => {
        notify({
            userId,
            type: "post_mention",
            title: `${authorUser.profile?.displayName} mentioned you in a comment`,
            body: body.substring(0, 100),
            ref: postId,
            refModel: "Post",
            actorId: authorUser._id,
            priority: "normal",
        });
    });

    return PostComment.findById(comment._id)
        .populate({ path: "authorId", select: "profile.displayName profile.avatar roles" })
        .lean();
};

export const getComments = async (postId, { page = 1, limit = 20, parentId = null }) => {
    if (!mongoose.isValidObjectId(postId)) throw new ApiError(400, "Invalid post ID");

    const filter = { postId, parentId: parentId || null, isDeleted: false };

    return paginate(PostComment, filter, {
        page,
        limit,
        sort: { createdAt: 1 },
        populate: [{ path: "authorId", select: "profile.displayName profile.avatar roles" }],
    });
};

export const deleteComment = async (commentId, requestingUser) => {
    if (!mongoose.isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment ID");

    const comment = await PostComment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const isOwner = comment.authorId.toString() === requestingUser._id.toString();
    const isAdmin = requestingUser.roles?.some((r) => ["super_admin", "campus_admin"].includes(r));
    if (!isOwner && !isAdmin) throw new ApiError(403, "Not authorized");

    // Soft delete
    comment.isDeleted = true;
    comment.body = "[deleted]";
    await comment.save();

    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });
    if (comment.parentId) {
        await PostComment.findByIdAndUpdate(comment.parentId, { $inc: { replyCount: -1 } });
    }
};

// ── Discovery ─────────────────────────────────────────────────────────────────

export const getPostsByHashtag = async (tag, page = 1, limit = 15) => {
    const filter = { hashtags: tag.toLowerCase(), status: "published" };
    return paginate(Post, filter, {
        page, limit,
        sort: { createdAt: -1 },
        populate: [AUTHOR_POPULATE],
    });
};

export const getUserPosts = async (userId, page = 1, limit = 15) => {
    if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");
    const filter = { authorId: userId, status: "published" };
    return paginate(Post, filter, {
        page, limit,
        sort: { createdAt: -1 },
        populate: [AUTHOR_POPULATE],
    });
};

export const searchPosts = async (q, campusId, page = 1, limit = 15) => {
    if (!q?.trim()) throw new ApiError(400, "Search query is required");
    const filter = { $text: { $search: q.trim() }, status: "published" };
    if (campusId && mongoose.isValidObjectId(campusId)) filter.campusId = campusId;
    return paginate(Post, filter, {
        page, limit,
        sort: { score: { $meta: "textScore" }, createdAt: -1 },
        populate: [AUTHOR_POPULATE],
    });
};

export const getTrendingHashtags = async (campusId, limit = 10) => {
    const match = { status: "published", hashtags: { $exists: true, $not: { $size: 0 } } };
    if (campusId && mongoose.isValidObjectId(campusId)) match.campusId = new mongoose.Types.ObjectId(campusId);

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days
    match.createdAt = { $gte: since };

    return Post.aggregate([
        { $match: match },
        { $unwind: "$hashtags" },
        { $group: { _id: "$hashtags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, tag: "$_id", count: 1 } },
    ]);
};
