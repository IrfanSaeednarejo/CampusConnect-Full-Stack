import mongoose from 'mongoose';

const campusSchema = new mongoose.Schema({
   name: { type: String, required: true },
  location: { type: String, required: true },
  established: { type: Date, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

campusSchema.index({ name: 1 }, { unique: true });
campusSchema.index({ location: 1 });
campusSchema.index({ established: -1 });

export const Campus = mongoose.model('Campus', campusSchema);