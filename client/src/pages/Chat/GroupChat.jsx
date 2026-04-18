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
	const group = useSelector(selectStudyGroupById(groupId));
	const myGroups = useSelector(selectMyStudyGroups);
	const messagesByConversation = useSelector(selectMessagesByConversation);
	const chatState = useChatPageState({ allowedTypes: ["group"] });
	const currentUser = useSelector(state => state.auth.user);

	const isMember = useMemo(
		() => myGroups.some((item) => String(item._id || item.id) === String(groupId)),
		[myGroups, groupId]
	);

	const conversationId = group ? `study-group-${group._id || group.id}` : null;

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
		return <Navigate to={`/study-groups/${groupId}/join`} replace />;
	}

	const handleClose = () => {
		navigate("/dashboard");
	};

	return (
		<ChatPageShell
			chatState={chatState}
			onCloseConversation={handleClose}
		/>
	);
}
