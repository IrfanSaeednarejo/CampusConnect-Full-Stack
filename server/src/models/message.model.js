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
                emoji: {
                    type: String,
                    required: true,
                    maxlength: [10, "Emoji too long"],
                },
                users: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: "User",
                    },
                ],
                _id: false,
            },
        ],

        replyPreview: {
            content: String,
            senderDisplayName: String,
            type: {
                type: String,
            },
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        isEdited: {
            type: Boolean,
            default: false,
        },

        editHistory: [
            {
                content: String,
                editedAt: {
                    type: Date,
                    default: Date.now,
                },
                _id: false,
            },
        ],

        mentions: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

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

messageSchema.statics.sendNewMessage = async function ({ chatId, senderId, type = "text", content, attachmentId, replyToId, mentions = [] }) {
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

    let replyPreviewData = undefined;
    if (replyToId && mongoose.isValidObjectId(replyToId)) {
        const parentMsg = await this.findById(replyToId).populate("sender", "profile.displayName");
        if (parentMsg) {
            replyPreviewData = {
                content: parentMsg.content || "",
                senderDisplayName: parentMsg.sender?.profile?.displayName || "Unknown User",
                type: parentMsg.type || "text",
            };
        } else {
            throw new ApiError(404, "Message being replied to not found");
        }
    }

    const targetChat = await mongoose.model("Chat").findById(chatId).select("members");
    if (!targetChat) throw new ApiError(404, "Chat not found");

    const validMemberIds = targetChat.members.map((m) => m.userId.toString());
    const validMentions = Array.isArray(mentions)
        ? mentions.filter((id) => mongoose.isValidObjectId(id) && validMemberIds.includes(id.toString()))
        : [];

    const message = await this.create({
        chat: chatId,
        sender: senderId,
        type,
        content: content?.trim() || "",
        attachment: attachmentId || undefined,
        replyTo: replyToId || undefined,
        replyPreview: replyPreviewData,
        mentions: validMentions,
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

        let parentSenderId = null;
        if (replyToId && mongoose.isValidObjectId(replyToId)) {
            const tempParent = await this.findById(replyToId).select("sender");
            if (tempParent && tempParent.sender) parentSenderId = tempParent.sender.toString();
        }

        if (targetChat && targetChat.members) {
            targetChat.members.forEach((member) => {
                const memberIdStr = member.userId.toString();
                if (member.userId && memberIdStr !== senderId.toString()) {
                    let notifTitle = "New Message";
                    let notifPriority = "high";

                    if (validMentions.includes(memberIdStr)) {
                        notifTitle = "Mentioned you";
                    } else if (parentSenderId && memberIdStr === parentSenderId) {
                        notifTitle = "Replied to you";
                    }

                    systemEvents.emit("notification:create", {
                        userId: member.userId,
                        type: "chat_message",
                        title: notifTitle,
                        body: content ? (content.substring(0, 50) + (content.length > 50 ? "..." : "")) : `Sent a ${type}`,
                        ref: chatId,
                        refModel: "Chat",
                        actorId: senderId,
                        priority: notifPriority
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
