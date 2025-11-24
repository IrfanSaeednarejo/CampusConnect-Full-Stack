import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    contactId: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true, 
        trim: true,
        maxlength: 100,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true,
});


export const Contact = mongoose.model('Contact', contactSchema);

