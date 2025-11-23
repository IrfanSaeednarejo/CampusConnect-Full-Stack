import mongoose from 'mongoose';
const mentorSchema= new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true, 
    unique: true 
  },
  hourlyRate: { 
    type: Number, 
    default: 0 
  },
    expertise: { 
    type: String, 
    required: true, 
    index: true },

  verified: { type: Boolean, default: false },

  verificationDetails: { 
    verifiedAt: Date,
    verifiedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' },
    },
    total: { 
        type: Number, 
        default: 0 },
  pending: { 
    type: Number, 
    default: 0 },

  lastPayoutAt: Date,

  booking:{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startAt: { 
        type: Date, 
        required: true 
    },

    endAt: Date,
    duration: {
        type: Number,
        required: true
    },
    paymentId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment' 
    },

    createdAt: { type: Date, default: Date.now },

  }


},{timestamps:true});

mentorSchema.index({ userId: 1 });
mentorSchema.index({ _id: 1, expertise: 1 }, { unique: true });
mentorSchema.index({ _id: 1, 'booking.userId': 1, startAt: 1 });

const Mentor = mongoose.model('Mentor', mentorSchema);