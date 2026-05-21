import { useDispatch, useSelector } from "react-redux";
import useHomeTheme from "@/hooks/useHomeTheme";
import IconButton from "../common/IconButton";
import {
  selectConversations,
  selectActiveConversationId,
  selectConversationsLoading,
  fetchConversationThunk,
  deleteConversationThunk,
  startConversationThunk,
} from "../../redux/slices/nexusSlice";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function NexusSidebar() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const conversations = useSelector(selectConversations);
  const activeId = useSelector(selectActiveConversationId);
  const loading = useSelector(selectConversationsLoading);

  const handleNew = () => dispatch(startConversationThunk());
  const handleSelect = (id) => {
    if (id !== activeId) dispatch(fetchConversationThunk(id));
  };
  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this conversation?")) dispatch(deleteConversationThunk(id));
  };

  return (
    <div className="theme-surface flex min-h-0 w-72 shrink-0 flex-col border-y-0 border-l-0 transition-colors duration-300">
      <style>
        {`
          .nexus-sidebar-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .nexus-sidebar-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <div className="border-b border-border px-4 py-4 transition-colors duration-300">
        <div className="flex items-center justify-end">
          <IconButton
            onClick={handleNew}
            id="nexus-new-chat-btn"
            title="New conversation"
            label="New conversation"
            variant="secondary"
            size="md"
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          />
        </div>
      </div>

      <div className="nexus-sidebar-scroll flex-1 overflow-y-auto px-2 py-3">
        <div className="px-3 pb-2 pt-1">
          <p className="theme-muted text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300">
            Conversation history
          </p>
          <p className="mt-1 text-xs text-text-primary transition-colors duration-300">
            {conversations.length} saved thread{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="theme-surface-muted mx-2 mt-2 rounded-3xl px-5 py-8 text-center transition-colors duration-300">
            <div className="theme-surface mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-primary transition-colors duration-300">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-9 5 1.405-1.405A2.032 2.032 0 0 0 6 16.158V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10.159a2.032 2.032 0 0 0 .595 1.436L20 19l-1.405-1.405A2.032 2.032 0 0 1 18 16.159V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10.159a2.032 2.032 0 0 1-.595 1.436L4 19Z" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-semibold text-text-primary transition-colors duration-300">
              No conversations yet
            </p>
            <p className="theme-muted mt-2 text-xs leading-6 transition-colors duration-300">
              Start a new chat and your recent threads will appear here for quick access.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => handleSelect(conv._id)}
              className={`group mx-1 flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition-colors ${
                conv._id === activeId
                  ? "border-primary/30 bg-primary/10"
                  : "border-transparent hover:border-border hover:bg-surface-muted"
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                  conv._id === activeId
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-muted text-text-secondary"
                }`}
              >
                {(conv.title || "N").trim().charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    conv._id === activeId ? "text-primary" : "text-text-primary"
                  }`}
                >
                  {conv.title}
                </p>
                <p className="theme-muted mt-1 text-[11px] transition-colors duration-300">
                  {formatDate(conv.updatedAt)} | {conv.messageCount || 0} msg
                  {conv.messageCount !== 1 ? "s" : ""}
                </p>
              </div>

              <IconButton
                onClick={(e) => handleDelete(e, conv._id)}
                className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                title="Delete conversation"
                label="Delete conversation"
                variant="ghost"
                size="sm"
                icon={
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
