import mongoose from 'mongoose';

const noteSchema = new Schema({
    

  title: { type: String, required: true },
  content: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, enum: ['private','group','public'], default: 'private' },

}, {
    timestamps: true
}); 
noteSchema.index({ title: 'text', content: 'text' });

export const Note = mongoose.model('Note', noteSchema);

