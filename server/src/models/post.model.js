import mongoose, { Schema } from "mongoose";

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const mediaSchema = new Schema(
    {
        url:      { type: String, required: true },
        publicId: { type: String, required: true, select: false },
    },
    { _id: false }
);

const REACTION_TYPES = ["like", "insightful", "celebrate", "support", "brilliant", "curious"];

const reactionSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type:   { type: String, enum: REACTION_TYPES, required: true },
    },
    { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const pollOptionSchema = new Schema(
    {
        text:   { type: String, required: true, trim: true, maxlength: [100, "Option cannot exceed 100 characters"] },
        voters: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { _id: true }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const postSchema = new Schema(
    {
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
            index: true,
        },

        type: {
            type: String,
            enum: ["text", "media", "poll"],
            default: "text",
        },

        body: {
            type: String,
            trim: true,
            maxlength: [2000, "Post cannot exceed 2000 characters"],
            default: "",
        },

        // Images only, max 4
        media: {
            type: [mediaSchema],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 4,
                message: "A post cannot have more than 4 images",
            },
        },

        // Poll block — only relevant when type === "poll"
        poll: {
            options:       { type: [pollOptionSchema], default: undefined },
            endsAt:        { type: Date },
            allowMultiple: { type: Boolean, default: false },
        },

        // Discovery
        hashtags: [{ type: String, lowercase: true, trim: true }],
        mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],

        // Audience
        visibility: {
            type: String,
            enum: ["public", "campus", "connections"],
            default: "public",
        },
        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            index: true,
        },

        // Engagement counters (denormalized for fast feed queries)
        reactions:    { type: [reactionSchema], default: [] },
        commentCount: { type: Number, default: 0, min: 0 },
        repostCount:  { type: Number, default: 0, min: 0 },
        viewCount:    { type: Number, default: 0, min: 0 },

        // Repost
        isRepost:      { type: Boolean, default: false },
        repostOf:      { type: Schema.Types.ObjectId, ref: "Post" },
        repostComment: { type: String, trim: true, maxlength: [500, "Repost comment cannot exceed 500 characters"], default: "" },

        // Lifecycle
        status: {
            type: String,
            enum: ["published", "draft", "removed"],
            default: "published",
            index: true,
        },
        isPinned:  { type: Boolean, default: false },
        isEdited:  { type: Boolean, default: false },
        editedAt:  { type: Date },

        // Moderation
        moderationScore: { type: Number, default: 0 },
        reportCount:     { type: Number, default: 0 },
    },
    { timestamps: true, versionKey: false }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ authorId: 1, status: 1, createdAt: -1 });
postSchema.index({ campusId: 1, status: 1, createdAt: -1 });
postSchema.index({ hashtags: 1, status: 1, createdAt: -1 });
postSchema.index({ "reactions.userId": 1 });

// Text index for search
postSchema.index({ body: "text", hashtags: "text" });

// ── Virtual ───────────────────────────────────────────────────────────────────

postSchema.virtual("reactionCount").get(function () {
    return this.reactions.length;
});

export const REACTION_TYPES_LIST = REACTION_TYPES;
export const Post = mongoose.model("Post", postSchema);
