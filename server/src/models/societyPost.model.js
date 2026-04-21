import mongoose, { Schema } from "mongoose";

const societyPostSchema = new Schema(
    {
        societyId: {
            type: Schema.Types.ObjectId,
            ref: "Society",
            required: [true, "Society ID is required"],
            index: true,
        },

        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
        },

        content: {
            type: String,
            required: [true, "Post content is required"],
            trim: true,
            maxlength: [1000, "Post content cannot exceed 1000 characters"],
            validate: {
                validator: function (v) {
                    const wordCount = v.trim().split(/\s+/).filter(Boolean).length;
                    return wordCount <= 150;
                },
                message: "Post content cannot exceed 150 words",
            },
        },

        images: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 2,
                message: "A post cannot have more than 2 images",
            },
        },

        // Stored separately for Cloudinary cleanup; excluded from default queries
        imagePublicIds: {
            type: [String],
            default: [],
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

societyPostSchema.index({ societyId: 1, createdAt: -1 });

export const SocietyPost = mongoose.model("SocietyPost", societyPostSchema);
