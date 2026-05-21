import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeTheme from "../../hooks/useHomeTheme";
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
import { getButtonClassName } from "../../components/common/Button";
import { cn, getSocietyTheme } from "./societyTheme";

const APPROVED_ROLES = ["student", "active-member", "co-coordinator", "executive", "society_head"];

const ROLE_CONFIG = {
  society_head: {
    label: "Society Head",
    cls: "border-primary/20 bg-primary/10 text-primary dark:border-primary/20 dark:bg-primary/10 dark:text-primary",
  },
  "co-coordinator": {
    label: "Co-Coordinator",
    cls: "border-info/20 bg-info/10 text-info dark:border-info/20 dark:bg-info/10 dark:text-info",
  },
  executive: {
    label: "Executive",
    cls: "border-info/20 bg-info/10 text-info dark:border-info/20 dark:bg-info/10 dark:text-info",
  },
  "active-member": {
    label: "Active Member",
    cls: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700/30 dark:text-slate-300",
  },
  student: {
    label: "Student",
    cls: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-700/30 dark:text-slate-400",
  },
};

function getMemberName(member) {
  const profile = member.memberId?.profile ?? {};
  return profile.displayName || `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Unknown Member";
}

function getMemberAvatar(member) {
  return member.memberId?.profile?.avatar ?? null;
}

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function MemberRow({ member, societyId, dispatch, showSuccess, showError, roleDisabled, onRemove, theme }) {
  const [busyRole, setBusyRole] = useState(false);
  const name = getMemberName(member);
  const avatar = getMemberAvatar(member);
  const memberId = member.memberId?._id ?? member.memberId;

  const handleRole = async (event) => {
    setBusyRole(true);
    try {
      await dispatch(updateMemberRoleThunk({ societyId, memberId, role: event.target.value })).unwrap();
      showSuccess("Role updated.");
    } catch (error) {
      showError(error || "Failed to update role");
    } finally {
      setBusyRole(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border p-4", theme.card)}>
      {avatar ? (
        <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold", theme.subtle)}>
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", theme.text)}>{name}</p>
        <p className={cn("truncate text-xs", theme.muted)}>{member.memberId?.academic?.department ?? ""}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn("hidden text-xs md:block", theme.muted)}>{formatDate(member.joinedAt)}</span>
        {roleDisabled ? (
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase", (ROLE_CONFIG[member.role] || ROLE_CONFIG.student).cls)}>
            {(ROLE_CONFIG[member.role] || ROLE_CONFIG.student).label}
          </span>
        ) : (
          <select
            value={member.role}
            onChange={handleRole}
            disabled={busyRole}
            className={cn("rounded-xl border px-3 py-2 text-xs outline-none transition-colors", theme.field)}
          >
            {APPROVED_ROLES.filter((role) => role !== "society_head").map((role) => (
              <option key={role} value={role}>
                {ROLE_CONFIG[role]?.label ?? role}
              </option>
            ))}
          </select>
        )}

        {!roleDisabled && (
          <button
            onClick={() => onRemove(member)}
            className={getButtonClassName({ variant: "icon", size: "iconSm" })}
            title="Remove member"
          >
            <span className="material-symbols-outlined text-[18px]">person_remove</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function MemberRequests() {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);
  const { societyId } = useOutletContext() ?? {};

  const approved = useSelector(selectSocietyMembers);
  const pending = useSelector(selectMemberRequests);
  const loading = useSelector(selectMembersLoading);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });

  const filtered = search.trim()
    ? approved.filter((member) => getMemberName(member).toLowerCase().includes(search.trim().toLowerCase()))
    : approved;

  const handleRemoveMember = (member) => {
    const name = getMemberName(member);
    const memberId = member.memberId?._id ?? member.memberId;
    setConfirmConfig({
      isOpen: true,
      title: "Remove Member",
      message: `Are you sure you want to remove "${name}" from this society? This action will revoke their access to all society-exclusive resources.`,
      onConfirm: async () => {
        setIsRemoving(true);
        try {
          await dispatch(removeMemberThunk({ societyId, memberId })).unwrap();
          showSuccess("Member removed successfully.");
        } catch (error) {
          showError(error || "Failed to remove member");
        } finally {
          setIsRemoving(false);
          setConfirmConfig({ isOpen: false });
        }
      },
      variant: "danger",
    });
  };

  const handleApprove = async (memberId) => {
    setBusyId(memberId);
    try {
      await dispatch(approveMemberThunk({ societyId, memberId })).unwrap();
      showSuccess("Member approved!");
      if (pending.length === 1) setShowModal(false);
    } catch (error) {
      showError(error || "Failed to approve");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (memberId) => {
    setBusyId(memberId);
    try {
      await dispatch(rejectMemberThunk({ societyId, memberId })).unwrap();
      showSuccess("Request rejected.");
      if (pending.length === 1) setShowModal(false);
    } catch (error) {
      showError(error || "Failed to reject");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className={cn("text-3xl font-bold tracking-tight", theme.text)}>Members</h1>
          <p className={cn("text-sm", theme.muted)}>Manage approved members, role assignments, and join requests.</p>
        </div>

        {pending.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className={getButtonClassName({ variant: "warning", size: "md", className: "rounded-xl" })}
          >
            <span className="material-symbols-outlined text-base">notifications_active</span>
            Pending Requests
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-xs font-bold text-current dark:bg-white/10">{pending.length}</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(approved.reduce((acc, member) => {
          acc[member.role] = (acc[member.role] || 0) + 1;
          return acc;
        }, {})).map(([role, count]) => (
          <span key={role} className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", (ROLE_CONFIG[role] || ROLE_CONFIG.student).cls)}>
            {(ROLE_CONFIG[role] || ROLE_CONFIG.student).label}: {count}
          </span>
        ))}
        {approved.length === 0 && !loading && <span className={cn("text-xs", theme.muted)}>No approved members yet</span>}
      </div>

      <div className="relative max-w-sm">
        <span className={cn("material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base", theme.muted)}>search</span>
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={cn("w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors", theme.field)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={cn("h-16 animate-pulse rounded-2xl border", theme.card)} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={cn("rounded-3xl border p-12 text-center", theme.card)}>
          <span className={cn("material-symbols-outlined mb-3 block text-5xl", theme.muted)}>group_off</span>
          <p className={cn("text-sm font-medium", theme.text)}>
            {search ? "No members match your search" : "No approved members yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((member) => (
            <MemberRow
              key={member.memberId?._id ?? member.memberId}
              member={member}
              societyId={societyId}
              dispatch={dispatch}
              showSuccess={showSuccess}
              showError={showError}
              roleDisabled={member.role === "society_head"}
              onRemove={handleRemoveMember}
              theme={theme}
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className={cn("flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border", theme.card)}>
            <div className={cn("flex items-center justify-between border-b p-5", theme.divider)}>
              <h3 className={cn("flex items-center gap-2 text-lg font-semibold", theme.text)}>
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">pending</span>
                Pending Requests
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400">
                  {pending.length}
                </span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={getButtonClassName({ variant: "ghost", size: "iconSm" })}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto p-5">
              {pending.length === 0 ? (
                <div className="py-10 text-center">
                  <span className={cn("material-symbols-outlined mb-3 block text-5xl", theme.muted)}>check_circle</span>
                  <p className={cn("text-sm", theme.muted)}>All caught up. No pending requests.</p>
                </div>
              ) : (
                pending.map((member) => {
                  const memberId = member.memberId?._id ?? member.memberId;
                  const name = getMemberName(member);
                  const avatar = getMemberAvatar(member);
                  const busy = busyId === memberId;

                  return (
                    <div key={memberId} className={cn("flex items-center gap-4 rounded-2xl border p-4", theme.subtle)}>
                      {avatar ? (
                        <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold", theme.card)}>
                          {name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-semibold", theme.text)}>{name}</p>
                        <p className={cn("text-xs", theme.muted)}>Requested {formatDate(member.joinedAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(memberId)}
                          disabled={busy}
                          className={getButtonClassName({ variant: "danger", size: "iconSm", className: "rounded-full" })}
                          title="Reject"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                        <button
                          onClick={() => handleApprove(memberId)}
                          disabled={busy}
                          className={getButtonClassName({ variant: "success", size: "iconSm", className: "rounded-full" })}
                          title="Approve"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
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

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onCancel={() => setConfirmConfig({ isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        loading={isRemoving}
      />
    </div>
  );
}
