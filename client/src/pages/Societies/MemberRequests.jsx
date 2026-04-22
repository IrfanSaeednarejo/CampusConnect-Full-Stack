import { useState, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  approveMemberThunk,
  rejectMemberThunk,
  removeMemberThunk,
  updateMemberRoleThunk,
  selectSocietyMembers,
  selectMemberRequests,
  selectMembersLoading,
} from "../../redux/slices/societySlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import ConfirmModal from "../../components/common/ConfirmModal";

const APPROVED_ROLES = ["student", "active-member", "co-coordinator", "executive", "society_head"];

const ROLE_CONFIG = {
  "society_head":  { label: "Society Head",  cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" },
  "co-coordinator":{ label: "Co-Coordinator",cls: "bg-blue-500/15 text-blue-400 border border-blue-500/25" },
  "executive":     { label: "Executive",     cls: "bg-purple-500/15 text-purple-400 border border-purple-500/25" },
  "active-member": { label: "Active Member", cls: "bg-slate-500/15 text-slate-400 border border-slate-500/25" },
  "student":       { label: "Student",       cls: "bg-slate-600/15 text-slate-500 border border-slate-600/25" },
};

function getMemberName(m) {
  const p = m.memberId?.profile ?? {};
  return p.displayName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Unknown Member";
}
function getMemberAvatar(m) { return m.memberId?.profile?.avatar ?? null; }
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function MemberRow({ m, societyId, dispatch, showSuccess, showError, roleDisabled, onRemove }) {
  const [busyRole,   setBusyRole]   = useState(false);
  const [busyRemove, setBusyRemove] = useState(false);
  const name   = getMemberName(m);
  const avatar = getMemberAvatar(m);
  const memberId = m.memberId?._id ?? m.memberId;

  const handleRole = async (e) => {
    setBusyRole(true);
    try {
      await dispatch(updateMemberRoleThunk({ societyId, memberId, role: e.target.value })).unwrap();
      showSuccess("Role updated.");
    } catch (err) { showError(err || "Failed to update role"); }
    finally { setBusyRole(false); }
  };

  const handleRemove = () => {
    onRemove(m);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
      {avatar ? (
        <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium truncate">{name}</p>
        <p className="text-slate-500 text-xs truncate">{m.memberId?.academic?.department ?? ""}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-slate-600 text-xs hidden md:block">{formatDate(m.joinedAt)}</span>
        {roleDisabled ? (
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${(ROLE_CONFIG[m.role] ?? ROLE_CONFIG["student"]).cls}`}>
            {(ROLE_CONFIG[m.role] ?? ROLE_CONFIG["student"]).label}
          </span>
        ) : (
          <select
            value={m.role}
            onChange={handleRole}
            disabled={busyRole}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-slate-500 disabled:opacity-50"
          >
            {APPROVED_ROLES.filter(r => r !== "society_head").map(r => (
              <option key={r} value={r}>{ROLE_CONFIG[r]?.label ?? r}</option>
            ))}
          </select>
        )}
        {!roleDisabled && (
          <button
            onClick={handleRemove}
            disabled={busyRemove}
            className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40 ml-1"
            title="Remove member"
          >
            <span className="material-symbols-outlined text-[17px]">person_remove</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function MemberRequests() {
  const dispatch   = useDispatch();
  const { showSuccess, showError } = useNotification();
  const { headSociety, societyId } = useOutletContext() ?? {};

  const approved       = useSelector(selectSocietyMembers);  // already filtered to approved/active
  const pending        = useSelector(selectMemberRequests);   // already filtered to pending
  const loading        = useSelector(selectMembersLoading);

  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [busyId,   setBusyId]    = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });

  const filtered = search.trim()
    ? approved.filter(m => getMemberName(m).toLowerCase().includes(search.trim().toLowerCase()))
    : approved;

  const handleRemoveMember = (m) => {
    const name = getMemberName(m);
    const memberId = m.memberId?._id ?? m.memberId;
    setConfirmConfig({
      isOpen: true,
      title: "Remove Member",
      message: `Are you sure you want to remove "${name}" from this society? This action will revoke their access to all society-exclusive resources.`,
      onConfirm: async () => {
        setIsRemoving(true);
        try {
          await dispatch(removeMemberThunk({ societyId, memberId })).unwrap();
          showSuccess("Member removed successfully.");
        } catch (err) {
          showError(err || "Failed to remove member");
        } finally {
          setIsRemoving(false);
          setConfirmConfig({ isOpen: false });
        }
      },
      variant: "danger"
    });
  };

  const handleApprove = async (memberId) => {
    setBusyId(memberId);
    try {
      await dispatch(approveMemberThunk({ societyId, memberId })).unwrap();
      showSuccess("Member approved!");
      if (pending.length === 1) setShowModal(false);
    } catch (err) { showError(err || "Failed to approve"); }
    finally { setBusyId(null); }
  };

  const handleReject = async (memberId) => {
    setBusyId(memberId);
    try {
      await dispatch(rejectMemberThunk({ societyId, memberId })).unwrap();
      showSuccess("Request rejected.");
      if (pending.length === 1) setShowModal(false);
    } catch (err) { showError(err || "Failed to reject"); }
    finally { setBusyId(null); }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-100 text-2xl font-bold">Members</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage members and join requests</p>
        </div>
        {pending.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-semibold rounded-xl border border-amber-500/25 transition-colors"
          >
            <span className="material-symbols-outlined text-base">notifications_active</span>
            Pending Requests
            <span className="bg-amber-400/20 text-amber-400 text-xs font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
          </button>
        )}
      </div>

      {/* Role breakdown badges */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(
          approved.reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc; }, {})
        ).map(([role, count]) => (
          <span key={role} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${(ROLE_CONFIG[role] ?? ROLE_CONFIG["student"]).cls}`}>
            {(ROLE_CONFIG[role] ?? ROLE_CONFIG["student"]).label}: {count}
          </span>
        ))}
        {approved.length === 0 && !loading && (
          <span className="text-slate-600 text-xs">No approved members yet</span>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-base pointer-events-none">search</span>
        <input
          type="text"
          placeholder="Search members…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-slate-500 transition-colors"
        />
      </div>

      {/* Members List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-5xl block mb-3">group_off</span>
          <p className="text-slate-400 font-medium">
            {search ? "No members match your search" : "No approved members yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => (
            <MemberRow
              key={m.memberId?._id ?? m.memberId}
              m={m}
              societyId={societyId}
              dispatch={dispatch}
              showSuccess={showSuccess}
              showError={showError}
              roleDisabled={m.role === "society_head"}
              onRemove={handleRemoveMember}
            />
          ))}
        </div>
      )}

      {/* Pending Requests Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-slate-200 font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">pending</span>
                Pending Requests
                <span className="bg-amber-500/15 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-500/25">{pending.length}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              {pending.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-slate-600 text-5xl block mb-3">check_circle</span>
                  <p className="text-slate-400">All caught up! No pending requests.</p>
                </div>
              ) : pending.map(m => {
                const memberId = m.memberId?._id ?? m.memberId;
                const name     = getMemberName(m);
                const avatar   = getMemberAvatar(m);
                const busy     = busyId === memberId;
                return (
                  <div key={memberId} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-400 text-sm font-bold shrink-0">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-semibold truncate">{name}</p>
                      <p className="text-slate-500 text-xs">Requested {formatDate(m.joinedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReject(memberId)}
                        disabled={busy}
                        className="w-9 h-9 rounded-full bg-slate-700/50 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-50"
                        title="Reject"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                      <button
                        onClick={() => handleApprove(memberId)}
                        disabled={busy}
                        className="w-9 h-9 rounded-full bg-emerald-600/20 hover:bg-emerald-500 border border-emerald-500/30 hover:border-transparent text-emerald-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"
                        title="Approve"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        loading={isRemoving}
      />
    </div>
  );
}
