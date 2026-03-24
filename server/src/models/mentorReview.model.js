import mongoose, { Schema } from "mongoose";

// ── Main Schema ─────────────────────────────────────────────────────────────

const mentorReviewSchema = new Schema(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "MentorBooking",
            required: [true, "Booking reference is required"],
            unique: true, // one review per booking
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

        // Detailed rating breakdown (optional)
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

        // Mentor can respond to a review
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

// ── Indexes ─────────────────────────────────────────────────────────────────

mentorReviewSchema.index({ bookingId: 1 }, { unique: true });
mentorReviewSchema.index({ mentorId: 1, createdAt: -1 });
mentorReviewSchema.index({ menteeId: 1 });
mentorReviewSchema.index({ rating: 1 });

// ── Post-save: update mentor aggregate stats ────────────────────────────────

mentorReviewSchema.post("save", async function () {
    try {
        const MentorModel = mongoose.model("Mentor");
        const stats = await mongoose.model("MentorReview").aggregate([
            { $match: { mentorId: this.mentorId } },
            {
                $group: {
                    _id: "$mentorId",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        if (stats.length > 0) {
            await MentorModel.findByIdAndUpdate(this.mentorId, {
                $set: {
                    averageRating: Math.round(stats[0].averageRating * 10) / 10,
                    totalReviews: stats[0].totalReviews,
                },
            });
        }
    } catch (err) {
        console.error("[MentorReview] Failed to update mentor stats:", err.message);
    }
});

export const MentorReview = mongoose.model("MentorReview", mentorReviewSchema);
