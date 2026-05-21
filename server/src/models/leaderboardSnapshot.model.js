import mongoose, { Schema } from "mongoose";

const rankingSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        campusId: { type: Schema.Types.ObjectId, ref: "Campus", default: null },
        points: { type: Number, default: 0 },
        rank: { type: Number, required: true },
        profile: {
            displayName: { type: String, default: "" },
            avatar: { type: String, default: "" },
        },
        meta: { type: Schema.Types.Mixed, default: {} },
    },
    { _id: false }
);

const leaderboardSnapshotSchema = new Schema(
    {
        scopeType: {
            type: String,
            enum: ["global", "campus", "module"],
            required: true,
        },
        scopeId: {
            type: String,
            default: "all",
        },
        period: {
            type: String,
            enum: ["all_time", "weekly", "monthly", "seasonal"],
            default: "all_time",
        },
        startAt: { type: Date, default: null },
        endAt: { type: Date, default: null },
        rankings: {
            type: [rankingSchema],
            default: [],
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

leaderboardSnapshotSchema.index({ scopeType: 1, scopeId: 1, period: 1, endAt: -1 });

export const LeaderboardSnapshot = mongoose.model("LeaderboardSnapshot", leaderboardSnapshotSchema);
