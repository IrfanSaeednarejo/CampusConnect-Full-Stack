import mongoose, { Schema } from "mongoose";

// ── Sub-schemas ─────────────────────────────────────────────────────────────

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

// ── Main Schema ─────────────────────────────────────────────────────────────

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

        // For linking to context (society or studygroup)
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

// ── Indexes ─────────────────────────────────────────────────────────────────

chatSchema.index({ "members.userId": 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ type: 1, contextId: 1 });
// For DM deduplication — find existing DM between two users
chatSchema.index(
    { type: 1, "members.userId": 1 },
    { partialFilterExpression: { type: "dm" } }
);

// ── Statics ─────────────────────────────────────────────────────────────────

/**
 * Find or create a DM chat between two users.
 * Prevents duplicate DM chats by checking both orderings.
 */
chatSchema.statics.findOrCreateDM = async function (userId1, userId2, campusId) {
    // Look for existing DM
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

/**
 * Get all chats for a user, sorted by last activity.
 */
chatSchema.statics.findUserChats = function (userId) {
    return this.find({
        "members.userId": userId,
        isArchived: false,
    })
        .sort({ lastMessageAt: -1 })
        .populate("lastMessage")
        .populate("members.userId", "profile.displayName profile.avatar");
};

export const Chat = mongoose.model("Chat", chatSchema);
