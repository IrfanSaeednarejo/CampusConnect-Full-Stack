import mongoose, { Schema } from "mongoose";

const criteriaScoreSchema = new Schema(
    {
        criterionId: { type: Schema.Types.ObjectId },
        name: { type: String, required: true, trim: true },
        score: { type: Number, required: true, min: 0 },
        maxScore: { type: Number, required: true, min: 1 },
        weight: { type: Number, default: 1, min: 0 },
        comment: { type: String, trim: true, maxlength: 500, default: "" },
    },
    { _id: false }
);
const eventScoreSchema = new Schema(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "Event reference is required"],
            index: true,
        },

        submissionId: {
            type: Schema.Types.ObjectId,
            ref: "EventSubmission",
            required: [true, "Submission reference is required"],
            index: true,
        },

        judgeId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Judge reference is required"],
        },

        criteria: {
            type: [criteriaScoreSchema],
            default: [],
        },
        totalScore: { type: Number, default: 0, min: 0 },
        maxPossibleScore: { type: Number, default: 0 },
        feedback: { type: String, trim: true, maxlength: 1000, default: "" },
        isPublished: { type: Boolean, default: false },
        scoredAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);
eventScoreSchema.index(
    { submissionId: 1, judgeId: 1 },
    { unique: true }
);
eventScoreSchema.index({ eventId: 1, isPublished: 1 });
eventScoreSchema.index({ judgeId: 1 });
eventScoreSchema.pre("save", function (next) {
    if (!this.isModified("criteria")) return next();

    if (!this.criteria || this.criteria.length === 0) {
        this.totalScore = 0;
        this.maxPossibleScore = 0;
        return next();
    }

    const totalWeight = this.criteria.reduce((sum, c) => sum + (c.weight || 1), 0);

    if (totalWeight === 0) {
        this.totalScore = this.criteria.reduce((sum, c) => sum + c.score, 0);
        this.maxPossibleScore = this.criteria.reduce((sum, c) => sum + c.maxScore, 0);
    } else {
        const weightedScore = this.criteria.reduce(
            (sum, c) => sum + (c.score / c.maxScore) * (c.weight || 1),
            0
        );
        this.totalScore = parseFloat(((weightedScore / totalWeight) * 100).toFixed(2));
        this.maxPossibleScore = 100;
    }

    next();
});
eventScoreSchema.statics.generateLeaderboard = async function (eventId) {
    return this.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId), isPublished: true } },
        {
            $group: {
                _id: "$submissionId",
                averageScore: { $avg: "$totalScore" },
                judgeCount: { $sum: 1 },
                maxPossibleScore: { $first: "$maxPossibleScore" },
            },
        },
        {
            $lookup: {
                from: "eventsubmissions",
                localField: "_id",
                foreignField: "_id",
                as: "submission",
            },
        },
        { $unwind: { path: "$submission", preserveNullAndEmpty: true } },
        { $sort: { averageScore: -1, "submission.submittedAt": 1 } },
        {
            $setWindowFields: {
                sortBy: { averageScore: -1, "submission.submittedAt": 1 },
                output: { rank: { $rank: {} } },
            },
        },
        {
            $lookup: {
                from: "eventteams",
                localField: "submission.teamId",
                foreignField: "_id",
                as: "team",
            },
        },
        {
            $lookup: {
                from: "users",
                let: { uid: "$submission.userId" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
                    { $project: { "profile.displayName": 1, "profile.avatar": 1 } },
                ],
                as: "user",
            },
        },
        {
            $project: {
                _id: 0,
                rank: 1,
                submissionId: "$_id",
                averageScore: { $round: ["$averageScore", 2] },
                judgeCount: 1,
                submission: {
                    _id: "$submission._id",
                    title: "$submission.title",
                    submittedAt: "$submission.submittedAt",
                    links: "$submission.links",
                    isLate: "$submission.isLate",
                },
                team: { $cond: { if: { $gt: [{ $size: "$team" }, 0] }, then: { $first: "$team" }, else: null } },
                user: { $cond: { if: { $gt: [{ $size: "$user" }, 0] }, then: { $first: "$user" }, else: null } },
            },
        },
    ]);
};
eventScoreSchema.statics.publishAllForEvent = function (eventId) {
    return this.updateMany(
        { eventId: new mongoose.Types.ObjectId(eventId) },
        { $set: { isPublished: true } }
    );
};

export const EventScore = mongoose.model("EventScore", eventScoreSchema);