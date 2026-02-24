import { useEffect, useMemo } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	selectAllEvents,
	selectEventById,
	selectRegisteredEvents,
} from "../../redux/slices/eventSlice";
import { setSelectedConversation } from "../../redux/slices/chatSlice";
import ChatPageShell from "../../components/chat/ChatPageShell";
import { useChatPageState } from "./ChatList";

const isEventExpired = (event) => {
	if (!event) return true;
	const status = (event.status || "").toLowerCase();
	if (status.includes("past") || status.includes("completed") || status.includes("closed")) {
		return true;
	}
	const parsed = Date.parse(event.date);
	if (!Number.isNaN(parsed)) {
		return parsed < Date.now();
	}
	return false;
};

export default function EventChat() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { eventId } = useParams();
	const parsedId = Number(eventId);
	const event = useSelector(selectEventById(parsedId));
	const allEvents = useSelector(selectAllEvents);
	const registeredEvents = useSelector(selectRegisteredEvents);
	const chatState = useChatPageState({ allowedTypes: ["event"] });

	const isRegistered = useMemo(() => {
		if (!event) return false;
		if (event.status === "registered") return true;
		return registeredEvents.some((item) => item.id === parsedId);
	}, [event, registeredEvents, parsedId]);

	const fallbackEvent = useMemo(() =>
		allEvents.find((item) => item.id === parsedId), [allEvents, parsedId]
	);

	const activeEvent = event || fallbackEvent;
	const canSend = !isEventExpired(activeEvent);
	const conversationId = activeEvent ? `event-${activeEvent.id}` : null;

	useEffect(() => {
		if (conversationId) {
			dispatch(setSelectedConversation(conversationId));
		}
	}, [conversationId, dispatch]);

	if (!activeEvent) {
		return <Navigate to="/student/events" replace />;
	}

	if (!isRegistered) {
		return <Navigate to="/student/events" replace />;
	}

	const handleClose = () => {
		navigate("/student/dashboard");
	};

	return (
		<ChatPageShell
			chatState={chatState}
			onCloseConversation={handleClose}
			canSend={canSend}
		/>
	);
}
