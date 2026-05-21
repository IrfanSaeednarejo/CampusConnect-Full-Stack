import mongoose, { Schema } from "mongoose";

const userGamificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            default: null,
            index: true,
        },
        totalPoints: { type: Number, default: 0, min: 0 },
        availablePoints: { type: Number, default: 0, min: 0 },
        level: { type: Number, default: 1, min: 1 },
        xpInLevel: { type: Number, default: 0, min: 0 },
        currentStreak: { type: Number, default: 0, min: 0 },
        longestStreak: { type: Number, default: 0, min: 0 },
        badgesCount: { type: Number, default: 0, min: 0 },
        certificatesCount: { type: Number, default: 0, min: 0 },
        lastEarnedAt: { type: Date, default: null },
        seasonPoints: { type: Number, default: 0, min: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userGamificationSchema.index({ campusId: 1, totalPoints: -1 });
userGamificationSchema.index({ campusId: 1, seasonPoints: -1 });

export const UserGamification = mongoose.model("UserGamification", userGamificationSchema);
