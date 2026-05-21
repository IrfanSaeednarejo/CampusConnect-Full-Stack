import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSocietyById,
  fetchSocietyMembers,
  fetchSocietyPosts,
  fetchSocietyEvents,
  createSocietyPostThunk,
  deleteSocietyPostThunk,
  joinSocietyThunk,
  leaveSocietyThunk,
  approveMemberThunk,
  rejectMemberThunk,
  selectCurrentSociety,
  selectSocietyMembers,
  selectMemberRequests,
  selectSocietyLoading,
  selectMembersLoading,
  selectSocietyError,
  selectSocietyAnnouncements,
  selectAnnouncementsLoading,
  selectSocietyEvents,
  selectEventsLoading,
  clearCurrentSociety,
} from "../../redux/slices/societySlice";
import { fetchModuleLeaderboard, selectGamificationLeaderboards } from "../../redux/slices/gamificationSlice";
import { selectUser } from "../../redux/slices/authSlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import ConfirmModal from "../../components/common/ConfirmModal";
import IconButton from "../../components/common/IconButton";
import { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getSocietyTheme, cn } from "./societyTheme";
import LeaderboardTable from "../../components/gamification/LeaderboardTable";

const TABS = [
  { id: "overview", label: "Overview", icon: "info" },
  { id: "members", label: "Members", icon: "people" },
  { id: "events", label: "Events", icon: "event" },
  { id: "announcements", label: "Announcements", icon: "campaign" },
];

