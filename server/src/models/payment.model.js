import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "PKR",
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
            index: true,
        },
        paymentMethod: {
            type: String,
            enum: ["card", "wallet", "bank_transfer"],
        },
        transactionId: {
            type: String,
            unique: true,
            sparse: true,
        },
        description: {
            type: String,
        },
        type: {
            type: String,
            enum: ["fee", "event_registration", "mentorship_session", "donation"],
            required: true,
        },
        ref: {
            type: Schema.Types.ObjectId,
        },
        refModel: {
            type: String,
            enum: ["Event", "MentorBooking", "Society"],
        },
    },
    {
        timestamps: true,
    }
);

export const Payment = mongoose.model("Payment", paymentSchema);
