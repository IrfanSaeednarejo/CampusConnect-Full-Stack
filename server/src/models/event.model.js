import mongoose, { Schema } from "mongoose";
export const EVENT_CATEGORIES = [
    "academic", "cultural", "sports", "social",
    "workshop", "competition", "networking", "other",
];

export const EVENT_STATUS = [
    "draft", "published", "cancelled", "completed",
    "registration", "ongoing", "submission_locked", "judging",
];
export const EVENT_TYPES = [
    "general", "hackathon", "coding_competition", "workshop", "seminar",
];
export const PARTICIPATION_TYPES = ["individual", "team", "both"];
const VALID_TRANSITIONS = {
    draft: ["registration", "published", "cancelled"],
    published: ["completed", "cancelled"],
    registration: ["ongoing", "cancelled"],
    ongoing: ["submission_locked", "cancelled"],
    submission_locked: ["judging"],
    judging: ["completed"],
    completed: [],
    cancelled: [],
};
const venueSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["online", "physical", "hybrid"],
            default: "physical",
            required: true,
        },
        address: { type: String, trim: true, maxlength: 200 },
        onlineUrl: {
            type: String, trim: true,
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
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ["registered", "waitlisted", "cancelled", "attended"],
            default: "registered",
        },
        registeredAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const feedbackSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 500, default: "" },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const feeSchema = new Schema(
    {
        amount: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: "PKR", uppercase: true, trim: true },
    },
    { _id: false }
);
const judgingCriterionSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        description: { type: String, trim: true, maxlength: 300, default: "" },
        maxScore: { type: Number, required: true, min: 1 },
        weight: { type: Number, default: 1, min: 0 },
    },
    { _id: true }
);

const judgingConfigSchema = new Schema(
    {
        criteria: { type: [judgingCriterionSchema], default: [] },
        isAnonymous: { type: Boolean, default: false },
        judges: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { _id: false }
);

const teamConfigSchema = new Schema(
    {
        minSize: { type: Number, default: 1, min: 1 },
        maxSize: { type: Number, default: 5, min: 1 },
        maxTeams: { type: Number, default: 0, min: 0 },
        allowSoloInTeamEvent: { type: Boolean, default: false },
    },
    { _id: false }
);

const prizeSchema = new Schema(
    {
        rank: { type: Number, required: true, min: 1 },
        prize: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 300, default: "" },
    },
    { _id: false }
);

