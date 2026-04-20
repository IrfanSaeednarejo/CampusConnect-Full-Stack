import mongoose, { Schema } from "mongoose";

const mentorSessionSchema = new Schema(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "MentorBooking",
            required: true,
            unique: true
        },
        mentorId: {
            type: Schema.Types.ObjectId,
            ref: "Mentor",
            required: true
        },
        menteeId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["active", "ended"],
            default: "active",
            index: true
        },
        roomId: {
            type: String,
            required: true,
            unique: true
        },
        startedAt: {
            type: Date,
            default: Date.now
        },
        endedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

export const MentorSession = mongoose.model("MentorSession", mentorSessionSchema);