const ROLE_CONFIG = {
  "society_head": { label: "Society Head", class: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" },
  "co-coordinator": { label: "Co-Coordinator", class: "bg-blue-500/15 text-blue-400 border border-blue-500/25" },
  "active-member": { label: "Active Member", class: "bg-info/10 text-info border border-info/25" },
  "executive": { label: "Executive", class: "bg-amber-500/15 text-amber-400 border border-amber-500/25" },
  "student": { label: "Student", class: "bg-slate-500/15 text-slate-400 border border-slate-500/25" },
};

const EVENT_STATUS_CONFIG = {
  "published": { label: "Published", class: "bg-blue-500/15 text-blue-400" },
  "ongoing": { label: "Ongoing", class: "bg-emerald-500/15 text-emerald-400" },
  "completed": { label: "Completed", class: "bg-slate-500/15 text-slate-400" },
  "cancelled": { label: "Cancelled", class: "bg-red-500/15 text-red-400" },
  "draft": { label: "Draft", class: "bg-amber-500/15 text-amber-400" },
};

function getMemberName(m) {
  const p = m.memberId?.profile ?? m.profile ?? {};
  if (p.displayName) return p.displayName;
  const first = p.firstName ?? "";
  const last = p.lastName ?? "";
  return `${first} ${last}`.trim() || m.memberId?.email || "Unknown Member";
}

function getMemberAvatar(m) {
  return m.memberId?.profile?.avatar ?? m.profile?.avatar ?? null;
}

function getInitials(name) {
  return name.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function countWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function getRoleBadgeClass(role, isDark) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
  if (isDark) return cfg.class;

  const lightClasses = {
    society_head: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    "co-coordinator": "border border-sky-200 bg-sky-50 text-sky-700",
    "active-member": "border border-blue-200 bg-blue-50 text-blue-700",
    executive: "border border-amber-200 bg-amber-50 text-amber-700",
    student: "border border-slate-200 bg-slate-100 text-slate-600",
  };

  return lightClasses[role] ?? lightClasses.student;
}

function getEventStatusClass(status, isDark) {
  if (isDark) return (EVENT_STATUS_CONFIG[status] ?? { class: "bg-slate-500/15 text-slate-400" }).class;

  const lightClasses = {
    published: "bg-sky-50 text-sky-700 border border-sky-200",
    ongoing: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    completed: "bg-slate-100 text-slate-600 border border-slate-200",
    cancelled: "bg-danger/5 text-danger border border-danger/20",
    draft: "bg-amber-50 text-amber-700 border border-amber-200",
  };

  return lightClasses[status] ?? "bg-slate-100 text-slate-600 border border-slate-200";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MemberAvatar({ member, size = "md", isDark }) {
  const name = getMemberName(member);
  const avatar = getMemberAvatar(member);
  const sz = size === "lg" ? "w-14 h-14 text-base" : "w-9 h-9 text-xs";
  return avatar ? (
    <img
      src={avatar}
      alt={name}
      className={cn(
        sz,
        "rounded-full object-cover flex-shrink-0 border",
        isDark ? "border-slate-700" : "border-slate-200"
      )}
    />
  ) : (
    <div
      className={cn(
        sz,
        "rounded-full flex items-center justify-center font-bold border flex-shrink-0",
        isDark
          ? "bg-slate-700 text-slate-300 border-slate-600"
          : "bg-slate-100 text-slate-600 border-slate-200"
      )}
    >
      {getInitials(name)}
    </div>
  );
}

function RoleBadge({ role, isDark }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG["student"];
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${getRoleBadgeClass(role, isDark)}`}>
      {cfg.label}
    </span>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ society, members, isDark, theme, leaderboardRows = [] }) {
  const head = members.find(m => m.role === "society_head" || m.role === "executive");
  const headName = head ? getMemberName(head) : society.createdBy?.profile?.displayName ?? "Unknown";
  const headAvatar = head ? getMemberAvatar(head) : society.createdBy?.profile?.avatar ?? null;

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className={cn("rounded-xl border p-6", theme.card)}>
        <h3 className={cn("mb-3 flex items-center gap-2 font-semibold", theme.text)}>
          <span className={cn("material-symbols-outlined text-lg", theme.muted)}>description</span>
          About this Society
        </h3>
        <p className={cn("text-sm leading-relaxed", theme.muted)}>
          {society.description || "No description provided for this society."}
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: "calendar_today", label: "Founded", value: formatDate(society.createdAt) },
          { icon: "category", label: "Category", value: society.category ?? "Other" },
          { icon: "tag", label: "Tag", value: `#${society.tag ?? "—"}` },
          { icon: "people", label: "Members", value: society.memberCount ?? members.length },
          { icon: "verified", label: "Status", value: society.status ?? "active" },
          { icon: "admin_panel_settings", label: "Join Mode", value: society.requireApproval ? "Approval Required" : "Open" },
        ].map(({ icon, label, value }) => (
          <div key={label} className={cn("rounded-xl border p-4", theme.card)}>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("material-symbols-outlined text-base", theme.muted)}>{icon}</span>
              <span className={cn("text-xs font-medium uppercase tracking-wider", theme.muted)}>{label}</span>
            </div>
            <p className={cn("text-sm font-semibold capitalize", theme.text)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Society Head */}
      <div className={cn("rounded-xl border p-6", theme.card)}>
        <h3 className={cn("mb-4 flex items-center gap-2 font-semibold", theme.text)}>
          <span className={cn("material-symbols-outlined text-lg", theme.muted)}>manage_accounts</span>
          Society Head
        </h3>
        <div className="flex items-center gap-3">
          {headAvatar ? (
            <img
              src={headAvatar}
              alt={headName}
              className={cn(
                "h-12 w-12 rounded-full object-cover border",
                isDark ? "border-slate-600" : "border-slate-200"
              )}
            />
          ) : (
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border font-bold",
                isDark
                  ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              )}
            >
              {getInitials(headName)}
            </div>
          )}
          <div>
            <p className={cn("font-semibold", theme.text)}>{headName}</p>
            <RoleBadge role="society_head" isDark={isDark} />
          </div>
        </div>
      </div>

      <LeaderboardTable rows={leaderboardRows} title="Society Contributors" dense />
    </div>
  );
}

// ── Members Tab ───────────────────────────────────────────────────────────────

