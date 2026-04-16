import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        content: {
            type: String,
            required: [true, "Content is required"],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["personal", "academic", "shared"],
            default: "personal",
            index: true,
        },
        courseId: {
            type: String,
            trim: true,
        },
        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: true,
            index: true,
        },
        attachments: [
            {
                type: Schema.Types.ObjectId,
                ref: "File",
            },
        ],
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Note = mongoose.model("Note", noteSchema);
