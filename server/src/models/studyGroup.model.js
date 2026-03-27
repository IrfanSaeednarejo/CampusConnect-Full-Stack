import mongoose, { Schema } from "mongoose";


const memberSchema = new Schema(
    {
        memberId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["coordinator", "member"],
            default: "member",
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const resourceSchema = new Schema(
    {
        fileId: {
            type: Schema.Types.ObjectId,
            ref: "File",
            required: true,
        },
        title: {
            type: String,
            trim: true,
            maxlength: [100, "Resource title cannot exceed 100 characters"],
            default: "",
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const scheduleSchema = new Schema(
    {
        day: {
            type: Number,
            min: 0,
            max: 6,
        },
        startTime: {
            type: String,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"],
        },
        endTime: {
            type: String,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"],
        },
        recurring: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);


const studyGroupSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Study group name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [300, "Description cannot exceed 300 characters"],
            default: "",
        },

        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: [true, "Campus ID is required"],
            index: true,
        },

        coordinatorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Coordinator is required"],
        },

        subject: {
            type: String,
            trim: true,
            maxlength: [100, "Subject cannot exceed 100 characters"],
            default: "",
        },

        course: {
            type: String,
            trim: true,
            maxlength: [100, "Course name cannot exceed 100 characters"],
            default: "",
        },

        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
        },

        groupMembers: {
            type: [memberSchema],
            default: [],
        },

        memberCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        maxMembers: {
            type: Number,
            default: 20,
            min: [2, "A study group needs at least 2 members"],
            max: [100, "A study group cannot exceed 100 members"],
        },

        groupResources: {
            type: [resourceSchema],
            default: [],
        },

        schedule: {
            type: [scheduleSchema],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 7,
                message: "Maximum 7 schedule slots allowed",
            },
        },

        isPrivate: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: {
                values: ["active", "archived", "deleted"],
                message: "{VALUE} is not a valid status",
            },
            default: "active",
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
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);


studyGroupSchema.index({ campusId: 1, status: 1 });
studyGroupSchema.index({ "groupMembers.memberId": 1 });
studyGroupSchema.index({ subject: 1, campusId: 1 });
studyGroupSchema.index({ coordinatorId: 1 });
studyGroupSchema.index(
    { name: "text", subject: "text", course: "text", tags: "text" },
    { weights: { name: 10, subject: 5, course: 3, tags: 1 } }
);


studyGroupSchema.pre("save", function (next) {
    if (this.isModified("groupMembers")) {
        this.memberCount = this.groupMembers.length;
    }
    next();
});


studyGroupSchema.virtual("isFull").get(function () {
    return this.memberCount >= this.maxMembers;
});

studyGroupSchema.virtual("spotsRemaining").get(function () {
    return Math.max(0, this.maxMembers - this.memberCount);
});

export const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);
