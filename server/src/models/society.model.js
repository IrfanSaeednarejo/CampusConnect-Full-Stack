import mongoose from "mongoose";


const societySchema = new Schema({
       
    name:{
        type: String,
        required: true,
        trim: true,

    },
    description: {
        type: String,
        trim: true,
        maxlength: 300,
    },
    campusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campus'
    },
    memberId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
    },
    role: {
        type: String,
        enum: ['student', 'active-member', 'coordinator', 'co-coordinator', 'executive'],
        default: 'student'
    },
    status: { 
        type: String, enum: ['pending','approved','rejected','left'], default: 'approved' },

    tag: { 
        type: String,
        required: true,
        index: true }

    
},
    {
        timestamps: true,
    });

societySchema.index({ _id: 1, memberId: 1 }, { unique: true });
societySchema.index({ _id: 1, tag: 1 }, { unique: true });
societySchema.index({_id:1})

export const Society = mongoose.model('Society', societySchema);