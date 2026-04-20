import mongoose, { Schema } from "mongoose";

const connectionSchema = new Schema(
    {
        requester: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Ensure unique pairs of requests
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Connection = mongoose.model("Connection", connectionSchema);
