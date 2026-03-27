import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
const teamMemberSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["leader", "member"], default: "member" },
        joinedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);
const eventTeamSchema = new Schema(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event reference is required"],
            index: true,
        },

        teamName: {
            type: String,
            required: [true, "Team name is required"],
            trim: true,
            minlength: [2, "Team name must be at least 2 characters"],
            maxlength: [60, "Team name cannot exceed 60 characters"],
        },
        inviteCode: {
            type: String,
            unique: true,
            uppercase: true,
        },

        leader: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Team leader is required"],
        },

        members: {
            type: [teamMemberSchema],
            default: [],
            validate: {
                validator: function (arr) {
                    const ids = arr.map((m) => m.userId.toString());
                    return ids.length === new Set(ids).size;
                },
                message: "Duplicate members are not allowed",
            },
        },

        memberCount: { type: Number, default: 0, min: 0 },
        chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
        submissionId: { type: Schema.Types.ObjectId, ref: "EventSubmission" },

        status: {
            type: String,
            enum: {
                values: ["forming", "registered", "disqualified", "withdrawn"],
                message: "{VALUE} is not a valid team status",
            },
            default: "forming",
        },

        disqualifiedAt: { type: Date },
        disqualifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
        disqualifiedReason: { type: String, trim: true, maxlength: 300 },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

eventTeamSchema.index({ eventId: 1, status: 1 });
eventTeamSchema.index({ eventId: 1, "members.userId": 1 });
eventTeamSchema.index({ eventId: 1, leader: 1 });
eventTeamSchema.index({ inviteCode: 1 }, { unique: true });
eventTeamSchema.pre("save", async function (next) {
    if (!this.isNew) return next();

    let code;
    let attempts = 0;
    do {
        code = crypto.randomBytes(4).toString("hex").toUpperCase();
        attempts++;
        if (attempts > 20) break;
    } while (await mongoose.model("EventTeam").exists({ inviteCode: code }));

    this.inviteCode = code;
    next();
});
eventTeamSchema.pre("save", function (next) {
    if (this.isModified("members")) {
        this.memberCount = this.members.length;
    }
    next();
});

eventTeamSchema.virtual("isActive").get(function () {
    return this.status === "forming" || this.status === "registered";
});
eventTeamSchema.statics.isUserInEvent = async function (eventId, userId) {
    return this.exists({
        eventId,
        status: { $in: ["forming", "registered"] },
        "members.userId": userId,
    });
};

eventTeamSchema.statics.findUserTeam = function (eventId, userId) {
    return this.findOne({
        eventId,
        status: { $in: ["forming", "registered"] },
        "members.userId": userId,
    });
};

export const EventTeam = mongoose.model("EventTeam", eventTeamSchema);