import mongoose from 'mongoose';

const studyGroupSchema = new Schema({
    
    coordinatorId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
   },
    name: { 
        type: String,
        required: true 
    },
    description: {

        type: String,
        maxlength: 200,
        default: '',
   },

  chatId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat' 
   },
  noteId: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Note' 
    }
  ],
   groupMembers: [
     {
       memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
       joinedAt: { type: Date, default: Date.now },
       role: { type: String, enum: ['coordinator', 'member'], default: 'member' }
     }
   ],

   groupResources: [
     {
       fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
       title: String,
       uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
       createdAt: { type: Date, default: Date.now }
     }
   ],




}, {
    timestamps:true
});

studyGroupSchema.index({ _id: 1 });
studyGroupSchema.index({ _id: 1, 'groupMembers.userId': 1 }, { unique: true });
export const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);