function MembersTab({ members, memberRequests, canManageMembers, loading, societyId, dispatch, showSuccess, showError, isDark, theme }) {
  const [busyId, setBusyId] = useState(null);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const handleApprove = async (memberId) => {
    setBusyId(memberId);
    try {
      await dispatch(approveMemberThunk({ societyId, memberId })).unwrap();
      showSuccess("Member approved!");
    } catch (err) {
      showError(err || "Failed to approve member");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (memberId) => {
    setBusyId(memberId);
    try {
      await dispatch(rejectMemberThunk({ societyId, memberId })).unwrap();
      showSuccess("Request rejected.");
      // Optional: Auto-close modal if no requests left
      if (memberRequests.length === 1) setShowPendingModal(false);
    } catch (err) {
      showError(err || "Failed to reject request");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn("h-16 rounded-xl border animate-pulse", theme.card)} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Pending Requests Popup Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className={cn("flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border shadow-lg", theme.hero)}>
            <div className={cn("flex items-center justify-between border-b p-5", theme.divider)}>
              <h3 className={cn("flex items-center gap-2 text-lg font-bold", theme.text)}>
                <span className="material-symbols-outlined text-amber-400">pending</span>
                Pending Requests
                <span className={cn("rounded-full px-2 py-0.5 text-xs", isDark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-700")}>
                  {memberRequests.length}
                </span>
              </h3>
              <IconButton
                onClick={() => setShowPendingModal(false)}
                title="Close"
                variant="ghost"
                size="icon-sm"
                className={cn(isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700")}
                icon="close"
              />
            </div>
            
            <div className="p-5 overflow-y-auto space-y-3">
              {memberRequests.length === 0 ? (
                <div className="text-center py-10">
                  <span className={cn("material-symbols-outlined mb-3 text-5xl", theme.muted)}>check_circle</span>
                  <p className={theme.muted}>No pending requests right now.</p>
                </div>
              ) : (
                memberRequests.map((m) => {
                  const memberId = m.memberId?._id ?? m.memberId;
                  const name = getMemberName(m);
                  return (
                    <div key={memberId} className={cn("flex items-center gap-3 rounded-xl border p-4", theme.card)}>
                      <MemberAvatar member={m} isDark={isDark} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("truncate text-sm font-medium", theme.text)}>{name}</p>
                        <p className={cn("text-xs", theme.muted)}>
                          Requested {formatDate(m.joinedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleReject(memberId)}
                          disabled={busyId === memberId}
                          className={getButtonClassName({
                            variant: "danger",
                            size: "icon-sm",
                            isDark,
                            className: "min-w-0",
                          })}
                          title="Reject"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                        <button
                          onClick={() => handleApprove(memberId)}
                          disabled={busyId === memberId}
                          className={getButtonClassName({
                            variant: "success",
                            size: "icon-sm",
                            isDark,
                            className: "min-w-0",
                          })}
                          title="Approve"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Members Area */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("flex items-center gap-2 text-sm font-semibold", theme.text)}>
            <span className={cn("material-symbols-outlined text-base", theme.muted)}>group</span>
            Active Members
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500")}>
              {members.length}
            </span>
          </h3>

          {canManageMembers && memberRequests.length > 0 && (
            <button
              onClick={() => setShowPendingModal(true)}
              className={getButtonClassName({ variant: "warning", size: "sm", isDark })}
            >
              <span className="material-symbols-outlined text-[14px]">notifications_active</span>
              Pending Requests ({memberRequests.length})
            </button>
          )}
        </div>
        {members.length === 0 ? (
          <div className={cn("rounded-xl border p-10 text-center", theme.card)}>
            <span className={cn("material-symbols-outlined mb-2 block text-4xl", theme.muted)}>groups</span>
            <p className={cn("text-sm", theme.muted)}>No approved members yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m) => {
              const memberId = m.memberId?._id ?? m.memberId;
              const name = getMemberName(m);
              const dept = m.memberId?.academic?.department;
              return (
                <div key={memberId} className={cn("flex items-center gap-3 rounded-xl border p-4 transition-colors", theme.card, isDark ? "hover:border-slate-600" : "hover:border-slate-300 hover:bg-slate-50")}>
                  <MemberAvatar member={m} isDark={isDark} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate text-sm font-medium", theme.text)}>{name}</p>
                    {dept && <p className={cn("truncate text-xs", theme.muted)}>{dept}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <RoleBadge role={m.role} isDark={isDark} />
                    <span className={cn("hidden text-xs sm:block", theme.muted)}>{formatDate(m.joinedAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Events Tab ────────────────────────────────────────────────────────────────

function EventCard({ event, navigate, isDark, theme }) {
  const statusCfg = EVENT_STATUS_CONFIG[event.status] ?? { label: event.status, class: "bg-slate-500/15 text-slate-400" };
  return (
    <div
      onClick={() => navigate(`/events/${event._id}`)}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-xl border transition-all",
        theme.card,
        isDark ? "hover:border-slate-500" : "hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      {/* Banner */}
      <div className={cn("relative h-36 overflow-hidden", isDark ? "bg-slate-700/50" : "bg-slate-100")}>
        {event.coverImage || event.banner ? (
          <img
            src={event.coverImage || event.banner}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={cn("material-symbols-outlined text-5xl", theme.muted)}>event</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${getEventStatusClass(event.status, isDark)}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <h4 className={cn("mb-1 line-clamp-1 text-sm font-semibold transition-colors", theme.text, isDark ? "group-hover:text-white" : "group-hover:text-slate-950")}>
          {event.title}
        </h4>
        {event.description && (
          <p className={cn("mb-3 line-clamp-2 text-xs", theme.muted)}>{event.description}</p>
        )}
        <div className={cn("flex flex-wrap gap-x-4 gap-y-1 text-xs", theme.muted)}>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
            {formatDate(event.startAt)}
          </span>
          {event.venue && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              {event.venue.type === 'online' ? 'Online Event' : event.venue.address || 'TBD'}
            </span>
          )}
          {event.format && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">devices</span>
              {event.format}
            </span>
          )}
          {event.registrationCount !== undefined && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">person</span>
              {event.registrationCount} registered
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EventsTab({ societyEvents, eventsLoading, navigate, isDark, theme }) {
  if (eventsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("h-52 rounded-xl border animate-pulse", theme.card)} />
        ))}
      </div>
    );
  }

  const sections = [
    { key: "upcoming", label: "Upcoming", icon: "upcoming", color: "text-blue-400" },
    { key: "ongoing", label: "Ongoing", icon: "play_circle", color: "text-emerald-400" },
    { key: "past", label: "Past Events", icon: "history", color: "text-slate-400" },
  ];

  const hasAny = sections.some(s => societyEvents[s.key]?.length > 0);

  if (!hasAny) {
    return (
      <div className={cn("rounded-xl border p-12 text-center", theme.card)}>
        <span className={cn("material-symbols-outlined mb-3 block text-5xl", theme.muted)}>event_busy</span>
        <p className={cn("font-medium", theme.text)}>No events yet</p>
        <p className={cn("mt-1 text-sm", theme.muted)}>This society hasn't organized any events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map(({ key, label, icon, color }) => {
        const evts = societyEvents[key] ?? [];
        if (evts.length === 0) return null;
        return (
          <div key={key}>
            <h3 className={`font-semibold text-sm mb-4 flex items-center gap-2 ${color}`}>
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
              <span className={cn("ml-1 font-normal", theme.muted)}>({evts.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {evts.map(ev => <EventCard key={ev._id} event={ev} navigate={navigate} isDark={isDark} theme={theme} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Announcements Tab ─────────────────────────────────────────────────────────

function PostCreator({ societyId, dispatch, showSuccess, showError, isDark, theme }) {
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef(null);

  const wordCount = countWords(content || "");

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 2 - imageFiles.length;
    const newFiles = files.slice(0, remaining);
    if (newFiles.length === 0) return;
    setImageFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    if (wordCount > 150) { showError("Post exceeds 150 words"); return; }
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append("content", content.trim());
      imageFiles.forEach(f => fd.append("images", f));
      await dispatch(createSocietyPostThunk({ societyId, formData: fd })).unwrap();
      showSuccess("Announcement posted!");
      setContent("");
      setImageFiles([]);
      previews.forEach(p => URL.revokeObjectURL(p));
      setPreviews([]);
    } catch (err) {
      showError(err || "Failed to post announcement");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className={cn("mb-6 rounded-xl border p-5", theme.card)}>
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("material-symbols-outlined text-lg", theme.muted)}>campaign</span>
        <span className={cn("text-sm font-semibold", theme.text)}>New Announcement</span>
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write an announcement for your society members..."
        rows={4}
        className={cn(
          "w-full resize-none rounded-lg border p-3 text-sm transition-colors focus:outline-none",
          theme.field
        )}
      />
      {/* Word count */}
      <div className={`text-xs text-right mt-1 mb-3 ${wordCount > 140 ? wordCount > 150 ? "text-red-400" : "text-amber-400" : isDark ? "text-slate-600" : "text-slate-500"}`}>
        {wordCount}/150 words
      </div>

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 mb-3">
          {previews.map((p, i) => (
            <div key={i} className="relative">
              <img src={p} alt="" className={cn("h-24 w-24 rounded-lg border object-cover", isDark ? "border-slate-600" : "border-slate-200")} />
              <button
                onClick={() => removeImage(i)}
                className={getButtonClassName({
                  variant: "danger",
                  size: "icon-sm",
                  isDark,
                  className: "absolute -top-1.5 -right-1.5 min-w-0 rounded-full",
                })}
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={imageFiles.length >= 2}
          className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2" })}
        >
          <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
          Add Image {imageFiles.length > 0 && `(${imageFiles.length}/2)`}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
        <button
          onClick={handlePost}
          disabled={posting || !content.trim() || wordCount > 150}
          className={getButtonClassName({ variant: "primary", size: "sm", isDark })}
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}

function PostCard({ post, canDelete, societyId, dispatch, userId, showSuccess, showError, onDelete, isDark, theme }) {
  const [deleting, setDeleting] = useState(false);
  const author = post.authorId ?? {};
  const p = author?.profile ?? {};
  const name = p.displayName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Member";
  const avatar = p.avatar;

  const handleDelete = () => {
    onDelete(post);
  };

  return (
    <div className={cn("rounded-xl border p-5", theme.card)}>
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        {avatar ? (
          <img src={avatar} alt={name} className={cn("h-9 w-9 rounded-full border object-cover", isDark ? "border-slate-700" : "border-slate-200")} />
        ) : (
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold", isDark ? "bg-slate-700 text-slate-400 border-slate-600" : "bg-slate-100 text-slate-600 border-slate-200")}>
            {getInitials(name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold", theme.text)}>{name}</p>
          <p className={cn("text-xs", theme.muted)}>{formatDate(post.createdAt)}</p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={getButtonClassName({ variant: "danger", size: "icon-sm", isDark, className: "min-w-0" })}
            title="Delete post"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        )}
      </div>

      {/* Content */}
      <p className={cn("mb-3 whitespace-pre-wrap text-sm leading-relaxed", isDark ? "text-slate-300" : "text-slate-700")}>{post.content}</p>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`grid gap-2 ${post.images.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className={cn("h-52 w-full rounded-lg border object-cover", isDark ? "border-slate-700" : "border-slate-200")}
              onDelete={onDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementsTab({ societyId, userRole, isHead, isMember, announcements, announcementsLoading, dispatch, user, showSuccess, showError, onDeletePost, isDark, theme }) {
  const canPost = isHead || userRole === "co-coordinator";

  return (
    <div>
      {/* Post creator — gated by role */}
      {canPost && isMember && (
        <PostCreator societyId={societyId} dispatch={dispatch} showSuccess={showSuccess} showError={showError} isDark={isDark} theme={theme} />
      )}

      {/* Non-member gate */}
      {!isMember && (
        <div className={cn("mb-6 rounded-xl border p-8 text-center", theme.card)}>
          <span className={cn("material-symbols-outlined mb-3 block text-4xl", theme.muted)}>lock</span>
          <p className={cn("text-sm", theme.muted)}>Join this society to see announcements.</p>
        </div>
      )}

      {/* Feed */}
      {isMember && (
        <div className="space-y-4">
          {announcementsLoading && announcements.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={cn("h-32 rounded-xl border animate-pulse", theme.card)} />
            ))
          ) : announcements.length === 0 ? (
            <div className={cn("rounded-xl border p-12 text-center", theme.card)}>
              <span className={cn("material-symbols-outlined mb-3 block text-4xl", theme.muted)}>campaign</span>
              <p className={cn("text-sm", theme.muted)}>No announcements yet.</p>
            </div>
          ) : (
            announcements.map(post => (
              <PostCard
                key={post._id}
                post={post}
                societyId={societyId}
                canDelete={isHead || post.authorId?._id === user?._id}
                dispatch={dispatch}
                userId={user?._id}
                showSuccess={showSuccess}
                showError={showError}
                onDelete={onDeletePost}
                isDark={isDark}
                theme={theme}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SocietyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();

  const society       = useSelector(selectCurrentSociety);
  const members       = useSelector(selectSocietyMembers);
  const memberReqs    = useSelector(selectMemberRequests);
  const loading       = useSelector(selectSocietyLoading);
  const membersLoading = useSelector(selectMembersLoading);
  const error         = useSelector(selectSocietyError);
  const announcements = useSelector(selectSocietyAnnouncements);
  const announcementsLoading = useSelector(selectAnnouncementsLoading);
  const societyEvents = useSelector(selectSocietyEvents);
  const eventsLoading = useSelector(selectEventsLoading);
  const user          = useSelector(selectUser);
  const gamificationLeaderboards = useSelector(selectGamificationLeaderboards);
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);

  const [activeTab, setActiveTab] = useState("overview");
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });

  // ── Load data ────────────────────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchSocietyById(id));
    dispatch(fetchSocietyMembers({ id, params: { status: "all" } }));
    dispatch(fetchSocietyEvents(id));
    dispatch(fetchModuleLeaderboard("society"));
    return () => { dispatch(clearCurrentSociety()); };
  }, [dispatch, id]);

  // Fetch posts only when Announcements tab is opened, and user is logged in
  useEffect(() => {
    if (activeTab === "announcements" && user) {
      dispatch(fetchSocietyPosts({ societyId: id, params: {} }));
    }
  }, [activeTab, id, user, dispatch]);

  // ── Derived state ─────────────────────────────────────────────────────────────

  const userId = user?._id;

  // Check membership
  const memberRecord = members.find(m => {
    const mid = m.memberId?._id?.toString() ?? m.memberId?.toString();
    return mid === userId?.toString();
  });
  const isMember = !!memberRecord;

  // Check pending request
  const pendingRecord = memberReqs.find(m => {
    const mid = m.memberId?._id?.toString() ?? m.memberId?.toString();
    return mid === userId?.toString();
  });
  const isPending = !!pendingRecord;

  // Determine user's role in the society
  const isCreator = society?.createdBy?._id?.toString() === userId?.toString() ||
                    society?.createdBy?.toString() === userId?.toString();
  const userRole = isCreator ? "society_head" : (memberRecord?.role ?? null);
  const isHead = isCreator || userRole === "society_head";
  const canManageMembers = isHead || ["co-coordinator", "executive"].includes(userRole);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleJoinLeave = async () => {
    if (!user) { navigate("/login"); return; }
    
    if (isMember) {
      setConfirmConfig({
        isOpen: true,
        title: "Leave Society",
        message: `Are you sure you want to leave "${society.name}"? You will lose access to member-only discussions and events.`,
        onConfirm: async () => {
          setActionBusy(true);
          try {
            await dispatch(leaveSocietyThunk(id)).unwrap();
            showSuccess("You have left the society.");
            dispatch(fetchSocietyMembers({ id, params: { status: "all" } }));
          } catch (err) {
            showError(err?.message || "Failed to leave society.");
          } finally {
            setActionBusy(false);
            setConfirmConfig({ isOpen: false });
          }
        },
        variant: "danger"
      });
      return;
    }

    setActionBusy(true);
    try {
      const res = await dispatch(joinSocietyThunk(id)).unwrap();
      showSuccess(res.status === "pending" ? "Join request sent! Awaiting approval." : "You have joined the society!");
      dispatch(fetchSocietyMembers({ id, params: { status: "all" } }));
    } catch (err) {
      showError(typeof err === "string" ? err : err?.message || "Action failed. Please try again.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeletePost = (post) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Announcement",
      message: "Are you sure you want to delete this announcement? This action is permanent and cannot be undone.",
      onConfirm: async () => {
        setActionBusy(true);
        try {
          await dispatch(deleteSocietyPostThunk({ societyId: id, postId: post._id })).unwrap();
          showSuccess("Announcement deleted successfully.");
        } catch (err) {
          showError(err || "Failed to delete announcement.");
        } finally {
          setActionBusy(false);
          setConfirmConfig({ isOpen: false });
        }
      },
      variant: "danger"
    });
  };

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading && !society) {
    return (
      <div className={cn("min-h-screen flex items-start justify-center pt-20", theme.page)}>
        <div className="w-full max-w-6xl px-4 animate-pulse space-y-4">
          <div className={cn("h-8 w-1/3 rounded", isDark ? "bg-slate-800" : "bg-slate-200")} />
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className={cn("h-64 rounded-xl", isDark ? "bg-slate-800" : "bg-slate-200")} />
            <div className={cn("col-span-2 h-64 rounded-xl", isDark ? "bg-slate-800" : "bg-slate-200")} />
          </div>
        </div>
      </div>
    );
  }

  if (error || (!loading && !society)) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", theme.page)}>
        <div className="text-center p-8">
          <span className={cn("material-symbols-outlined mb-4 block text-6xl", theme.muted)}>error</span>
          <p className={cn("mb-2 text-lg font-semibold", theme.text)}>{error || "Society not found"}</p>
          <button onClick={() => navigate("/societies")} className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "mt-2 min-w-0 px-2" })}>
            ← Back to Societies
          </button>
        </div>
      </div>
    );
  }

  const statusClasses = {
    approved: isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pending:  isDark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-700 border border-amber-200",
    rejected: isDark ? "bg-danger/15 text-danger" : "bg-danger/5 text-danger border border-danger/20",
    archived: isDark ? "bg-slate-500/15 text-slate-400" : "bg-slate-100 text-slate-600 border border-slate-200",
  };

  return (
    <div className={cn("min-h-screen", theme.page)}>
      {/* Top bar */}
      <div className={cn("sticky top-0 z-20 border-b backdrop-blur", theme.header, theme.divider)}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <IconButton
            onClick={() => navigate("/societies")}
            title="Back to societies"
            variant="ghost"
            size="icon-sm"
            className={cn(isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-800")}
            icon="arrow_back"
          />
          <span className={cn("text-sm", theme.muted)}>/</span>
          <span className={cn("truncate text-sm font-medium", theme.text)}>{society?.name}</span>

          {isHead && (
            <Link
              to={`/society/${id}/manage`}
              className={getButtonClassName({ variant: "secondary", size: "sm", isDark, className: "ml-auto" })}
            >
              <span className="material-symbols-outlined text-sm">settings</span>
              Manage
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

          {/* ── LEFT PANEL ── */}
          <aside className="lg:sticky lg:top-20 space-y-4">
            {/* Identity Card */}
            <div className={cn("overflow-hidden rounded-2xl border", theme.hero)}>
              {/* Cover / Logo */}
              <div className={cn("relative h-24", isDark ? "bg-slate-700/50" : "bg-slate-100")}>
                {society.media?.coverImage ? (
                  <img src={society.media.coverImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={cn("h-full w-full", isDark ? "bg-surface-dark" : "bg-surface-muted")} />
                )}
                <div className="absolute -bottom-7 left-5">
                  {society.media?.logo ? (
                    <img src={society.media.logo} alt={society.name} className={cn("h-14 w-14 rounded-xl border-2 object-cover shadow-lg", isDark ? "border-slate-800" : "border-white")} />
                  ) : (
                    <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl border-2", isDark ? "bg-slate-700 border-slate-800" : "bg-slate-100 border-white")}>
                      <span className={cn("material-symbols-outlined text-2xl", theme.muted)}>groups</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-10 px-5 pb-5">
                <h1 className={cn("text-lg font-bold leading-snug", theme.text)}>{society.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={cn("text-xs", theme.muted)}>#{society.tag}</span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusClasses[society.status] ?? "bg-slate-500/15 text-slate-400"}`}>
                    {society.status}
                  </span>
                </div>

                <div className={cn("mt-3 flex items-center gap-2 text-xs", theme.muted)}>
                  <span className="material-symbols-outlined text-[13px]">people</span>
                  <span>{society.memberCount ?? members.length} members</span>
                  <span className="mx-1">·</span>
                  <span className="capitalize">{society.category}</span>
                </div>

                {/* Join / Leave CTA */}
                <div className="mt-5">
                  {isHead ? (
                    <div className={cn("rounded-lg border py-2 text-center text-xs", theme.subtle, theme.muted)}>
                      You are the Society Head
                    </div>
                  ) : isPending ? (
                    <div className={cn("rounded-lg border py-2 text-center text-xs", isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700")}>
                      <span className="material-symbols-outlined text-[14px] align-middle mr-1">hourglass_empty</span>
                      Request Pending...
                    </div>
                  ) : isMember ? (
                    <button
                      onClick={handleJoinLeave}
                      disabled={actionBusy}
                      className={getButtonClassName({ variant: "danger", size: "md", isDark, className: "w-full" })}
                    >
                      {actionBusy ? "Processing..." : "Leave Society"}
                    </button>
                  ) : society.status === "approved" ? (
                    <button
                      onClick={handleJoinLeave}
                      disabled={actionBusy || !user}
                      className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "w-full" })}
                    >
                      {actionBusy ? "Sending..." : user ? "Join Society" : "Sign in to Join"}
                    </button>
                  ) : (
                    <div className={cn("py-2 text-center text-xs", theme.muted)}>Not accepting members</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={cn("grid grid-cols-2 gap-3 rounded-xl border p-4", theme.card)}>
              {[
                { label: "Members", value: society.memberCount ?? members.length, icon: "group" },
                { label: "Events", value: (societyEvents.upcoming?.length || 0) + (societyEvents.ongoing?.length || 0) + (societyEvents.past?.length || 0), icon: "event" },
                { label: "Founded", value: society.createdAt ? new Date(society.createdAt).getFullYear() : "—", icon: "calendar_today" },
                { label: "Posts", value: announcements.length, icon: "campaign" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="text-center">
                  <span className={cn("material-symbols-outlined block text-base", theme.muted)}>{icon}</span>
                  <p className={cn("text-lg font-bold leading-none", theme.text)}>{value}</p>
                  <p className={cn("mt-0.5 text-[10px] uppercase tracking-wider", theme.muted)}>{label}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* ── RIGHT: Tabs ── */}
          <div className="min-w-0">
            {/* Status banner for non-active */}
            {society.status !== "approved" && (
              <div className={`mb-5 flex items-center gap-3 rounded-xl border p-4 text-sm ${society.status === "pending" ? (isDark ? "bg-warning/10 border-warning/25 text-warning" : "bg-amber-50 border-amber-200 text-amber-700") : (isDark ? "bg-danger/10 border-danger/25 text-danger" : "bg-danger/5 border-danger/20 text-danger")}`}>
                <span className="material-symbols-outlined">{society.status === "pending" ? "pending" : "block"}</span>
                <div>
                  <p className="font-semibold capitalize">{society.status}</p>
                  {society.rejectionReason && <p className="text-xs opacity-75 mt-0.5">{society.rejectionReason}</p>}
                </div>
              </div>
            )}

            {/* Tab Bar */}
            <div className={cn("mb-6 -mx-1 flex gap-1 overflow-x-auto border-b px-1", theme.divider)}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={getButtonClassName({
                    variant: activeTab === tab.id ? "primary" : "ghost",
                    size: "sm",
                    isDark,
                    className: "min-w-0",
                  })}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <OverviewTab society={society} members={members} isDark={isDark} theme={theme} leaderboardRows={gamificationLeaderboards.module?.society || []} />
            )}

            {activeTab === "members" && (
              <MembersTab
                members={members}
                memberRequests={memberReqs}
                canManageMembers={canManageMembers}
                loading={membersLoading}
                societyId={id}
                dispatch={dispatch}
                showSuccess={showSuccess}
                showError={showError}
                isDark={isDark}
                theme={theme}
              />
            )}

            {activeTab === "events" && (
              <EventsTab
                societyEvents={societyEvents}
                eventsLoading={eventsLoading}
                navigate={navigate}
                isDark={isDark}
                theme={theme}
              />
            )}

            {activeTab === "announcements" && (
              <AnnouncementsTab
                societyId={id}
                userRole={userRole}
                isHead={isHead}
                isMember={isMember || isPending}
                announcements={announcements}
                announcementsLoading={announcementsLoading}
                dispatch={dispatch}
                user={user}
                showSuccess={showSuccess}
                showError={showError}
                onDeletePost={handleDeletePost}
                isDark={isDark}
                theme={theme}
              />
            )}
        </div>
      </div>
    </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        loading={actionBusy}
      />
    </div>
  );
}
