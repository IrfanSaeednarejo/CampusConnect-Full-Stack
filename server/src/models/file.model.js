import mongoose from 'mongoose';

const fileSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
     fileName: {
        type: String,
        required: true
    },
     fileUrl: {
        type: String,
        required: true
    },
     fileType: {
        type: String,
        required: true
    },
     fileSize: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});

fileSchema.index({ userId: 1 });
fileSchema.index({ fileName: 1 });
fileSchema.index({ fileType: 1 });
fileSchema.index({ uploadedAt: -1 });
fileSchema.index({ fileSize: 1 });
export const File = mongoose.model('File', fileSchema);

