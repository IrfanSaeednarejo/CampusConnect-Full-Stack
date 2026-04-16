import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createPaymentIntent,
    getMyPayments,
    verifyPayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/intent", createPaymentIntent);
router.get("/my", getMyPayments);
router.post("/verify", verifyPayment);

export default router;
