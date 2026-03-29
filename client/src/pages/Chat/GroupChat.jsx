import { useEffect, useMemo } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	selectStudyGroupById,
	selectMyStudyGroups,
} from "../../redux/slices/studyGroupSlice";
import {
	selectMessagesByConversation,
	setConversationMessages,
	setSelectedConversation,
} from "../../redux/slices/chatSlice";
import ChatPageShell from "../../components/chat/ChatPageShell";
import { useChatPageState } from "./ChatList";
const groupMessages = [];

const buildSeedMessages = () =>
	(groupMessages || []).map((msg) => ({
		id: `seed-${msg.id}`,
		text: msg.message,
		timestamp: new Date().toISOString(),
		senderId: msg.isOwn ? "current" : msg.author,
		senderName: msg.author,
		status: msg.isOwn ? "read" : "delivered",
	}));

export default function GroupChat() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { groupId } = useParams();
	const parsedId = Number(groupId);
	const group = useSelector(selectStudyGroupById(parsedId));
	const myGroups = useSelector(selectMyStudyGroups);
	const messagesByConversation = useSelector(selectMessagesByConversation);
	const chatState = useChatPageState({ allowedTypes: ["group"] });

	const isMember = useMemo(
		() => myGroups.some((item) => item.id === parsedId),
		[myGroups, parsedId]
	);

	const conversationId = group ? `study-group-${group.id}` : null;

	useEffect(() => {
		if (conversationId) {
			dispatch(setSelectedConversation(conversationId));
		}
	}, [conversationId, dispatch]);

	useEffect(() => {
		if (!conversationId) return;
		const existing = messagesByConversation[conversationId] || [];
		if (existing.length === 0) {
			dispatch(
				setConversationMessages({
					conversationId,
					messages: buildSeedMessages(),
				})
			);
		}
	}, [conversationId, dispatch, messagesByConversation]);

	if (!group) {
		return <Navigate to="/study-groups" replace />;
	}

	if (!isMember) {
		return <Navigate to={`/study-groups/${parsedId}/join`} replace />;
	}

	const handleClose = () => {
		navigate("/student/dashboard");
	};

	return (
		<ChatPageShell
			chatState={chatState}
			onCloseConversation={handleClose}
		/>
	);
}
