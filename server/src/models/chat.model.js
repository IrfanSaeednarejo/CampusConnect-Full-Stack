import mongoose, { Schema } from "mongoose";
const chatMemberSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member",
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        unreadCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { _id: false }
);
const chatSchema = new Schema(
    {
        type: {
            type: String,
            enum: {
                values: ["dm", "society", "studygroup"],
                message: "{VALUE} is not a valid chat type",
            },
            required: [true, "Chat type is required"],
        },

        name: {
            type: String,
            trim: true,
            maxlength: [100, "Chat name cannot exceed 100 characters"],
            required: function () {
                return this.type !== "dm";
            },
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
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: {
            type: [chatMemberSchema],
            default: [],
            validate: {
                validator: function (arr) {
                    if (this.type === "dm") return arr.length === 2;
                    return arr.length >= 1;
                },
                message: "DM chats must have exactly 2 members; group chats need at least 1",
            },
        },

        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },

        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        contextId: {
            type: Schema.Types.ObjectId,
        },

        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

chatSchema.index({ "members.userId": 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ type: 1, contextId: 1 });
chatSchema.index(
    { type: 1, "members.userId": 1 },
    { partialFilterExpression: { type: "dm" } }
);

chatSchema.statics.findOrCreateDM = async function (userId1, userId2, campusId) {
    const existing = await this.findOne({
        type: "dm",
        "members.userId": { $all: [userId1, userId2] },
    });

    if (existing) return { chat: existing, created: false };

    const chat = await this.create({
        type: "dm",
        createdBy: userId1,
        campusId,
        members: [
            { userId: userId1, role: "member" },
            { userId: userId2, role: "member" },
        ],
    });

    return { chat, created: true };
};

chatSchema.statics.findUserChats = function (userId) {
    return this.find({
        "members.userId": userId,
        isArchived: false,
    })
        .sort({ lastMessageAt: -1 })
        .populate("lastMessage")
        .populate("members.userId", "profile.displayName profile.avatar");
};

chatSchema.statics.markAsRead = async function (chatId, userId) {
    const chat = await this.findById(chatId).select("members");
    if (!chat) return null;

    const memberIndex = chat.members.findIndex(
        (m) => m.userId.toString() === userId.toString()
    );

    if (memberIndex === -1) {
        throw new Error("User is not a member of this chat");
    }

    if (chat.members[memberIndex].unreadCount === 0) {
        return { alreadyRead: true };
    }

    await this.findByIdAndUpdate(chatId, {
        $set: { [`members.${memberIndex}.unreadCount`]: 0 },
    });

    await mongoose.model("Message").updateMany(
        {
            chat: chatId,
            isDeleted: false,
            "readBy.userId": { $ne: userId },
            sender: { $ne: userId },
        },
        {
            $push: { readBy: { userId, readAt: new Date() } },
        }
    );

    return { alreadyRead: false };
};

chatSchema.methods.hasMember = function (userId) {
    return this.members.some((m) => m.userId.toString() === userId.toString());
};

chatSchema.methods.getMember = function (userId) {
    return this.members.find((m) => m.userId.toString() === userId.toString());
};

chatSchema.methods.isAdmin = function (userId) {
    const member = this.getMember(userId);
    return member && member.role === "admin";
};

export const Chat = mongoose.model("Chat", chatSchema);
