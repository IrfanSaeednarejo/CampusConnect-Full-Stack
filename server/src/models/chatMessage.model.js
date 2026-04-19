import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema(
    {
        roomId: {
            type: String, // String mapping to mentorSession.roomId
            required: true,
            index: true
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["text", "file"],
            default: "text"
        },
        readBy: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    { timestamps: true } // automatically provides createdAt/updatedAt
);

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
