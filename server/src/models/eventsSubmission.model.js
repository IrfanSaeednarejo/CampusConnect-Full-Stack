import mongoose, { Schema } from "mongoose";
const submissionLinkSchema = new Schema(
    {
        label: { type: String, trim: true, maxlength: 60, default: "" },
        url: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (v) => /^https?:\/\/.+/.test(v),
                message: "Link must be a valid URL",
            },
        },
    },
    { _id: true }
);

const submissionFileSchema = new Schema(
    {
        fileId: {
            type: Schema.Types.ObjectId,
            ref: "File",
            required: true,
        },
    },
    { _id: false }
);
const eventSubmissionSchema = new Schema(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event reference is required"],
            index: true,
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "EventTeam",
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Submitting user is required"],
            index: true,
        },

        title: {
            type: String,
            required: [true, "Submission title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [150, "Title cannot exceed 150 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
            default: "",
        },
        links: {
            type: [submissionLinkSchema],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 10,
                message: "Maximum 10 links allowed",
            },
        },
        files: {
            type: [submissionFileSchema],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 10,
                message: "Maximum 10 file attachments allowed",
            },
        },

        status: {
            type: String,
            enum: {
                values: ["draft", "submitted", "reviewed"],
                message: "{VALUE} is not a valid submission status",
            },
            default: "draft",
        },
        version: { type: Number, default: 1, min: 1 },
        submittedAt: { type: Date },
        isLate: { type: Boolean, default: false },
        reviewNote: { type: String, trim: true, maxlength: 500, select: false },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
eventSubmissionSchema.index(
    { eventId: 1, teamId: 1 },
    { unique: true, sparse: true }
);
eventSubmissionSchema.index(
    { eventId: 1, userId: 1, teamId: null },
    { unique: true, sparse: true, partialFilterExpression: { teamId: { $exists: false } } }
);
eventSubmissionSchema.index({ eventId: 1, status: 1 });
eventSubmissionSchema.index({ submittedAt: -1 });
eventSubmissionSchema.virtual("isSubmitted").get(function () {
    return this.status === "submitted" || this.status === "reviewed";
});
eventSubmissionSchema.statics.findForParticipant = function (eventId, teamId, userId) {
    const filter = { eventId };
    if (teamId) {
        filter.teamId = teamId;
    } else {
        filter.userId = userId;
        filter.teamId = { $exists: false };
    }
    return this.findOne(filter);
};

export const EventSubmission = mongoose.model("EventSubmission", eventSubmissionSchema);