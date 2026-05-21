import { useOutletContext, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useHomeTheme from "../../hooks/useHomeTheme";
import {
  selectSocietyMembers,
  selectSocietyStats,
  selectSocietyLoading,
} from "../../redux/slices/societySlice";
import { cn, getSocietyTheme } from "./societyTheme";
import { getButtonClassName } from "../../components/common/Button";

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({ icon, label, value, sub, color, theme }) {
  return (
    <div className={cn("rounded-2xl border p-5", theme.card)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", theme.muted)}>{label}</p>
          <p className={cn("text-3xl font-bold", color || theme.text)}>{value ?? "--"}</p>
          {sub && <p className={cn("text-xs", theme.muted)}>{sub}</p>}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border", theme.subtle)}>
          <span className={cn("material-symbols-outlined text-xl", theme.muted)}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, to, badge, navigate, theme }) {
  return (
    <button
      onClick={() => navigate(to)}
      className={cn("w-full rounded-2xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2", theme.card)}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border", theme.subtle)}>
          <span className={cn("material-symbols-outlined text-xl", theme.muted)}>{icon}</span>
        </div>
        {badge > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400">
            {badge} pending
          </span>
        )}
      </div>
      <p className={cn("text-lg font-medium", theme.text)}>{title}</p>
      <p className={cn("mt-1 text-sm", theme.muted)}>{description}</p>
    </button>
  );
}

export default function SocietyManagement() {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);
  const { headSociety, societyId } = useOutletContext() ?? {};
  const members = useSelector(selectSocietyMembers);
  const stats = useSelector(selectSocietyStats);
  const loading = useSelector(selectSocietyLoading);

  const approvedMembers = members.filter((member) => member.status === "approved");
  const pendingMembers = members.filter((member) => member.status === "pending");

  const getMemberName = (member) => {
    const profile = member.memberId?.profile ?? {};
    return profile.displayName || `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Member";
  };

  const getMemberAvatar = (member) => member.memberId?.profile?.avatar ?? null;

  const statusCls = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
    pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400",
    rejected: "border-danger/20 bg-danger/5 text-danger dark:border-danger/30 dark:bg-danger/10 dark:text-danger",
  }[headSociety?.status] || theme.badgeMuted;

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className={cn("text-3xl font-bold tracking-tight", theme.text)}>HQ Dashboard</h1>
          <p className={cn("text-sm", theme.muted)}>Overview of your society activity and operations.</p>
        </div>
        <button
          onClick={() => navigate(`/society/${societyId}/settings`)}
          className={getButtonClassName({ variant: "secondary", size: "md", isDark })}
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit Society
        </button>
      </div>

      {headSociety?.status !== "approved" && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm",
            headSociety?.status === "pending"
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300"
              : "border-danger/20 bg-danger/5 text-danger dark:border-danger/30 dark:bg-danger/10 dark:text-danger"
          )}
        >
          <span className="material-symbols-outlined">
            {headSociety?.status === "pending" ? "pending" : "block"}
          </span>
          <div>
            <p className="font-semibold capitalize">{headSociety?.status}</p>
            {headSociety?.statusReason && <p className="mt-1 text-xs opacity-80">{headSociety.statusReason}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="group"
          label="Total Members"
          value={headSociety?.memberCount ?? approvedMembers.length}
          sub={`+${stats?.members?.joinedLast30Days ?? 0} this month`}
          theme={theme}
        />
        <StatCard
          icon="pending"
          label="Pending Requests"
          value={pendingMembers.length}
          color={pendingMembers.length > 0 ? "text-amber-700 dark:text-amber-400" : theme.text}
          theme={theme}
        />
        <StatCard
          icon="event"
          label="Total Events"
          value={stats?.events?.total ?? "--"}
          sub={`${stats?.events?.published ?? 0} upcoming`}
          theme={theme}
        />
        <StatCard
          icon="check_circle"
          label="Status"
          value={headSociety?.status ?? "--"}
          color={headSociety?.status === "approved" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}
          theme={theme}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_1.5fr]">
        <div className={cn("overflow-hidden rounded-3xl border", theme.card)}>
          <div className={cn("relative h-28 border-b", theme.divider)}>
            {headSociety?.media?.coverImage ? (
              <img src={headSociety.media.coverImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className={cn("h-full w-full", theme.subtle)} />
            )}
            <div className="absolute bottom-0 left-5 translate-y-1/2">
              {headSociety?.media?.logo ? (
                <img
                  src={headSociety.media.logo}
                  alt=""
                  className={cn("h-14 w-14 rounded-2xl border-4 object-cover", isDark ? "border-surface-dark" : "border-white")}
                />
              ) : (
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl border-4",
                    isDark ? "border-surface-dark bg-surface-muted-dark" : "border-white bg-slate-100"
                  )}
                >
                  <span className={cn("material-symbols-outlined text-xl", theme.muted)}>groups</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 px-5 pb-5 pt-10">
            <div className="space-y-1">
              <p className={cn("text-lg font-medium", theme.text)}>{headSociety?.name}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("text-xs", theme.muted)}>#{headSociety?.tag}</span>
                <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase", statusCls)}>
                  {headSociety?.status}
                </span>
              </div>
            </div>

            <p className={cn("text-sm leading-6", theme.muted)}>{headSociety?.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className={cn("rounded-2xl border p-3 text-center", theme.subtle)}>
                <p className={cn("text-lg font-semibold", theme.text)}>{headSociety?.memberCount ?? approvedMembers.length}</p>
                <p className={cn("mt-1 text-xs uppercase tracking-[0.16em]", theme.muted)}>Members</p>
              </div>
              <div className={cn("rounded-2xl border p-3 text-center", theme.subtle)}>
                <p className={cn("text-lg font-semibold", theme.text)}>{stats?.events?.total ?? 0}</p>
                <p className={cn("mt-1 text-xs uppercase tracking-[0.16em]", theme.muted)}>Events</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickActionCard
            icon="group"
            title="Manage Members"
            description="View approved members, roles, and join requests."
            to={`/society/${societyId}/members`}
            badge={pendingMembers.length}
            navigate={navigate}
            theme={theme}
          />
          <QuickActionCard
            icon="campaign"
            title="Announcements"
            description="Open the public society page and manage updates."
            to={`/societies/${societyId}`}
            navigate={navigate}
            theme={theme}
          />
          <QuickActionCard
            icon="event"
            title="Society Events"
            description="Track submissions, approvals, and live events."
            to={`/society/${societyId}/events`}
            navigate={navigate}
            theme={theme}
          />
          <QuickActionCard
            icon="analytics"
            title="Analytics"
            description="Review growth, event performance, and engagement."
            to={`/society/${societyId}/analytics`}
            navigate={navigate}
            theme={theme}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("material-symbols-outlined text-base", theme.muted)}>group</span>
            <h2 className={cn("text-xl font-semibold", theme.text)}>Recent Members</h2>
          </div>
          <button
            onClick={() => navigate(`/society/${societyId}/members`)}
            className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2" })}
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className={cn("h-16 animate-pulse rounded-2xl border", theme.card)} />
            ))}
          </div>
        ) : approvedMembers.length === 0 ? (
          <div className={cn("rounded-2xl border p-10 text-center", theme.card)}>
            <p className={cn("text-sm", theme.muted)}>No approved members yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...approvedMembers]
              .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
              .slice(0, 5)
              .map((member) => {
                const id = member.memberId?._id ?? member.memberId;
                const name = getMemberName(member);
                const avatar = getMemberAvatar(member);

                return (
                  <div key={id} className={cn("flex items-center gap-4 rounded-2xl border p-4", theme.card)}>
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
                      <span className={cn("hidden text-xs sm:block", theme.muted)}>{formatDate(member.joinedAt)}</span>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize", theme.badgeMuted)}>
                        {member.role}
                      </span>
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
