import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useAutoScroll } from "../../hooks";
import "../../styles/components/chat.scss";

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const formatDayLabel = (timestamp) => {
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) return "";
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);
	const isToday = date.toDateString() === today.toDateString();
	const isYesterday = date.toDateString() === yesterday.toDateString();
	if (isToday) return "Today";
	if (isYesterday) return "Yesterday";
	return date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
};

const noop = () => {};

export default function ChatShell({
	conversations = [],
	selectedConversationId = null,
	messagesByConversation = {},
	pinnedConversations = [],
	archivedConversations = [],
	mutedConversations = [],
	draftsByConversation = {},
	searchByConversation = {},
	typingByConversation = {},
	hiddenMessagesByConversation = {},
	forwardingMessage = null,
	onSelectConversation = noop,
	onSendMessage = noop,
	onSetDraft = noop,
	onSetReplyTo = noop,
	onClearReplyTo = noop,
	onSetEditingMessage = noop,
	onClearEditingMessage = noop,
	onApplyEditMessage = noop,
	onDeleteMessageForMe = noop,
	onDeleteMessageForAll = noop,
	onToggleReaction = noop,
	onTogglePinConversation = noop,
	onToggleArchiveConversation = noop,
	onToggleMuteConversation = noop,
	onClearConversation = noop,
	onCloseConversation = noop,
	onSetSearchQuery = noop,
	onSetTypingStatus = noop,
	onSetForwardingMessage = noop,
	onClearForwardingMessage = noop,
	onRetryMessage = noop,
	canSend = true,
}) {
	const navigate = useNavigate();
	const [showArchived, setShowArchived] = useState(false);
	const searchInputRef = useRef(null);
	const selectedConversation = conversations.find(
		(conversation) => conversation.id === selectedConversationId
	);
	const rawMessages = selectedConversationId
		? messagesByConversation[selectedConversationId] || []
		: [];
	const hiddenMessages = selectedConversationId
		? hiddenMessagesByConversation[selectedConversationId] || []
		: [];
	const searchQuery = selectedConversationId
		? searchByConversation[selectedConversationId] || ""
		: "";
	const draft = selectedConversationId
		? draftsByConversation[selectedConversationId] || {
				text: "",
				replyToId: null,
				editingMessageId: null,
			}
		: { text: "", replyToId: null, editingMessageId: null };
	const typingStatus = selectedConversationId
		? typingByConversation[selectedConversationId]
		: null;

	const visibleMessages = rawMessages.filter(
		(message) => !hiddenMessages.includes(message.id)
	);

	const filteredMessages = searchQuery
		? visibleMessages.filter((message) =>
			message.text?.toLowerCase().includes(searchQuery.toLowerCase())
		)
		: visibleMessages;

	const [visibleCount, setVisibleCount] = useState(40);
	const messagesToRender = filteredMessages.slice(
		Math.max(filteredMessages.length - visibleCount, 0)
	);

	const scrollRef = useAutoScroll(messagesToRender);

	const messagesWithSeparators = useMemo(() => {
		let lastDay = "";
		const output = [];
		messagesToRender.forEach((message) => {
			const day = formatDayLabel(message.timestamp);
			if (day && day !== lastDay) {
				output.push({ type: "separator", id: `sep-${message.id}`, label: day });
				lastDay = day;
			}
			output.push({ type: "message", id: message.id, message });
		});
		return output;
	}, [messagesToRender]);

	const visibleConversations = useMemo(() => {
		if (!showArchived) {
			return conversations.filter((conversation) => !conversation.isArchived);
		}
		return conversations;
	}, [conversations, showArchived]);

	useEffect(() => {
		if (searchQuery && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [searchQuery]);

	const handleSend = useCallback(() => {
		if (!selectedConversationId) return;
		if (!draft.text.trim()) return;
		if (draft.editingMessageId) {
			onApplyEditMessage({
				conversationId: selectedConversationId,
				messageId: draft.editingMessageId,
				text: draft.text.trim(),
			});
			onClearEditingMessage({ conversationId: selectedConversationId });
			onSetDraft({ conversationId: selectedConversationId, text: "" });
			return;
		}
		onSendMessage(selectedConversationId, draft.text, {
			replyToId: draft.replyToId,
		});
		onSetDraft({ conversationId: selectedConversationId, text: "" });
		onClearReplyTo({ conversationId: selectedConversationId });
	}, [
		draft,
		onApplyEditMessage,
		onClearEditingMessage,
		onClearReplyTo,
		onSendMessage,
		onSetDraft,
		selectedConversationId,
	]);

	const handleRetry = useCallback((message) => {
		if (!selectedConversationId) return;
		onRetryMessage({ conversationId: selectedConversationId, messageId: message.id });
		onSendMessage(selectedConversationId, message.text, { messageId: message.id });
	}, [onRetryMessage, onSendMessage, selectedConversationId]);

	const handleSearchChange = (value) => {
		if (!selectedConversationId) return;
		onSetSearchQuery({ conversationId: selectedConversationId, query: value });
	};

	const handleInputChange = (value) => {
		if (!selectedConversationId) return;
		onSetDraft({ conversationId: selectedConversationId, text: value });
		onSetTypingStatus({
			conversationId: selectedConversationId,
			isTyping: value.length > 0,
			userName: "You",
		});
	};

	const handleReply = (message) => {
		if (!selectedConversationId) return;
		onSetReplyTo({ conversationId: selectedConversationId, messageId: message.id });
	};

	const handleEdit = (message) => {
		if (!selectedConversationId) return;
		onSetEditingMessage({ conversationId: selectedConversationId, messageId: message.id });
		onSetDraft({ conversationId: selectedConversationId, text: message.text });
	};

	const handleForward = (message) => {
		onSetForwardingMessage({
			message: {
				...message,
				senderId: "current",
				senderName: "You",
			},
		});
	};

	const handleDelete = (message, deleteForAll) => {
		if (!selectedConversationId) return;
		if (deleteForAll) {
			onDeleteMessageForAll({ conversationId: selectedConversationId, messageId: message.id });
			return;
		}
		onDeleteMessageForMe({ conversationId: selectedConversationId, messageId: message.id });
	};

	const handleReact = (message, emoji) => {
		if (!selectedConversationId) return;
		onToggleReaction({
			conversationId: selectedConversationId,
			messageId: message.id,
			emoji,
			userId: "current",
		});
	};

	const handleCloseChat = () => {
		onCloseConversation();
		onSetSearchQuery({ conversationId: selectedConversationId, query: "" });
		navigate("/student/dashboard");
	};

	const handleArchive = () => {
		if (!selectedConversationId) return;
		onToggleArchiveConversation({ conversationId: selectedConversationId });
		onCloseConversation();
	};

	const handleMute = () => {
		if (!selectedConversationId) return;
		onToggleMuteConversation({ conversationId: selectedConversationId });
	};

	const handlePin = () => {
		if (!selectedConversationId) return;
		onTogglePinConversation({ conversationId: selectedConversationId });
	};

	const handleClearChat = () => {
		if (!selectedConversationId) return;
		onClearConversation({ conversationId: selectedConversationId });
	};

	const handleCancelForward = () => {
		onClearForwardingMessage();
	};

	return (
		<div className="messaging-container">
			<ChatSidebar
				conversations={visibleConversations}
				selectedId={selectedConversationId}
				onSelectConversation={onSelectConversation}
				archivedCount={archivedConversations.length}
				showArchived={showArchived}
				onToggleArchived={() => setShowArchived((prev) => !prev)}
			/>

			{selectedConversation ? (
				<div className="chat-window">
					<ChatHeader
						conversation={selectedConversation}
						avatarColor={selectedConversation.avatarColor}
						isMuted={selectedConversation.isMuted}
						isArchived={selectedConversation.isArchived}
						isPinned={selectedConversation.isPinned}
						isTyping={typingStatus?.isTyping}
						typingName={typingStatus?.userName}
						lastSeen={selectedConversation.lastSeen}
						searchQuery={searchQuery}
						searchInputRef={searchInputRef}
						onSearch={handleSearchChange}
						onClose={handleCloseChat}
						onArchive={handleArchive}
						onMute={handleMute}
						onPin={handlePin}
						onClearChat={handleClearChat}
					/>

					{forwardingMessage && (
						<div className="forward-banner">
							<span>Forwarding message - select a chat</span>
							<button onClick={handleCancelForward}>Cancel</button>
						</div>
					)}

					<div className="message-list" ref={scrollRef}>
						<div className="conversation-start"></div>
						{filteredMessages.length > visibleCount && (
							<button
								className="load-earlier"
								onClick={() => setVisibleCount((prev) => prev + 40)}
							>
								Load earlier messages
							</button>
						)}
						{messagesWithSeparators.map((entry) =>
							entry.type === "separator" ? (
								<div key={entry.id} className="day-separator">
									<span>{entry.label}</span>
								</div>
							) : (
								<MessageBubble
									key={entry.id}
									message={entry.message}
									isCurrentUser={entry.message.senderId === "current"}
									userColor={selectedConversation.avatarColor}
									quickReactions={quickReactions}
									replyMessage={
										entry.message.replyToId
											? visibleMessages.find((msg) => msg.id === entry.message.replyToId)
											: null
									}
									onReply={() => handleReply(entry.message)}
									onEdit={() => handleEdit(entry.message)}
									onForward={() => handleForward(entry.message)}
									onDelete={(deleteForAll) => handleDelete(entry.message, deleteForAll)}
									onReact={(emoji) => handleReact(entry.message, emoji)}
									onRetry={() => handleRetry(entry.message)}
									isSearchMatch={
										searchQuery &&
										entry.message.text
											?.toLowerCase()
											.includes(searchQuery.toLowerCase())
									}
								/>
							)
						)}

						{typingStatus?.isTyping && (
							<div className="typing-indicator">
								<div className="typing-bubble">
									<span className="dot"></span>
									<span className="dot"></span>
									<span className="dot"></span>
								</div>
								<span className="typing-label">typing...</span>
							</div>
						)}
					</div>
					{canSend && (
						<ChatInput
							value={draft.text}
							onChange={handleInputChange}
							onSend={handleSend}
							replyMessage={
								draft.replyToId
									? visibleMessages.find((msg) => msg.id === draft.replyToId)
									: null
							}
							onCancelReply={() =>
								onClearReplyTo({ conversationId: selectedConversationId })
							}
							isEditing={!!draft.editingMessageId}
							onCancelEdit={() =>
								onClearEditingMessage({ conversationId: selectedConversationId })
							}
						/>
					)}
				</div>
			) : (
				<div className="chat-window no-conversation-selected">
					<div className="placeholder-content">
						<div className="placeholder-icon">
							<MessageSquare size={64} />
						</div>
						<h3>Select a conversation</h3>
						<p>Choose a chat from the sidebar to start messaging</p>
						<button
							className="start-chat-button"
							onClick={() => {
								if (conversations.length > 0) {
									onSelectConversation(conversations[0].id);
								}
							}}
						>
							Open any Chat
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
