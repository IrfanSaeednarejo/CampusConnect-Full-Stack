import mongoose from 'mongoose';
const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['dm', 'society', 'studygroup'],
      required: true,
    },

    name: {
      type: String,
      trim: true,
      required: function () {
        return this.type !== 'dm';
      },
    },

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
     isGroupChat: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['Admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    lastMessage: {
      type: Schema.Types.ObjectId, 
      ref: 'Message'
    },
  },
  { timestamps: true }
);

// chatSchema.index({ 'members.userId': 1 });
// chatSchema.index({ lastMessageAt: -1 });

export const Chat = mongoose.model('Chat', chatSchema);
