import mongoose, { Schema } from "mongoose";
import { ApiError } from "../utils/ApiError.js";

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

        deliveredTo: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                deliveredAt: {
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

messageSchema.statics.sendNewMessage = async function ({ chatId, senderId, type = "text", content, attachmentId, replyToId }) {
    if (attachmentId) {
        const File = mongoose.model("File");
        const file = await File.findById(attachmentId);
        if (!file) {
            throw new ApiError(404, "Attachment file not found");
        }
        if (senderId && file.userId.toString() !== senderId.toString()) {
            throw new ApiError(403, "You do not own this attachment");
        }
        if (file.context !== "chat" || (file.contextId && file.contextId.toString() !== chatId.toString())) {

            throw new ApiError(400, "Attachment context mismatch for this chat");
        }
    }

    const message = await this.create({
        chat: chatId,
        sender: senderId,
        type,
        content: content?.trim() || "",
        attachment: attachmentId || undefined,
        replyTo: replyToId || undefined,
        readBy: senderId ? [{ userId: senderId, readAt: new Date() }] : [],
        deliveredTo: senderId ? [{ userId: senderId, deliveredAt: new Date() }] : [],
    });

    const chatUpdate = {
        $set: {
            lastMessage: message._id,
            lastMessageAt: message.createdAt,
        },
    };

    let updateOpts = {};
    if (senderId) {
        chatUpdate.$inc = { "members.$[other].unreadCount": 1 };
        updateOpts = { arrayFilters: [{ "other.userId": { $ne: senderId } }] };
    }

    await mongoose.model("Chat").findByIdAndUpdate(chatId, chatUpdate, updateOpts);

    if (senderId) {
        const { systemEvents } = await import("../utils/events.js");
        const targetChat = await mongoose.model("Chat").findById(chatId).select("members");
        if (targetChat && targetChat.members) {
            targetChat.members.forEach((member) => {
                if (member.userId && member.userId.toString() !== senderId.toString()) {
                    systemEvents.emit("notification:create", {
                        userId: member.userId,
                        type: "chat_message",
                        title: "New Message",
                        body: content ? (content.substring(0, 50) + (content.length > 50 ? "..." : "")) : `Sent a ${type}`,
                        ref: chatId,
                        refModel: "Chat",
                        actorId: senderId,
                        priority: "high"
                    });
                }
            });
        }
    }

    return this.findById(message._id)
        .populate("sender", "profile.displayName profile.avatar")
        .populate("replyTo", "content sender type")
        .populate("attachment", "fileName fileUrl mimeType fileSize");
};

messageSchema.statics.sendSystemMessage = async function (chatId, content) {
    try {
        return await this.sendNewMessage({
            chatId,
            senderId: null,
            type: "system",
            content,
        });
    } catch (err) {
        console.error("[Message Model] Failed to send system message:", err.message);
        return null;
    }
};

export const Message = mongoose.model("Message", messageSchema);