const announcementSchema = new Schema(
    {
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const eventSchema = new Schema(
    {
        title: {
            type: String, required: [true, "Event title is required"],
            trim: true, minlength: 3, maxlength: 150,
        },
        description: {
            type: String, required: [true, "Event description is required"],
            trim: true, minlength: 10, maxlength: 2000,
        },
        societyId: {
            type: Schema.Types.ObjectId, ref: "Society",
            required: [true, "Society ID is required"], index: true,
        },
        campusId: {
            type: Schema.Types.ObjectId, ref: "Campus",
            required: [true, "Campus ID is required"], index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId, ref: "User",
            required: [true, "Creator is required"],
        },
        category: {
            type: String,
            enum: { values: EVENT_CATEGORIES, message: "{VALUE} is not a valid category" },
            default: "other",
        },
        tags: {
            type: [String], default: [],
            set: (arr) => [...new Set(arr.map((t) => t.trim().toLowerCase()).filter(Boolean))],
            validate: { validator: (arr) => arr.length <= 10, message: "Max 10 tags" },
        },
        venue: { type: venueSchema, required: [true, "Venue is required"] },
        startAt: { type: Date, required: [true, "startAt is required"] },
        endAt: {
            type: Date, required: [true, "endAt is required"],
            validate: { validator: function (v) { return v > this.startAt; }, message: "endAt must be after startAt" },
        },
        maxCapacity: { type: Number, default: 0, min: 0 },
        waitlistEnabled: { type: Boolean, default: false },
        requireApproval: { type: Boolean, default: false },
        fee: { type: feeSchema, default: () => ({ amount: 0, currency: "PKR" }) },
        coverImage: { type: String, default: "" },
        coverImagePublicId: { type: String, default: "", select: false },
        registrations: { type: [registrationSchema], default: [] },
        registrationCount: { type: Number, default: 0, min: 0 },
        waitlistCount: { type: Number, default: 0, min: 0 },
        feedback: { type: [feedbackSchema], default: [] },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        status: {
            type: String,
            enum: { values: EVENT_STATUS, message: "{VALUE} is not a valid status" },
            default: "draft",
        },
        cancelledAt: { type: Date },
        cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
        cancellationReason: { type: String, trim: true, maxlength: 300 },
        isOnlineCompetition: { type: Boolean, default: false, index: true },
        eventType: {
            type: String,
            enum: { values: EVENT_TYPES, message: "{VALUE} is not a valid event type" },
            default: "general",
        },
        participationType: {
            type: String,
            enum: { values: PARTICIPATION_TYPES, message: "{VALUE} is not a valid participation type" },
            default: "individual",
        },
        teamConfig: { type: teamConfigSchema, default: () => ({}) },
        judgingConfig: { type: judgingConfigSchema, default: () => ({}) },
        registrationDeadline: { type: Date },
        submissionDeadline: { type: Date },
        scoringPublished: { type: Boolean, default: false },
        prizePool: { type: [prizeSchema], default: [] },
        announcements: { type: [announcementSchema], default: [] },
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
eventSchema.index({ isOnlineCompetition: 1, status: 1 });
eventSchema.index({ "registrations.userId": 1 });
eventSchema.index({ "judgingConfig.judges": 1 });
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
        this.waitlistCount = this.registrations.filter((r) => r.status === "waitlisted").length;
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
    return this.maxCapacity > 0 ? Math.max(0, this.maxCapacity - this.registrationCount) : null;
});
eventSchema.virtual("isPast").get(function () { return this.endAt < new Date(); });
eventSchema.virtual("isFree").get(function () { return !this.fee?.amount || this.fee.amount === 0; });
eventSchema.virtual("isCompetition").get(function () { return this.isOnlineCompetition === true; });
eventSchema.virtual("registrationOpen").get(function () {
    const now = new Date();
    return (
        this.status === "registration" &&
        (!this.registrationDeadline || now < this.registrationDeadline)
    );
});
eventSchema.virtual("submissionsOpen").get(function () {
    const now = new Date();
    return (
        this.status === "ongoing" &&
        (!this.submissionDeadline || now < this.submissionDeadline)
    );
});

eventSchema.statics.transitionState = async function (eventId, newStatus, actorId, opts = {}) {
    const event = await this.findById(eventId);
    if (!event) throw new Error("Event not found");

    const allowed = VALID_TRANSITIONS[event.status];
    if (!allowed) throw new Error(`Unknown current status: "${event.status}"`);
    if (!allowed.includes(newStatus)) {
        throw new Error(
            `Cannot transition from "${event.status}" to "${newStatus}". ` +
            `Allowed: ${allowed.join(", ") || "none"}`
        );
    }
    if (newStatus === "registration") {
        if (!event.isOnlineCompetition) {
            throw new Error("Only competition events use the registration lifecycle");
        }
        if (!event.startAt) throw new Error("startAt must be set before opening registration");
    }

    if (newStatus === "ongoing" && event.submissionDeadline) {
        if (event.submissionDeadline <= new Date()) {
            throw new Error("submissionDeadline has already passed — update it before starting");
        }
    }

    const updates = { status: newStatus };
    if (newStatus === "cancelled") {
        updates.cancelledAt = new Date();
        updates.cancelledBy = actorId;
        if (opts.cancellationReason) updates.cancellationReason = opts.cancellationReason;
    }

    return this.findByIdAndUpdate(eventId, { $set: updates }, { new: true });
};

eventSchema.statics.findUpcoming = function (campusId, limit = 10) {
    return this.find({
        campusId,
        status: { $in: ["published", "registration"] },
        startAt: { $gte: new Date() },
    })
        .sort({ startAt: 1 })
        .limit(limit)
        .select("-registrations -feedback -coverImagePublicId");
};

export const Event = mongoose.model("Event", eventSchema);