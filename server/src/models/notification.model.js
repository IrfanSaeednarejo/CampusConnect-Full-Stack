import mongoose, { Schema } from "mongoose";
export const NOTIFICATION_TYPES = [
    "event_reminder",
    "event_update",
    "event_registration",
    "society_invite",
    "society_update",
    "mentor_booking",
    "mentor_reminder",
    "mentor_review",
    "chat_message",
    "studygroup_invite",
    "studygroup_update",
    "system",
    "admin",
];

export const NOTIFICATION_REF_MODELS = [
    "Event",
    "Society",
    "MentorBooking",
    "Chat",
    "StudyGroup",
    "User",
];

const notificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Recipient user is required"],
            index: true,
        },

        type: {
            type: String,
            enum: {
                values: NOTIFICATION_TYPES,
                message: "{VALUE} is not a valid notification type",
            },
            required: [true, "Notification type is required"],
        },

        title: {
            type: String,
            required: [true, "Notification title is required"],
            trim: true,
            maxlength: [150, "Title cannot exceed 150 characters"],
        },

        body: {
            type: String,
            trim: true,
            maxlength: [500, "Body cannot exceed 500 characters"],
            default: "",
        },
        ref: {
            type: Schema.Types.ObjectId,
        },

        refModel: {
            type: String,
            enum: {
                values: NOTIFICATION_REF_MODELS,
                message: "{VALUE} is not a valid reference model",
            },
        },
        actorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        priority: {
            type: String,
            enum: ["low", "normal", "high"],
            default: "normal",
        },

        read: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
        },

        deliveredChannels: {
            email: { type: Boolean, default: false },
            push: { type: Boolean, default: false },
            inApp: { type: Boolean, default: true },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

notificationSchema.index(
    { userId: 1 },
    { partialFilterExpression: { read: false } }
);

notificationSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 }
);
notificationSchema.statics.getUnreadCount = function (userId) {
    return this.countDocuments({ userId, read: false });
};
notificationSchema.statics.markAllRead = function (userId) {
    return this.updateMany(
        { userId, read: false },
        { $set: { read: true, readAt: new Date() } }
    );
};

export const Notification = mongoose.model("Notification", notificationSchema);
