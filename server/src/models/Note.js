import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        enum: ['All', 'Computer Science', 'Mathematics', 'Physics', 'Design', 'Business', 'Other']
    },
    description: {
        type: String
    },
    tags: [{
        type: String
    }],
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'doc', 'ppt', 'img', 'other'],
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    fileUrl: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    isShared: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Note = mongoose.model('Note', noteSchema);
