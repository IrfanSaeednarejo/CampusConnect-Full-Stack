import mongoose, { Schema } from "mongoose";

const entityRequestSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["society", "study_group"],
            required: [true, "Request type is required"],
            index: true,
        },
        
        payload: {
            type: Schema.Types.Mixed,
            required: [true, "Request payload is required"],
        },
        
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Requester ID is required"],
            index: true,
        },
        
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        
        rejectionReason: {
            type: String,
            trim: true,
        },
        
        createdEntityId: {
            type: Schema.Types.ObjectId,
            // Depending on type, this will refer to Society or StudyGroup
        },
        
        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: [true, "Campus ID is required"],
            index: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const EntityRequest = mongoose.model("EntityRequest", entityRequestSchema);
