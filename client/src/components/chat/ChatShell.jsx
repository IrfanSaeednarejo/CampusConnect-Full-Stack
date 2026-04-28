import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Menu, X, ArrowLeft } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useAutoScroll } from "../../hooks";

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
	onHandleTyping = noop,
    onDisconnect = noop,
	canSend = true,
	currentUser = null,
}) {
	const navigate = useNavigate();
	const [showArchived, setShowArchived] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
			(message.content || message.text || '').toLowerCase().includes(searchQuery.toLowerCase())
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
			const day = formatDayLabel(message.timestamp || message.createdAt);
			if (day && day !== lastDay) {
				output.push({ type: "separator", id: `sep-${message.id || message._id}`, label: day });
				lastDay = day;
			}
            
            const replyMsg = message.replyToId
				? visibleMessages.find((msg) => (msg._id || msg.id) === message.replyToId)
				: null;
            
            const enhancedMessage = {
                ...message,
                replyPreview: replyMsg ? {
                    senderDisplayName: replyMsg.senderName || replyMsg.sender?.profile?.displayName || 'User',
                    content: replyMsg.content || replyMsg.text || 'Message'
                } : null
            };

			output.push({ type: "message", id: message.id || message._id, message: enhancedMessage });
		});
		return output;
	}, [messagesToRender, visibleMessages]);

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

	// Responsive sidebar handling
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setIsSidebarOpen(false);
			} else {
				setIsSidebarOpen(true);
			}
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleSelectConversation = (id) => {
		onSelectConversation(id);
		if (window.innerWidth < 768) {
			setIsSidebarOpen(false);
		}
	};

	const handleSend = useCallback(() => {
		if (!selectedConversationId || !draft.text.trim()) return;
		if (draft.editingMessageId) {
			onApplyEditMessage({ conversationId: selectedConversationId, messageId: draft.editingMessageId, text: draft.text.trim() });
			onClearEditingMessage({ conversationId: selectedConversationId });
			onSetDraft({ conversationId: selectedConversationId, text: "" });
			return;
		}
		onSendMessage(selectedConversationId, draft.text, { replyToId: draft.replyToId });
		onSetDraft({ conversationId: selectedConversationId, text: "" });
		onClearReplyTo({ conversationId: selectedConversationId });
	}, [draft, onApplyEditMessage, onClearEditingMessage, onClearReplyTo, onSendMessage, onSetDraft, selectedConversationId]);

	return (
		<div className="flex h-full w-full bg-[#0d1117] overflow-hidden relative">
			{/* Sidebar - Responsive Drawer */}
			<div className={`
				fixed inset-0 z-40 md:relative md:inset-auto md:z-10
				transition-transform duration-300 ease-in-out
				${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
				${!isSidebarOpen ? 'md:hidden' : 'md:flex md:w-[350px]'}
			`}>
				{/* Mobile Overlay */}
				{isSidebarOpen && (
					<div 
						className="absolute inset-0 bg-black/60 md:hidden z-[-1]" 
						onClick={() => setIsSidebarOpen(false)}
					/>
				)}
				<ChatSidebar
					conversations={visibleConversations}
					selectedId={selectedConversationId}
					onSelectConversation={handleSelectConversation}
					archivedCount={archivedConversations.length}
					showArchived={showArchived}
					onToggleArchived={() => setShowArchived((prev) => !prev)}
				/>
			</div>

			{/* Main Chat Window */}
			<div className="flex-1 flex flex-col min-w-0 bg-[#0d1117] relative">
				{selectedConversation ? (
					<>
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
							onSearch={(query) => onSetSearchQuery({ conversationId: selectedConversationId, query })}
							onClose={() => setIsSidebarOpen(true)}
							onArchive={() => onToggleArchiveConversation({ conversationId: selectedConversationId })}
							onMute={() => onToggleMuteConversation({ conversationId: selectedConversationId })}
							onPin={() => onTogglePinConversation({ conversationId: selectedConversationId })}
							onClearChat={() => onClearConversation({ conversationId: selectedConversationId })}
							onDisconnect={() => onDisconnect(selectedConversationId)}
						/>

						{forwardingMessage && (
							<div className="bg-emerald-600/10 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-emerald-400 text-xs font-medium">
								<span className="flex items-center gap-2">
									<MessageSquare size={14} />
									Forwarding message... select a contact
								</span>
								<button onClick={onClearForwardingMessage} className="hover:text-white transition-colors">Cancel</button>
							</div>
						)}

						<div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-4" ref={scrollRef}>
							{filteredMessages.length > visibleCount && (
								<button
									className="mx-auto block bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all"
									onClick={() => setVisibleCount((prev) => prev + 40)}
								>
									Load earlier messages
								</button>
							)}
							
							<div className="flex flex-col">
								{messagesWithSeparators.map((entry) =>
									entry.type === "separator" ? (
										<div key={entry.id} className="flex items-center justify-center my-6">
											<span className="bg-[#161b22] text-[#8b949e] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-[#30363d]">
												{entry.label}
											</span>
										</div>
									) : (
										<MessageBubble
											key={entry.id}
											message={entry.message}
											isCurrentUser={
												entry.message.senderId === "current" ||
												entry.message.senderId === currentUser?._id?.toString() ||
                                                entry.message.sender?._id === currentUser?._id
											}
											userColor={selectedConversation.avatarColor}
											onReply={() => onSetReplyTo({ conversationId: selectedConversationId, messageId: entry.message.id })}
											onEdit={() => {
												onSetEditingMessage({ conversationId: selectedConversationId, messageId: entry.message.id });
												onSetDraft({ conversationId: selectedConversationId, text: entry.message.text || entry.message.content });
											}}
											onForward={() => onSetForwardingMessage({ message: entry.message })}
											onDelete={(deleteForAll) => {
												if (deleteForAll) onDeleteMessageForAll({ conversationId: selectedConversationId, messageId: entry.message.id });
												else onDeleteMessageForMe({ conversationId: selectedConversationId, messageId: entry.message.id });
											}}
											onReact={(emoji) => onToggleReaction({ conversationId: selectedConversationId, messageId: entry.message.id, emoji, userId: "current" })}
											isSearchMatch={searchQuery && (entry.message.content || entry.message.text || '').toLowerCase().includes(searchQuery.toLowerCase())}
										/>
									)
								)}
							</div>
						</div>

						{typingStatus?.isTyping && (
							<div className="px-6 py-2 text-[11px] text-emerald-400 font-medium italic animate-pulse">
								{typingStatus.userName || 'Someone'} is typing...
							</div>
						)}

						{canSend && (
							<ChatInput
								value={draft.text}
								onChange={(val) => {
									onSetDraft({ conversationId: selectedConversationId, text: val });
									onSetTypingStatus({ conversationId: selectedConversationId, isTyping: val.length > 0, userName: "You" });
									onHandleTyping();
								}}
								onSend={handleSend}
								replyMessage={draft.replyToId ? rawMessages.find(m => (m._id || m.id) === draft.replyToId) : null}
								onCancelReply={() => onClearReplyTo({ conversationId: selectedConversationId })}
								isEditing={!!draft.editingMessageId}
								onCancelEdit={() => onClearEditingMessage({ conversationId: selectedConversationId })}
							/>
						)}
					</>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0d1117]">
						<div className="w-24 h-24 bg-[#161b22] border border-[#30363d] rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-2xl shadow-emerald-500/5">
							<MessageSquare size={48} className="opacity-50" />
						</div>
						<h3 className="text-2xl font-bold text-white mb-2">Your Conversations</h3>
						<p className="text-[#8b949e] max-w-sm mb-8 leading-relaxed">
							Select a chat from the sidebar to start messaging. Your chats are encrypted and secure.
						</p>
						<button
							onClick={() => conversations.length > 0 && handleSelectConversation(conversations[0].id)}
							className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold transition-all hover:-translate-y-1 shadow-lg shadow-emerald-900/20"
						>
							Open Recent Chat
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
