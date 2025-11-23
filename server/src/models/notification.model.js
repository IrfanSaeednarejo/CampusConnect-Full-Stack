import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({

  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true, 
    index: true },
  type: String,

  payload: {
    type: String,
    required: true,
  },

  read: { 
    type: Boolean, 
    default: false 
  },
  deliveredChannels: { 
    email: Boolean, 
    push: Boolean, 
    inApp: Boolean 
  },

},{
    timestamps: true,
});

export const Notification = mongoose.model('Notification', notificationSchema);
