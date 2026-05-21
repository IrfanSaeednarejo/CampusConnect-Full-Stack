import mongoose, { Schema } from "mongoose";

const pointsTransactionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            default: null,
            index: true,
        },
        actionKey: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        module: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        points: {
            type: Number,
            required: true,
        },
        direction: {
            type: String,
            enum: ["credit", "debit"],
            default: "credit",
            required: true,
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
        dedupKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        awardedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        ruleId: {
            type: Schema.Types.ObjectId,
            ref: "GamificationRule",
            default: null,
        },
        status: {
            type: String,
            enum: ["awarded", "blocked", "reversed", "pending"],
            default: "awarded",
        },
        reason: {
            type: String,
            trim: true,
            default: "",
            maxlength: 300,
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

pointsTransactionSchema.index({ userId: 1, createdAt: -1 });
pointsTransactionSchema.index({ campusId: 1, createdAt: -1 });
pointsTransactionSchema.index({ actionKey: 1, refId: 1 });

export const PointsTransaction = mongoose.model("PointsTransaction", pointsTransactionSchema);
