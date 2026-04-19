import mongoose, { Schema } from "mongoose";

const systemEventSchema = new Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        eventType: {
            type: String,
            required: true,
            index: true
        },
        version: {
            type: String,
            default: "v1"
        },
        actorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        targetId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        payload: {
            type: Schema.Types.Mixed,
            default: {}
        },
        status: {
            type: String,
            enum: ["emitted", "processed", "failed"],
            default: "emitted",
            index: true
        },
        error: {
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    { 
        timestamps: true,
        versionKey: false 
    }
);

// Index for event replay and cleaning
systemEventSchema.index({ eventType: 1, timestamp: -1 });

export const SystemEvent = mongoose.model("SystemEvent", systemEventSchema);
