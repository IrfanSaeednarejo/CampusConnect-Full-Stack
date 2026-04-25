import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        role: {
            type: String,
            enum: ["user", "model"],
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: [10000, "Message content too long"],
        },
        // If this message triggered an AI action
        intent: {
            type: String,
            default: null,
        },
        // Result of the executed action (e.g. created note/task info)
        actionTaken: {
            type: Schema.Types.Mixed,
            default: null,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const nexusConversationSchema = new Schema(
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
            required: true,
        },
        // Auto-generated from the first user message (truncated to 60 chars)
        title: {
            type: String,
            trim: true,
            maxlength: [80, "Title cannot exceed 80 characters"],
            default: "New Conversation",
        },
        messages: {
            type: [messageSchema],
            default: [],
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
        // Tracks total messages for quick access without counting array
        messageCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient listing of user conversations (newest first)
nexusConversationSchema.index({ userId: 1, createdAt: -1 });
nexusConversationSchema.index({ userId: 1, isArchived: 1, updatedAt: -1 });

// TTL: auto-expire conversations after 180 days of inactivity
nexusConversationSchema.index(
    { updatedAt: 1 },
    { expireAfterSeconds: 180 * 24 * 60 * 60 }
);

export const NexusConversation = mongoose.model("NexusConversation", nexusConversationSchema);
