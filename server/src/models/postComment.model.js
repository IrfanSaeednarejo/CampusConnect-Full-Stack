import mongoose, { Schema } from "mongoose";

const REACTION_TYPES = ["like", "insightful", "celebrate", "support", "brilliant", "curious"];

const postCommentSchema = new Schema(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: [true, "Post reference is required"],
            index: true,
        },

        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
        },

        // null = top-level comment, ObjectId = reply
        parentId: {
            type: Schema.Types.ObjectId,
            ref: "PostComment",
            default: null,
            index: true,
        },

        body: {
            type: String,
            required: [true, "Comment body is required"],
            trim: true,
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },

        mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],

        reactions: [
            {
                userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
                type:   { type: String, enum: REACTION_TYPES, required: true },
                _id:    false,
            },
        ],

        replyCount: { type: Number, default: 0, min: 0 },
        isEdited:   { type: Boolean, default: false },

        // Soft delete — body replaced with "[deleted]"
        isDeleted:  { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Top-level comments on a post, sorted oldest-first
postCommentSchema.index({ postId: 1, parentId: 1, createdAt: 1 });
postCommentSchema.index({ authorId: 1 });

export const PostComment = mongoose.model("PostComment", postCommentSchema);
