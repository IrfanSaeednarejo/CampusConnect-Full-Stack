import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        chat: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: [true, "Chat reference is required"],
            index: true,
        },

        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        type: {
            type: String,
            enum: {
                values: ["text", "image", "file", "system"],
                message: "{VALUE} is not a valid message type",
            },
            default: "text",
        },

        content: {
            type: String,
            trim: true,
            maxlength: [2000, "Message cannot exceed 2000 characters"],
            validate: {
                validator: function (v) {
                    if (this.type === "text" || this.type === "system") {
                        return v && v.trim().length > 0;
                    }
                    return true;
                },
                message: "Text messages cannot be empty",
            },
        },

        attachment: {
            type: Schema.Types.ObjectId,
            ref: "File",
        },

        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },

        readBy: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                },
                _id: false,
            },
        ],

        reactions: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                emoji: {
                    type: String,
                    required: true,
                    maxlength: [10, "Emoji too long"],
                },
                _id: false,
            },
        ],

        isDeleted: {
            type: Boolean,
            default: false,
        },

        editedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

messageSchema.index({ chat: 1, createdAt: -1 });

messageSchema.index({ chat: 1, "readBy.userId": 1 });
messageSchema.index({ chat: 1, _id: -1 });

messageSchema.statics.getChatMessages = function (chatId, { before, limit = 50 } = {}) {
    const filter = { chat: chatId, isDeleted: false };

    if (before) {
        filter._id = { $lt: before };
    }

    return this.find(filter)
        .sort({ _id: -1 })
        .limit(Math.min(limit, 100))
        .populate("sender", "profile.displayName profile.avatar")
        .populate("replyTo", "content sender type")
        .populate("attachment", "fileName fileUrl mimeType fileSize");
};

export const Message = mongoose.model("Message", messageSchema);
