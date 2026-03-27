import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createOrGetDM,
    getMyChats,
    getChatById,
    updateGroupChat,
    addMemberToChat,
    removeMemberFromChat,
    sendMessage,
    getChatMessages,
    editMessage,
    deleteMessage,
    markChatAsRead,
    toggleReaction,
} from "../controllers/chat.controller.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/")
    .get(getMyChats);

router
    .route("/dm")
    .post(createOrGetDM);

router
    .route("/:chatId")
    .get(getChatById)
    .patch(updateGroupChat);

router
    .route("/:chatId/read")
    .patch(markChatAsRead);
router
    .route("/:chatId/members")
    .post(addMemberToChat);

router
    .route("/:chatId/members/:userId")
    .delete(removeMemberFromChat);

router
    .route("/:chatId/messages")
    .get(getChatMessages)
    .post(sendMessage);
router
    .route("/:chatId/messages/:msgId")
    .patch(editMessage)
    .delete(deleteMessage);

router
    .route("/:chatId/messages/:msgId/react")
    .post(toggleReaction);

export default router;