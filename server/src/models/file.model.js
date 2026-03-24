import mongoose, { Schema } from "mongoose";

// ── Constants ───────────────────────────────────────────────────────────────

export const FILE_CONTEXTS = [
    "chat",
    "studygroup",
    "event",
    "mentor",
    "profile",
    "society",
    "general",
];

// ── Main Schema ─────────────────────────────────────────────────────────────

const fileSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Uploader is required"],
            index: true,
        },

        fileName: {
            type: String,
            required: [true, "File name is required"],
            trim: true,
            maxlength: [255, "File name cannot exceed 255 characters"],
        },

        fileUrl: {
            type: String,
            required: [true, "File URL is required"],
        },

        publicId: {
            type: String,
            default: "",
            select: false, // Cloudinary public ID — internal use only
        },

        mimeType: {
            type: String,
            required: [true, "MIME type is required"],
            trim: true,
            lowercase: true,
        },

        fileSize: {
            type: Number,
            required: [true, "File size is required"],
            min: [0, "File size cannot be negative"],
        },

        // ── Context: what this file belongs to ──

        context: {
            type: String,
            enum: {
                values: FILE_CONTEXTS,
                message: "{VALUE} is not a valid file context",
            },
            default: "general",
        },

        contextId: {
            type: Schema.Types.ObjectId,
            // Polymorphic: points to Chat, StudyGroup, Event, Mentor, Society, or User._id
        },

        // ── Metadata ──

        description: {
            type: String,
            trim: true,
            maxlength: [300, "Description cannot exceed 300 characters"],
            default: "",
        },

        isPublic: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ── Indexes ─────────────────────────────────────────────────────────────────

fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ context: 1, contextId: 1 });
fileSchema.index({ mimeType: 1 });

// ── Virtuals ────────────────────────────────────────────────────────────────

/**
 * Returns a human-readable file size.
 */
fileSchema.virtual("fileSizeFormatted").get(function () {
    const bytes = this.fileSize;
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
});

/**
 * Returns whether this file is an image.
 */
fileSchema.virtual("isImage").get(function () {
    return this.mimeType?.startsWith("image/") ?? false;
});

export const File = mongoose.model("File", fileSchema);
