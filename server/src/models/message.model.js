const messageSchema = new Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    attachment: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


// messageSchema.index({ chatId: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
