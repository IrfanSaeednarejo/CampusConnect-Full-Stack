import mongoose, { Schema } from "mongoose";

export const MENTOR_CATEGORIES = [
    "academic",
    "career",
    "technical",
    "wellness",
    "language",
    "entrepreneurship",
    "creative",
    "professional",
    "other",
];

export const MENTOR_TIERS = ["bronze", "silver", "gold"];
const availabilitySlotSchema = new Schema(
    {
        day: {
            type: Number,
            required: true,
            min: 0,
            max: 6,
        },
        startTime: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"],
        },
        endTime: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"],
        },
    },
    { _id: false }
);
const mentorSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            unique: true,
        },

        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            index: true,
        },

        bio: {
            type: String,
            trim: true,
            maxlength: [500, "Bio cannot exceed 500 characters"],
            default: "",
        },

        expertise: {
            type: [String],
            required: [true, "At least one expertise area is required"],
            validate: {
                validator: (arr) => arr.length >= 1 && arr.length <= 15,
                message: "Expertise must have 1-15 items",
            },
            set: (arr) => [...new Set(arr.map((e) => e.trim().toLowerCase()).filter(Boolean))],
        },

        categories: {
            type: [String],
            enum: {
                values: MENTOR_CATEGORIES,
                message: "{VALUE} is not a valid mentor category",
            },
            default: ["other"],
            validate: {
                validator: (arr) => arr.length >= 1 && arr.length <= 5,
                message: "Select 1-5 categories",
            },
        },

        hourlyRate: {
            type: Number,
            default: 0,
            min: [0, "Hourly rate cannot be negative"],
            max: [500, "Hourly rate cannot exceed 500"],
        },

        currency: {
            type: String,
            default: "PKR",
            uppercase: true,
            trim: true,
        },

        availability: {
            type: [availabilitySlotSchema],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 21,
                message: "Maximum 21 availability slots allowed",
            },
        },

        verified: {
            type: Boolean,
            default: false,
        },

        verificationDetails: {
            verifiedAt: { type: Date },
            verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
        },
        tier: {
            type: String,
            enum: MENTOR_TIERS,
            default: "bronze",
        },

        totalSessions: {
            type: Number,
            default: 0,
            min: 0,
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        totalReviews: {
            type: Number,
            default: 0,
            min: 0,
        },


        totalEarnings: {
            type: Number,
            default: 0,
            min: 0,
        },

        pendingPayout: {
            type: Number,
            default: 0,
            min: 0,
        },

        lastPayoutAt: { type: Date },

        isActive: {
            type: Boolean,
            default: true,
        },

        suspendedAt: { type: Date },
        suspendReason: { type: String, trim: true },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
mentorSchema.index({ userId: 1 }, { unique: true });
mentorSchema.index({ isActive: 1, averageRating: -1 });
mentorSchema.index({ campusId: 1, isActive: 1 });
mentorSchema.index({ categories: 1 });
mentorSchema.index({ expertise: 1 });
mentorSchema.index({ tier: 1 });
mentorSchema.index(
    { expertise: "text", bio: "text" },
    { weights: { expertise: 10, bio: 1 } }
);
mentorSchema.pre("save", function (next) {
    if (this.isModified("totalSessions") || this.isModified("averageRating")) {
        if (this.totalSessions >= 100 && this.averageRating >= 4.5) {
            this.tier = "gold";
        } else if (this.totalSessions >= 20 && this.averageRating >= 3.5) {
            this.tier = "silver";
        } else {
            this.tier = "bronze";
        }
    }
    next();
});
mentorSchema.statics.findActive = function (filter = {}) {
    return this.find({ ...filter, isActive: true, verified: true })
        .populate("userId", "profile.displayName profile.avatar profile.firstName profile.lastName")
        .select("-pendingPayout -totalEarnings -lastPayoutAt");
};

export const Mentor = mongoose.model("Mentor", mentorSchema);