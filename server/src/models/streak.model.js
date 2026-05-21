import mongoose, { Schema } from "mongoose";

const streakSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        streakType: {
            type: String,
            required: true,
            trim: true,
        },
        currentCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        longestCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastQualifiedAt: {
            type: Date,
            default: null,
        },
        brokenAt: {
            type: Date,
            default: null,
        },
        meta: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

streakSchema.index({ userId: 1, streakType: 1 }, { unique: true });

export const Streak = mongoose.model("Streak", streakSchema);
