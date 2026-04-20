import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getNetworkState,
    sendConnectionRequest,
    respondToConnectionRequest,
    cancelConnectionRequest,
    removeConnection,
    getSuggestedMembers,
    getMutualConnections,
    getConnectionStatus
} from "../controllers/network.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/state").get(getNetworkState);
router.route("/suggested").get(getSuggestedMembers);
router.route("/mutual/:targetUserId").get(getMutualConnections);
router.route("/status/:targetUserId").get(getConnectionStatus);

router.route("/request").post(sendConnectionRequest);
router.route("/request/:connectionId/respond").patch(respondToConnectionRequest);
router.route("/request/:connectionId/cancel").delete(cancelConnectionRequest);
router.route("/:connectionId").delete(removeConnection);

export default router;
