import mongoose, { Schema } from "mongoose";

const certificateSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            default: null,
        },
        type: {
            type: String,
            required: true,
            trim: true,
        },
        sourceModel: {
            type: String,
            required: true,
            trim: true,
        },
        sourceId: {
            type: Schema.Types.Mixed,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
        },
        issuedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        verificationCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        qrUrl: {
            type: String,
            default: "",
        },
        pdfUrl: {
            type: String,
            default: "",
        },
        cloudinaryPublicId: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["issued", "revoked", "draft"],
            default: "issued",
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

certificateSchema.index({ userId: 1, issuedAt: -1 });
certificateSchema.index({ sourceModel: 1, sourceId: 1 });

export const Certificate = mongoose.model("Certificate", certificateSchema);
