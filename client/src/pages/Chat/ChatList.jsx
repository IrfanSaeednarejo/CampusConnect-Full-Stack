import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ChatPageShell from "../../components/chat/ChatPageShell";
import { useSocket, useSocketListener } from "../../hooks";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
	selectDirectConversations,
	selectMessagesByConversation,
	selectUnreadByConversation,
	selectSelectedConversationId,
	selectPinnedConversations,
	selectArchivedConversations,
	selectMutedConversations,
	selectDraftsByConversation,
	selectSearchByConversation,
	selectTypingByConversation,
	selectHiddenMessagesByConversation,
	selectForwardingMessage,
	selectLastSeenByConversation,
	fetchMessages,
	sendMessage,
	newMessage,
	setSelectedConversation,
	setConversationMessages,
	setDraft,
	setReplyTo,
	clearReplyTo,
	setEditingMessage,
	clearEditingMessage,
	applyEditMessage,
	deleteMessageForMe,
	deleteMessageForAll,
	toggleReaction,
	togglePinConversation,
	toggleArchiveConversation,
	toggleMuteConversation,
	clearConversation,
	closeConversation,
	setSearchQuery,
	setTypingStatus,
	setForwardingMessage,
	clearForwardingMessage,
	forwardMessageToConversation,
	setConnectionStatus,
	syncPendingMessages,
	updateMessageStatus,
	markMessageFailed,
	retryMessage,
} from "../../redux/slices/chatSlice";
import { selectMyStudyGroups } from "../../redux/slices/studyGroupSlice";
import { selectAllEvents, selectRegisteredEvents } from "../../redux/slices/eventSlice";

const colorMap = {
	"user-1": "blue",
	"user-2": "teal",
	"user-3": "pink",
	"user-4": "indigo",
	"user-5": "cyan",
	"user-6": "emerald",
	"user-7": "rose",
	"user-8": "violet",
	"user-9": "amber",
	"user-10": "lime",
	"user-11": "fuchsia",
	"user-12": "sky",
	"user-13": "red",
	"user-14": "green",
	"user-15": "purple",
};

const getAvatarColor = (id, type) => {
	if (type === "group") return "group";
	return colorMap[id] || "blue";
};

const getInitials = (name) =>
	name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

const buildTimestamp = (value) => {
	if (!value) return new Date().toISOString();
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
	return parsed.toISOString();
};

const getLastMessageMeta = (messages, fallbackMessage, fallbackTimestamp) => {
	if (messages && messages.length > 0) {
		const last = messages[messages.length - 1];
		return {
			lastMessage: last.text || fallbackMessage || "",
			timestamp: buildTimestamp(last.timestamp || fallbackTimestamp),
		};
	}
	return {
		lastMessage: fallbackMessage || "",
		timestamp: buildTimestamp(fallbackTimestamp),
	};
};

const buildEventTimestamp = (date) => buildTimestamp(date);


