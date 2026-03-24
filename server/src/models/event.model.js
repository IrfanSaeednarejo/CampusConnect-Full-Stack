import mongoose, { Schema } from "mongoose";

export const EVENT_CATEGORIES = [
    "academic",
    "cultural",
    "sports",
    "social",
    "workshop",
    "competition",
    "networking",
    "other",
];

export const EVENT_STATUS = ["draft", "published", "cancelled", "completed"];
const venueSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["online", "physical", "hybrid"],
            default: "physical",
            required: true,
        },
        address: {
            type: String,
            trim: true,
            maxlength: [200, "Address cannot exceed 200 characters"],
        },
        onlineUrl: {
            type: String,
            trim: true,
            validate: {
                validator: (v) => !v || /^https?:\/\/.+/.test(v),
                message: "Online URL must be a valid URL",
            },
        },
    },
    { _id: false }
);

const registrationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["registered", "waitlisted", "cancelled", "attended"],
            default: "registered",
        },
        registeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const feedbackSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, "Feedback comment cannot exceed 500 characters"],
            default: "",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const feeSchema = new Schema(
    {
        amount: {
            type: Number,
            default: 0,
            min: [0, "Fee cannot be negative"],
        },
        currency: {
            type: String,
            default: "PKR",
            uppercase: true,
            trim: true,
        },
    },
    { _id: false }
);

const eventSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [150, "Title cannot exceed 150 characters"],
        },

        description: {
            type: String,
            required: [true, "Event description is required"],
            trim: true,
            minlength: [10, "Description must be at least 10 characters"],
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },

        societyId: {
            type: Schema.Types.ObjectId,
            ref: "Society",
            required: [true, "Society ID is required"],
            index: true,
        },

        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: [true, "Campus ID is required"],
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator is required"],
        },

        category: {
            type: String,
            enum: {
                values: EVENT_CATEGORIES,
                message: "{VALUE} is not a valid event category",
            },
            default: "other",
        },

        tags: {
            type: [String],
            default: [],
            set: (arr) => [...new Set(arr.map((t) => t.trim().toLowerCase()).filter(Boolean))],
            validate: {
                validator: (arr) => arr.length <= 10,
                message: "Maximum 10 tags allowed",
            },
        },

        venue: {
            type: venueSchema,
            required: [true, "Venue information is required"],
        },

        startAt: {
            type: Date,
            required: [true, "Event start date is required"],
        },

        endAt: {
            type: Date,
            required: [true, "Event end date is required"],
            validate: {
                validator: function (v) {
                    return v > this.startAt;
                },
                message: "End date must be after start date",
            },
        },

        maxCapacity: {
            type: Number,
            default: 0,
            min: [0, "Capacity cannot be negative"],
        },

        waitlistEnabled: {
            type: Boolean,
            default: false,
        },

        requireApproval: {
            type: Boolean,
            default: false,
        },

        fee: {
            type: feeSchema,
            default: () => ({ amount: 0, currency: "PKR" }),
        },

        coverImage: {
            type: String,
            default: "",
        },

        coverImagePublicId: {
            type: String,
            default: "",
            select: false,
        },

        registrations: {
            type: [registrationSchema],
            default: [],
        },

        registrationCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        waitlistCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        feedback: {
            type: [feedbackSchema],
            default: [],
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        status: {
            type: String,
            enum: {
                values: EVENT_STATUS,
                message: "{VALUE} is not a valid event status",
            },
            default: "draft",
        },

        cancelledAt: { type: Date },
        cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
        cancellationReason: { type: String, trim: true, maxlength: 300 },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

eventSchema.index({ campusId: 1, startAt: -1 });
eventSchema.index({ societyId: 1, startAt: -1 });
eventSchema.index({ status: 1, campusId: 1 });
eventSchema.index({ category: 1, campusId: 1 });
eventSchema.index({ "registrations.userId": 1 });
eventSchema.index(
    { title: "text", description: "text", tags: "text" },
    { weights: { title: 10, tags: 5, description: 1 } }
);
eventSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 30 * 86400, partialFilterExpression: { status: "draft" } }
);

eventSchema.pre("save", function (next) {
    if (this.isModified("registrations")) {
        this.registrationCount = this.registrations.filter(
            (r) => r.status === "registered" || r.status === "attended"
        ).length;
        this.waitlistCount = this.registrations.filter(
            (r) => r.status === "waitlisted"
        ).length;
    }
    if (this.isModified("feedback")) {
        const ratings = this.feedback.map((f) => f.rating);
        this.averageRating =
            ratings.length > 0
                ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
                : 0;
    }
    next();
});

eventSchema.virtual("isFull").get(function () {
    return this.maxCapacity > 0 && this.registrationCount >= this.maxCapacity;
});

eventSchema.virtual("spotsRemaining").get(function () {
    if (this.maxCapacity === 0) return null;
    return Math.max(0, this.maxCapacity - this.registrationCount);
});

eventSchema.virtual("isPast").get(function () {
    return this.endAt < new Date();
});

eventSchema.virtual("isFree").get(function () {
    return !this.fee?.amount || this.fee.amount === 0;
});

eventSchema.statics.findUpcoming = function (campusId, limit = 10) {
    return this.find({
        campusId,
        status: "published",
        startAt: { $gte: new Date() },
    })
        .sort({ startAt: 1 })
        .limit(limit)
        .select("-registrations -feedback -coverImagePublicId");
};

export const Event = mongoose.model("Event", eventSchema);