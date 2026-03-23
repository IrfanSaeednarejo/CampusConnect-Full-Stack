import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import {
	selectDirectConversationById,
	setSelectedConversation,
} from "../../redux/slices/chatSlice";
import ChatPageShell from "../../components/chat/ChatPageShell";
import { useChatPageState } from "./ChatList";

export default function Conversation() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { conversationId } = useParams();
	const conversation = useSelector(
		selectDirectConversationById(conversationId)
	);
	const chatState = useChatPageState({ allowedTypes: ["user"] });

	useEffect(() => {
		if (conversationId) {
			dispatch(setSelectedConversation(conversationId));
		}
	}, [conversationId, dispatch]);

	if (!conversation) {
		return <Navigate to="/student/messages" replace />;
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
