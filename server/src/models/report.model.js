import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
    {
        reporterId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        targetModel: {
            type: String,
            required: true,
            enum: ["User", "Event", "Society", "StudyGroup", "MentorBooking", "Message"],
        },
        reason: {
            type: String,
            required: true,
            enum: [
                "spam",
                "harassment",
                "inappropriate_content",
                "fraud",
                "intellectual_property",
                "other"
            ],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "dismissed", "resolved"],
            default: "pending",
        },
        adminNotes: {
            type: String,
            trim: true,
            default: "",
        },
        resolvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        resolvedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Indexes for fast querying
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetId: 1, targetModel: 1 });
reportSchema.index({ reporterId: 1 });

export const Report = mongoose.model("Report", reportSchema);
