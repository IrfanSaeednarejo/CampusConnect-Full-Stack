import mongoose, { Schema } from "mongoose";

const gamificationRuleSchema = new Schema(
    {
        actionKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        module: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        points: {
            type: Number,
            required: true,
            default: 0,
        },
        frequencyLimit: {
            type: Number,
            default: 0,
            min: 0,
        },
        period: {
            type: String,
            enum: ["all_time", "day", "week", "month", "season"],
            default: "all_time",
        },
        requiresApproval: {
            type: Boolean,
            default: false,
        },
        requiresValidation: {
            type: Boolean,
            default: false,
        },
        dedupStrategy: {
            type: String,
            enum: ["action_ref", "one_time", "none", "custom"],
            default: "action_ref",
        },
        badgeHooks: {
            type: [Schema.Types.Mixed],
            default: [],
        },
        streakHooks: {
            type: [Schema.Types.Mixed],
            default: [],
        },
        dailyCap: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        priority: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const GamificationRule = mongoose.model("GamificationRule", gamificationRuleSchema);
