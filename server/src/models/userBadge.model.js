import mongoose, { Schema } from "mongoose";

const userBadgeSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        badgeId: {
            type: Schema.Types.ObjectId,
            ref: "Badge",
            required: true,
        },
        awardedAt: {
            type: Date,
            default: Date.now,
        },
        awardedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        refModel: {
            type: String,
            trim: true,
            default: "",
        },
        refId: {
            type: Schema.Types.Mixed,
            default: null,
        },
        meta: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: false,
        versionKey: false,
    }
);

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
userBadgeSchema.index({ userId: 1, awardedAt: -1 });

export const UserBadge = mongoose.model("UserBadge", userBadgeSchema);
