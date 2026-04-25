import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true,
        },
        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: [true, "Campus reference is required"],
            index: true,
        },
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },
        dueDate: {
            type: Date,
            index: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "cancelled"],
            default: "pending",
            index: true,
        },
        // How this task was created
        source: {
            type: String,
            enum: ["manual", "ai", "event", "booking"],
            default: "manual",
        },
        // Reference to the event/booking that auto-generated this task (optional)
        sourceRef: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        tags: [
            {
                type: String,
                trim: true,
                maxlength: 50,
            },
        ],
        isArchived: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        // Tracks when a reminder notification was last sent to prevent duplicates
        reminderSentAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient user task queries
taskSchema.index({ userId: 1, status: 1, dueDate: 1 });
// Index for reminder job: find upcoming tasks without sent reminders
taskSchema.index({ status: 1, dueDate: 1, reminderSentAt: 1 });

export const Task = mongoose.model("Task", taskSchema);
