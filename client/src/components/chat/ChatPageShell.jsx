import ChatShell from "./ChatShell";

export default function ChatPageShell({
	chatState,
	onCloseConversation,
	onSendMessage,
	canSend,
}) {
	if (!chatState) {
		return null;
	}

	return (
		<ChatShell
			conversations={chatState.conversations}
			selectedConversationId={chatState.selectedConversationId}
			messagesByConversation={chatState.messagesByConversation}
			pinnedConversations={chatState.pinnedConversations}
			archivedConversations={chatState.archivedConversations}
			mutedConversations={chatState.mutedConversations}
			draftsByConversation={chatState.draftsByConversation}
			searchByConversation={chatState.searchByConversation}
			typingByConversation={chatState.typingByConversation}
			hiddenMessagesByConversation={chatState.hiddenMessagesByConversation}
			forwardingMessage={chatState.forwardingMessage}
			onSelectConversation={chatState.handleSelectConversation}
			onSendMessage={onSendMessage || chatState.handleSendMessage}
			onSetDraft={chatState.setDraft}
			onSetReplyTo={chatState.setReplyTo}
			onClearReplyTo={chatState.clearReplyTo}
			onSetEditingMessage={chatState.setEditingMessage}
			onClearEditingMessage={chatState.clearEditingMessage}
			onApplyEditMessage={chatState.applyEditMessage}
			onDeleteMessageForMe={chatState.deleteMessageForMe}
			onDeleteMessageForAll={chatState.deleteMessageForAll}
			onToggleReaction={chatState.toggleReaction}
			onTogglePinConversation={chatState.togglePinConversation}
			onToggleArchiveConversation={chatState.toggleArchiveConversation}
			onToggleMuteConversation={chatState.toggleMuteConversation}
			onClearConversation={chatState.clearConversation}
			onCloseConversation={onCloseConversation || chatState.closeConversation}
			onSetSearchQuery={chatState.setSearchQuery}
			onSetTypingStatus={chatState.setTypingStatus}
			onSetForwardingMessage={chatState.setForwardingMessage}
			onClearForwardingMessage={chatState.clearForwardingMessage}
			onRetryMessage={chatState.retryMessage}
			canSend={canSend}
		/>
	);
}