export const useChatPageState = ({ allowedTypes }) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { emit, isConnected, error } = useSocket();

	const directConversations = useSelector(selectDirectConversations);
	const messagesByConversation = useSelector(selectMessagesByConversation);
	const unreadByConversation = useSelector(selectUnreadByConversation);
	const selectedConversationId = useSelector(selectSelectedConversationId);
	const pinnedConversations = useSelector(selectPinnedConversations);
	const archivedConversations = useSelector(selectArchivedConversations);
	const mutedConversations = useSelector(selectMutedConversations);
	const draftsByConversation = useSelector(selectDraftsByConversation);
	const searchByConversation = useSelector(selectSearchByConversation);
	const typingByConversation = useSelector(selectTypingByConversation);
	const hiddenMessagesByConversation = useSelector(selectHiddenMessagesByConversation);
	const forwardingMessage = useSelector(selectForwardingMessage);
	const lastSeenByConversation = useSelector(selectLastSeenByConversation);
	const myGroups = useSelector(selectMyStudyGroups);
	const events = useSelector(selectAllEvents);
	const registeredEvents = useSelector(selectRegisteredEvents);

	const directList = useMemo(() =>
		directConversations.map((conversation) => {
			const messages = messagesByConversation[conversation.id || conversation._id] || [];
			const meta = getLastMessageMeta(
				messages,
				conversation.lastMessage,
				conversation.timestamp || conversation.lastMessageAt
			);
			const lastSeen = lastSeenByConversation[conversation.id || conversation._id] || conversation.lastSeen;

			// For DMs, find the other member to use their name/avatar
			let computedName = conversation.name;
			let computedAvatar = conversation.avatar;

			if (conversation.type === "dm") {
				const otherMember = (conversation.members || []).find(
					(m) => m.userId?._id?.toString() !== user?._id?.toString() && 
						   m.userId?.toString() !== user?._id?.toString()
				);
				
				if (otherMember) {
					const userData = otherMember.userId?.profile || otherMember.userId || {};
					computedName = userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || "User";
					computedAvatar = userData.avatar;
				}
			}

			return {
				...conversation,
				id: conversation.id || conversation._id, // Ensure id is present
				name: computedName || "Conversation",
				avatar: computedAvatar,
				type: "user",
				unread: unreadByConversation[conversation.id || conversation._id] ?? conversation.unreadCount ?? 0,
				avatarColor: getAvatarColor(conversation.id || conversation._id, "user"),
				isPinned: pinnedConversations.includes(conversation.id || conversation._id),
				isArchived: archivedConversations.includes(conversation.id || conversation._id),
				isMuted: mutedConversations.includes(conversation.id || conversation._id),
				lastSeen,
				...meta,
			};
		}), [
			directConversations,
			messagesByConversation,
			unreadByConversation,
			pinnedConversations,
			archivedConversations,
			mutedConversations,
			lastSeenByConversation,
			user?._id
		]
	);

	const groupList = useMemo(() =>
		(myGroups || []).map((group) => {
			const conversationId = `study-group-${group.id}`;
			const messages = messagesByConversation[conversationId] || [];
			const meta = getLastMessageMeta(messages, "No messages yet", null);
			return {
				id: conversationId,
				sourceId: group.id,
				name: group.name,
				type: "group",
				avatar: getInitials(group.name || "Group"),
				members: group.members || 0,
				unread: unreadByConversation[conversationId] || 0,
				avatarColor: getAvatarColor(conversationId, "group"),
				isPinned: pinnedConversations.includes(conversationId),
				isArchived: archivedConversations.includes(conversationId),
				isMuted: mutedConversations.includes(conversationId),
				...meta,
			};
		}), [
			myGroups,
			messagesByConversation,
			unreadByConversation,
			pinnedConversations,
			archivedConversations,
			mutedConversations,
		]
	);

	const eventSource = registeredEvents.length > 0
		? registeredEvents
		: (events || []).filter((event) => event.status === "registered");

	const eventList = useMemo(() =>
		eventSource.map((event) => {
			const conversationId = `event-${event.id}`;
			const messages = messagesByConversation[conversationId] || [];
			const meta = getLastMessageMeta(messages, "No messages yet", event.date);
			return {
				id: conversationId,
				sourceId: event.id,
				name: event.title,
				type: "event",
				avatar: getInitials(event.title || "Event"),
				status: event.date,
				unread: unreadByConversation[conversationId] || 0,
				avatarColor: getAvatarColor(conversationId, "event"),
				isPinned: pinnedConversations.includes(conversationId),
				isArchived: archivedConversations.includes(conversationId),
				isMuted: mutedConversations.includes(conversationId),
				timestamp: buildEventTimestamp(meta.timestamp),
				lastMessage: meta.lastMessage,
			};
		}), [
			eventSource,
			messagesByConversation,
			unreadByConversation,
			pinnedConversations,
			archivedConversations,
			mutedConversations,
		]
	);

	const combined = useMemo(() => {
		const all = [...directList, ...groupList, ...eventList];
		const filtered = allowedTypes ? all.filter((c) => allowedTypes.includes(c.type)) : all;
		return filtered.sort((a, b) => {
			if (a.isPinned && !b.isPinned) return -1;
			if (!a.isPinned && b.isPinned) return 1;
			return new Date(b.timestamp) - new Date(a.timestamp);
		});
	}, [directList, groupList, eventList, allowedTypes]);

	const handleSelectConversation = useCallback((conversationId) => {
		const conversation = combined.find((item) => item.id === conversationId);
		if (!conversation) return;
		if (forwardingMessage) {
			dispatch(
				forwardMessageToConversation({
					conversationId,
					message: forwardingMessage.message,
				})
			);
			dispatch(clearForwardingMessage());
		}
		dispatch(setSelectedConversation(conversationId));
		if (conversation.type === "user") {
			navigate(`/student/messages/${conversationId}`);
		} else if (conversation.type === "group") {
			navigate(`/student/messages/groups/${conversation.sourceId}`);
		} else if (conversation.type === "event") {
			navigate(`/student/messages/events/${conversation.sourceId}`);
		}
	}, [combined, dispatch, navigate, forwardingMessage]);

	const handleSendMessage = useCallback((conversationId, text, options = {}) => {
		if (!conversationId || !text?.trim()) return;
		const messageId = options.messageId || `msg-${Date.now()}`;
		const message = {
			id: messageId,
			text: text.trim(),
			timestamp: new Date().toISOString(),
			senderId: "current",
			senderName: user?.name || "You",
			status: isConnected ? "sent" : "sending",
			replyToId: options.replyToId || null,
			forwarded: options.forwarded || false,
		};
		dispatch(sendMessage({ chatId: conversationId, messageData: message }));
		emit("message", { conversationId, ...message });

		if (!isConnected) {
			setTimeout(() => {
				dispatch(markMessageFailed({ conversationId, messageId }));
			}, 4000);
			return;
		}

		setTimeout(() => {
			dispatch(updateMessageStatus({
				conversationId,
				messageId,
				status: "delivered",
			}));
		}, 700);
		setTimeout(() => {
			dispatch(updateMessageStatus({
				conversationId,
				messageId,
				status: "read",
			}));
		}, 1400);
	}, [dispatch, emit, isConnected, user]);

	const handleIncomingMessage = useCallback((data) => {
		if (!data || !data.conversationId || !data.text) return;
		const message = {
			id: data.id || `msg-${Date.now()}`,
			text: data.text,
			timestamp: data.timestamp || new Date().toISOString(),
			senderId: data.senderId || "unknown",
			senderName: data.senderName || "Unknown",
			status: data.status,
		};
		dispatch(newMessage({ conversationId: data.conversationId, message }));
	}, [dispatch]);

	useSocketListener("message", handleIncomingMessage, [handleIncomingMessage]);

	useEffect(() => {
		dispatch(setConnectionStatus({ isConnected, error }));
		if (isConnected) {
			dispatch(syncPendingMessages());
		}
	}, [dispatch, isConnected, error]);

	// Fetch messages when conversation changes
	useEffect(() => {
		if (selectedConversationId) {
			dispatch(fetchMessages({ chatId: selectedConversationId }));
		}
	}, [dispatch, selectedConversationId]);

	// Wrap all dispatch actions for proper Redux integration
	const dispatchSetDraft = useCallback((payload) => dispatch(setDraft(payload)), [dispatch]);
	const dispatchSetReplyTo = useCallback((payload) => dispatch(setReplyTo(payload)), [dispatch]);
	const dispatchClearReplyTo = useCallback((payload) => dispatch(clearReplyTo(payload)), [dispatch]);
	const dispatchSetEditingMessage = useCallback((payload) => dispatch(setEditingMessage(payload)), [dispatch]);
	const dispatchClearEditingMessage = useCallback((payload) => dispatch(clearEditingMessage(payload)), [dispatch]);
	const dispatchApplyEditMessage = useCallback((payload) => dispatch(applyEditMessage(payload)), [dispatch]);
	const dispatchDeleteMessageForMe = useCallback((payload) => dispatch(deleteMessageForMe(payload)), [dispatch]);
	const dispatchDeleteMessageForAll = useCallback((payload) => dispatch(deleteMessageForAll(payload)), [dispatch]);
	const dispatchToggleReaction = useCallback((payload) => dispatch(toggleReaction(payload)), [dispatch]);
	const dispatchTogglePinConversation = useCallback((payload) => dispatch(togglePinConversation(payload)), [dispatch]);
	const dispatchToggleArchiveConversation = useCallback((payload) => dispatch(toggleArchiveConversation(payload)), [dispatch]);
	const dispatchToggleMuteConversation = useCallback((payload) => dispatch(toggleMuteConversation(payload)), [dispatch]);
	const dispatchClearConversation = useCallback((payload) => dispatch(clearConversation(payload)), [dispatch]);
	const dispatchCloseConversation = useCallback(() => dispatch(closeConversation()), [dispatch]);
	const dispatchSetSearchQuery = useCallback((payload) => dispatch(setSearchQuery(payload)), [dispatch]);
	const dispatchSetTypingStatus = useCallback((payload) => dispatch(setTypingStatus(payload)), [dispatch]);
	const dispatchSetForwardingMessage = useCallback((payload) => dispatch(setForwardingMessage(payload)), [dispatch]);
	const dispatchClearForwardingMessage = useCallback(() => dispatch(clearForwardingMessage()), [dispatch]);
	const dispatchRetryMessage = useCallback((payload) => dispatch(retryMessage(payload)), [dispatch]);

	return {
		conversations: combined,
		selectedConversationId,
		messagesByConversation,
		pinnedConversations,
		archivedConversations,
		mutedConversations,
		draftsByConversation,
		searchByConversation,
		typingByConversation,
		hiddenMessagesByConversation,
		forwardingMessage,
		handleSelectConversation,
		handleSendMessage,
		setDraft: dispatchSetDraft,
		setReplyTo: dispatchSetReplyTo,
		clearReplyTo: dispatchClearReplyTo,
		setEditingMessage: dispatchSetEditingMessage,
		clearEditingMessage: dispatchClearEditingMessage,
		applyEditMessage: dispatchApplyEditMessage,
		deleteMessageForMe: dispatchDeleteMessageForMe,
		deleteMessageForAll: dispatchDeleteMessageForAll,
		toggleReaction: dispatchToggleReaction,
		togglePinConversation: dispatchTogglePinConversation,
		toggleArchiveConversation: dispatchToggleArchiveConversation,
		toggleMuteConversation: dispatchToggleMuteConversation,
		clearConversation: dispatchClearConversation,
		closeConversation: dispatchCloseConversation,
		setSearchQuery: dispatchSetSearchQuery,
		setTypingStatus: dispatchSetTypingStatus,
		setForwardingMessage: dispatchSetForwardingMessage,
		clearForwardingMessage: dispatchClearForwardingMessage,
		retryMessage: dispatchRetryMessage,
	};
};

export default function ChatList() {
	const chatState = useChatPageState({
		allowedTypes: ["user", "group", "event"],
	});

	return (
		<ChatPageShell chatState={chatState} />
	);
}
