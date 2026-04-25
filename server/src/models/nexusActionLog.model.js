import mongoose, { Schema } from "mongoose";

const nexusActionLogSchema = new Schema(
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
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "NexusConversation",
            index: true,
        },
        // Detected intent (e.g. "create_task", "create_note", "suggest_mentors")
        intent: {
            type: String,
            required: true,
            trim: true,
        },
        // The original user prompt that triggered this action
        inputPrompt: {
            type: String,
            maxlength: [2000, "Input prompt snapshot too long"],
        },
        // Structured JSON the AI returned before action execution
        resolvedAction: {
            type: Schema.Types.Mixed,
        },
        // Outcome of the action
        outcome: {
            type: String,
            enum: ["success", "failed", "skipped", "pending_confirmation"],
            default: "success",
        },
        outcomeReason: {
            type: String,
            trim: true,
        },
        // What model was touched
        targetModel: {
            type: String,
            enum: ["Task", "Note", "Mentor", "NexusConversation", null],
            default: null,
        },
        // ID of the created/modified document
        targetId: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        // Gemini model confidence score for the intent
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// For user-facing action history
nexusActionLogSchema.index({ userId: 1, createdAt: -1 });

// TTL: auto-expire logs after 90 days
nexusActionLogSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export const NexusActionLog = mongoose.model("NexusActionLog", nexusActionLogSchema);
