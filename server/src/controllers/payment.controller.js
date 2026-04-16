import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/payment.model.js";

const createPaymentIntent = asyncHandler(async (req, res) => {
    const { amount, type, ref, refModel, description } = req.body;

    if (!amount || !type) {
        throw new ApiError(400, "Amount and type are required");
    }

    const payment = await Payment.create({
        amount,
        type,
        ref,
        refModel,
        description,
        userId: req.user._id,
        status: "pending",
    });

    return res.status(201).json(new ApiResponse(201, payment, "Payment intent created"));
});

const getMyPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, payments, "Payments fetched successfully"));
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { paymentId, transactionId, status } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        throw new ApiError(404, "Payment not found");
    }

    payment.transactionId = transactionId;
    payment.status = status || "completed";
    await payment.save();

    return res.status(200).json(new ApiResponse(200, payment, "Payment verified successfully"));
});

export { createPaymentIntent, getMyPayments, verifyPayment };