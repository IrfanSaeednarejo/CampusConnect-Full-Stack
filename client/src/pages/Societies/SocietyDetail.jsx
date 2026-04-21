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
import { selectUser } from "../../redux/slices/authSlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: "info" },
  { id: "members", label: "Members", icon: "people" },
  { id: "events", label: "Events", icon: "event" },
  { id: "announcements", label: "Announcements", icon: "campaign" },
];

const ROLE_CONFIG = {
  "society_head": { label: "Society Head", class: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" },
  "co-coordinator": { label: "Co-Coordinator", class: "bg-blue-500/15 text-blue-400 border border-blue-500/25" },
  "active-member": { label: "Active Member", class: "bg-purple-500/15 text-purple-400 border border-purple-500/25" },
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function MemberAvatar({ member, size = "md" }) {
  const name = getMemberName(member);
  const avatar = getMemberAvatar(member);
  const sz = size === "lg" ? "w-14 h-14 text-base" : "w-9 h-9 text-xs";
  return avatar ? (
    <img src={avatar} alt={name} className={`${sz} rounded-full object-cover border border-slate-700 flex-shrink-0`} />
  ) : (
    <div className={`${sz} rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 border border-slate-600 flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG["student"];
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.class}`}>
      {cfg.label}
    </span>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ society, members }) {
  const head = members.find(m => m.role === "society_head" || m.role === "executive");
  const headName = head ? getMemberName(head) : society.createdBy?.profile?.displayName ?? "Unknown";
  const headAvatar = head ? getMemberAvatar(head) : society.createdBy?.profile?.avatar ?? null;

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
          About this Society
        </h3>
        <p className="text-slate-400 leading-relaxed text-sm">
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
          <div key={label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-slate-500 text-base">{icon}</span>
              <span className="text-slate-500 text-xs uppercase tracking-wider font-medium">{label}</span>
            </div>
            <p className="text-slate-200 font-semibold text-sm capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* Society Head */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-lg">manage_accounts</span>
          Society Head
        </h3>
        <div className="flex items-center gap-3">
          {headAvatar ? (
            <img src={headAvatar} alt={headName} className="w-12 h-12 rounded-full object-cover border border-slate-600" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              {getInitials(headName)}
            </div>
          )}
          <div>
            <p className="text-slate-200 font-semibold">{headName}</p>
            <RoleBadge role="society_head" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Members Tab ───────────────────────────────────────────────────────────────

function MembersTab({ members, memberRequests, canManageMembers, loading, societyId, dispatch, showSuccess, showError }) {
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
          <div key={i} className="h-16 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Pending Requests Popup Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-slate-200 font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">pending</span>
                Pending Requests
                <span className="bg-amber-500/15 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                  {memberRequests.length}
                </span>
              </h3>
              <button 
                onClick={() => setShowPendingModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-3">
              {memberRequests.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-slate-600 text-5xl mb-3">check_circle</span>
                  <p className="text-slate-400">No pending requests right now.</p>
                </div>
              ) : (
                memberRequests.map((m) => {
                  const memberId = m.memberId?._id ?? m.memberId;
                  const name = getMemberName(m);
                  return (
                    <div key={memberId} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                      <MemberAvatar member={m} />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm font-medium truncate">{name}</p>
                        <p className="text-slate-500 text-xs">
                          Requested {formatDate(m.joinedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleReject(memberId)}
                          disabled={busyId === memberId}
                          className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-50"
                          title="Reject"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                        <button
                          onClick={() => handleApprove(memberId)}
                          disabled={busyId === memberId}
                          className="w-8 h-8 rounded-full bg-emerald-600/20 hover:bg-emerald-500/90 border border-emerald-500/30 hover:border-transparent text-emerald-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"
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
          <h3 className="text-slate-300 font-semibold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-base">group</span>
            Active Members
            <span className="bg-slate-700 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {members.length}
            </span>
          </h3>

          {canManageMembers && memberRequests.length > 0 && (
            <button
              onClick={() => setShowPendingModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-xs font-semibold rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">notifications_active</span>
              Pending Requests ({memberRequests.length})
            </button>
          )}
        </div>
        {members.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-10 text-center">
            <span className="material-symbols-outlined text-slate-600 text-4xl mb-2 block">groups</span>
            <p className="text-slate-500 text-sm">No approved members yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m) => {
              const memberId = m.memberId?._id ?? m.memberId;
              const name = getMemberName(m);
              const dept = m.memberId?.academic?.department;
              return (
                <div key={memberId} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3 hover:border-slate-600 transition-colors">
                  <MemberAvatar member={m} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{name}</p>
                    {dept && <p className="text-slate-500 text-xs truncate">{dept}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <RoleBadge role={m.role} />
                    <span className="text-slate-600 text-xs hidden sm:block">{formatDate(m.joinedAt)}</span>
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

function EventCard({ event, navigate }) {
  const statusCfg = EVENT_STATUS_CONFIG[event.status] ?? { label: event.status, class: "bg-slate-500/15 text-slate-400" };
  return (
    <div
      onClick={() => navigate(`/events/${event._id}`)}
      className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-slate-500 transition-all group"
    >
      {/* Banner */}
      <div className="h-36 bg-slate-700/50 relative overflow-hidden">
        {event.coverImage || event.banner ? (
          <img
            src={event.coverImage || event.banner}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600 text-5xl">event</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${statusCfg.class}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <h4 className="text-slate-200 font-semibold text-sm mb-1 line-clamp-1 group-hover:text-white transition-colors">
          {event.title}
        </h4>
        {event.description && (
          <p className="text-slate-500 text-xs line-clamp-2 mb-3">{event.description}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
            {formatDate(event.startDate)}
          </span>
          {event.venue && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              {event.venue}
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

function EventsTab({ societyEvents, eventsLoading, navigate }) {
  if (eventsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-52 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
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
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
        <span className="material-symbols-outlined text-slate-600 text-5xl mb-3 block">event_busy</span>
        <p className="text-slate-400 font-medium">No events yet</p>
        <p className="text-slate-600 text-sm mt-1">This society hasn't organized any events.</p>
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
              <span className="ml-1 text-slate-500 font-normal">({evts.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {evts.map(ev => <EventCard key={ev._id} event={ev} navigate={navigate} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Announcements Tab ─────────────────────────────────────────────────────────

function PostCreator({ societyId, dispatch, showSuccess, showError }) {
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
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-slate-400 text-lg">campaign</span>
        <span className="text-slate-300 font-semibold text-sm">New Announcement</span>
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write an announcement for your society members..."
        rows={4}
        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-600 text-sm p-3 resize-none focus:outline-none focus:border-slate-400 transition-colors"
      />
      {/* Word count */}
      <div className={`text-xs text-right mt-1 mb-3 ${wordCount > 140 ? wordCount > 150 ? "text-red-400" : "text-amber-400" : "text-slate-600"}`}>
        {wordCount}/150 words
      </div>

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 mb-3">
          {previews.map((p, i) => (
            <div key={i} className="relative">
              <img src={p} alt="" className="w-24 h-24 object-cover rounded-lg border border-slate-600" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
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
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
          Add Image {imageFiles.length > 0 && `(${imageFiles.length}/2)`}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
        <button
          onClick={handlePost}
          disabled={posting || !content.trim() || wordCount > 150}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}

function PostCard({ post, canDelete, societyId, dispatch, userId, showSuccess, showError }) {
  const [deleting, setDeleting] = useState(false);
  const author = post.authorId ?? {};
  const p = author?.profile ?? {};
  const name = p.displayName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Member";
  const avatar = p.avatar;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteSocietyPostThunk({ societyId, postId: post._id })).unwrap();
      showSuccess("Post deleted.");
    } catch (err) {
      showError(err || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        {avatar ? (
          <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-600">
            {getInitials(name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-slate-200 text-sm font-semibold">{name}</p>
          <p className="text-slate-600 text-xs">{formatDate(post.createdAt)}</p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40"
            title="Delete post"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`grid gap-2 ${post.images.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className="w-full h-52 object-cover rounded-lg border border-slate-700"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementsTab({ societyId, userRole, isHead, isMember, announcements, announcementsLoading, dispatch, user, showSuccess, showError }) {
  const canPost = isHead || userRole === "co-coordinator";

  return (
    <div>
      {/* Post creator — gated by role */}
      {canPost && isMember && (
        <PostCreator societyId={societyId} dispatch={dispatch} showSuccess={showSuccess} showError={showError} />
      )}

      {/* Non-member gate */}
      {!isMember && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center mb-6">
          <span className="material-symbols-outlined text-slate-600 text-4xl block mb-3">lock</span>
          <p className="text-slate-400 text-sm">Join this society to see announcements.</p>
        </div>
      )}

      {/* Feed */}
      {isMember && (
        <div className="space-y-4">
          {announcementsLoading && announcements.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
            ))
          ) : announcements.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-slate-600 text-4xl block mb-3">campaign</span>
              <p className="text-slate-400 text-sm">No announcements yet.</p>
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

  const [activeTab, setActiveTab] = useState("overview");
  const [actionBusy, setActionBusy] = useState(false);

  // ── Load data ────────────────────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchSocietyById(id));
    dispatch(fetchSocietyMembers({ id, params: { status: "all" } }));
    dispatch(fetchSocietyEvents(id));
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
    setActionBusy(true);
    try {
      if (isMember) {
        await dispatch(leaveSocietyThunk(id)).unwrap();
        showSuccess("You have left the society.");
        dispatch(fetchSocietyMembers({ id, params: { status: "all" } }));
      } else {
        const res = await dispatch(joinSocietyThunk(id)).unwrap();
        showSuccess(res.status === "pending" ? "Join request sent! Awaiting approval." : "You have joined the society!");
        dispatch(fetchSocietyMembers({ id, params: { status: "all" } }));
      }
    } catch (err) {
      showError(typeof err === "string" ? err : err?.message || "Action failed. Please try again.");
    } finally {
      setActionBusy(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading && !society) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-start justify-center pt-20">
        <div className="w-full max-w-6xl px-4 animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="h-64 bg-slate-800 rounded-xl" />
            <div className="col-span-2 h-64 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || (!loading && !society)) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center p-8">
          <span className="material-symbols-outlined text-slate-600 text-6xl block mb-4">error</span>
          <p className="text-slate-300 font-semibold text-lg mb-2">{error || "Society not found"}</p>
          <button onClick={() => navigate("/societies")} className="text-slate-500 text-sm hover:text-slate-300 transition-colors mt-2">
            ← Back to Societies
          </button>
        </div>
      </div>
    );
  }

  const statusClasses = {
    approved: "bg-emerald-500/15 text-emerald-400",
    pending:  "bg-amber-500/15 text-amber-400",
    rejected: "bg-red-500/15 text-red-400",
    archived: "bg-slate-500/15 text-slate-400",
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Top bar */}
      <div className="border-b border-slate-800 bg-[#0d1117]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/societies")} className="text-slate-500 hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <span className="text-slate-400 text-sm">/</span>
          <span className="text-slate-300 text-sm font-medium truncate">{society?.name}</span>

          {isHead && (
            <Link
              to={`/society/manage`}
              className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
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
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
              {/* Cover / Logo */}
              <div className="h-24 bg-slate-700/50 relative">
                {society.media?.coverImage ? (
                  <img src={society.media.coverImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }} />
                )}
                <div className="absolute -bottom-7 left-5">
                  {society.media?.logo ? (
                    <img src={society.media.logo} alt={society.name} className="w-14 h-14 rounded-xl object-cover border-2 border-slate-800 shadow-lg" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-700 border-2 border-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-2xl">groups</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-10 px-5 pb-5">
                <h1 className="text-slate-100 font-bold text-lg leading-snug">{society.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-slug text-xs text-slate-500">#{society.tag}</span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusClasses[society.status] ?? "bg-slate-500/15 text-slate-400"}`}>
                    {society.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-slate-500 text-xs">
                  <span className="material-symbols-outlined text-[13px]">people</span>
                  <span>{society.memberCount ?? members.length} members</span>
                  <span className="mx-1">·</span>
                  <span className="capitalize">{society.category}</span>
                </div>

                {/* Join / Leave CTA */}
                <div className="mt-5">
                  {isHead ? (
                    <div className="text-xs text-slate-500 text-center py-2 border border-slate-700 rounded-lg">
                      You are the Society Head
                    </div>
                  ) : isPending ? (
                    <div className="text-xs text-amber-400 text-center py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <span className="material-symbols-outlined text-[14px] align-middle mr-1">hourglass_empty</span>
                      Request Pending…
                    </div>
                  ) : isMember ? (
                    <button
                      onClick={handleJoinLeave}
                      disabled={actionBusy}
                      className="w-full py-2 text-sm border border-slate-600 text-slate-400 rounded-lg hover:border-red-500/40 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {actionBusy ? "Processing…" : "Leave Society"}
                    </button>
                  ) : society.status === "approved" ? (
                    <button
                      onClick={handleJoinLeave}
                      disabled={actionBusy || !user}
                      className="w-full py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg border border-slate-600 font-semibold transition-colors disabled:opacity-50"
                    >
                      {actionBusy ? "Sending…" : user ? "Join Society" : "Sign in to Join"}
                    </button>
                  ) : (
                    <div className="text-xs text-slate-500 text-center py-2">Not accepting members</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Members", value: society.memberCount ?? members.length, icon: "group" },
                { label: "Events", value: (societyEvents.upcoming?.length || 0) + (societyEvents.ongoing?.length || 0) + (societyEvents.past?.length || 0), icon: "event" },
                { label: "Founded", value: society.createdAt ? new Date(society.createdAt).getFullYear() : "—", icon: "calendar_today" },
                { label: "Posts", value: announcements.length, icon: "campaign" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="text-center">
                  <span className="material-symbols-outlined text-slate-600 text-base block">{icon}</span>
                  <p className="text-slate-200 font-bold text-lg leading-none">{value}</p>
                  <p className="text-slate-600 text-[10px] uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* ── RIGHT: Tabs ── */}
          <div className="min-w-0">
            {/* Status banner for non-active */}
            {society.status !== "approved" && (
              <div className={`mb-5 p-4 rounded-xl border flex gap-3 items-center text-sm ${society.status === "pending" ? "bg-amber-500/10 border-amber-500/25 text-amber-400" : "bg-red-500/10 border-red-500/25 text-red-400"}`}>
                <span className="material-symbols-outlined">{society.status === "pending" ? "pending" : "block"}</span>
                <div>
                  <p className="font-semibold capitalize">{society.status}</p>
                  {society.rejectionReason && <p className="text-xs opacity-75 mt-0.5">{society.rejectionReason}</p>}
                </div>
              </div>
            )}

            {/* Tab Bar */}
            <div className="flex gap-1 border-b border-slate-800 mb-6 -mx-1 px-1 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    activeTab === tab.id
                      ? "text-slate-100 border-slate-300"
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <OverviewTab society={society} members={members} />
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
              />
            )}

            {activeTab === "events" && (
              <EventsTab
                societyEvents={societyEvents}
                eventsLoading={eventsLoading}
                navigate={navigate}
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
