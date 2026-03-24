import mongoose, { Schema } from "mongoose";

const mentorReviewSchema = new Schema(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "MentorBooking",
            required: [true, "Booking reference is required"],
            unique: true,
        },

        mentorId: {
            type: Schema.Types.ObjectId,
            ref: "Mentor",
            required: [true, "Mentor reference is required"],
            index: true,
        },

        menteeId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Mentee reference is required"],
        },

        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },

        comment: {
            type: String,
            trim: true,
            maxlength: [1000, "Review comment cannot exceed 1000 characters"],
            default: "",
        },
        detailedRatings: {
            knowledge: { type: Number, min: 1, max: 5 },
            communication: { type: Number, min: 1, max: 5 },
            preparation: { type: Number, min: 1, max: 5 },
            responsiveness: { type: Number, min: 1, max: 5 },
        },

        isAnonymous: {
            type: Boolean,
            default: false,
        },
        mentorResponse: {
            content: {
                type: String,
                trim: true,
                maxlength: [500, "Response cannot exceed 500 characters"],
            },
            respondedAt: { type: Date },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);
mentorReviewSchema.index({ bookingId: 1 }, { unique: true });
mentorReviewSchema.index({ mentorId: 1, createdAt: -1 });
mentorReviewSchema.index({ menteeId: 1 });
mentorReviewSchema.index({ rating: 1 });

export const MentorReview = mongoose.model("MentorReview", mentorReviewSchema);
