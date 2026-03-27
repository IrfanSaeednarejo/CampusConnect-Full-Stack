import mongoose, { Schema } from "mongoose";
export const BOOKING_STATUSES = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no-show",
];
const mentorBookingSchema = new Schema(
    {
        mentorId: {
            type: Schema.Types.ObjectId,
            ref: "Mentor",
            required: [true, "Mentor reference is required"],
            index: true,
        },

        mentorUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        menteeId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Mentee reference is required"],
            index: true,
        },

        startAt: {
            type: Date,
            required: [true, "Session start time is required"],
        },

        endAt: {
            type: Date,
            required: [true, "Session end time is required"],
            validate: {
                validator: function (v) {
                    return v > this.startAt;
                },
                message: "End time must be after start time",
            },
        },

        duration: {
            type: Number,
            required: [true, "Duration is required"],
            min: [15, "Minimum session is 15 minutes"],
            max: [180, "Maximum session is 3 hours"],
        },

        topic: {
            type: String,
            trim: true,
            maxlength: [200, "Topic cannot exceed 200 characters"],
            default: "",
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [1000, "Notes cannot exceed 1000 characters"],
            default: "",
        },

        fee: {
            type: Number,
            required: [true, "Fee is required"],
            min: [0, "Fee cannot be negative"],
        },

        currency: {
            type: String,
            default: "PKR",
            uppercase: true,
        },

        platformFee: {
            type: Number,
            default: 0,
            min: 0,
        },

        mentorPayout: {
            type: Number,
            default: 0,
            min: 0,
        },

        status: {
            type: String,
            enum: {
                values: BOOKING_STATUSES,
                message: "{VALUE} is not a valid booking status",
            },
            default: "pending",
        },

        confirmedAt: { type: Date },

        completedAt: { type: Date },

        cancelledAt: { type: Date },
        cancelledBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        cancellationReason: {
            type: String,
            trim: true,
            maxlength: [300, "Cancellation reason cannot exceed 300 characters"],
        },
        reviewId: {
            type: Schema.Types.ObjectId,
            ref: "MentorReview",
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
mentorBookingSchema.index({ mentorId: 1, startAt: 1 });
mentorBookingSchema.index({ menteeId: 1, createdAt: -1 });
mentorBookingSchema.index({ status: 1 });
mentorBookingSchema.index({ mentorUserId: 1 });
mentorBookingSchema.index(
    { mentorId: 1, startAt: 1, endAt: 1 },
    { partialFilterExpression: { status: { $in: ["pending", "confirmed"] } } }
);
mentorBookingSchema.virtual("isUpcoming").get(function () {
    return this.startAt > new Date() && ["pending", "confirmed"].includes(this.status);
});

mentorBookingSchema.virtual("isPast").get(function () {
    return this.endAt < new Date();
});

mentorBookingSchema.virtual("hasReview").get(function () {
    return !!this.reviewId;
});

export const MentorBooking = mongoose.model("MentorBooking", mentorBookingSchema);
