import { useOutletContext, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useHomeTheme from "../../hooks/useHomeTheme";
import { selectSocietyMembers, selectSocietyStats } from "../../redux/slices/societySlice";
import { cn, getSocietyTheme } from "./societyTheme";
import { getButtonClassName } from "../../components/common/Button";

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

const ROLE_CFG = {
  society_head: {
    label: "Society Head",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  "co-coordinator": {
    label: "Co-Coordinator",
    cls: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-400",
  },
  executive: {
    label: "Executive",
    cls: "border-info/20 bg-info/5 text-info dark:border-info/25 dark:bg-info/10 dark:text-info",
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

export default function SocietyProfile() {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);
  const { headSociety, societyId } = useOutletContext() ?? {};
  const members = useSelector(selectSocietyMembers);
  const stats = useSelector(selectSocietyStats);

  const approved = members.filter((member) => member.status === "approved");

  const getMemberName = (member) => {
    const profile = member.memberId?.profile ?? {};
    return profile.displayName || `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Member";
  };

  const statusCls = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
    pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400",
    rejected: "border-danger/20 bg-danger/5 text-danger dark:border-danger/30 dark:bg-danger/10 dark:text-danger",
  }[headSociety?.status] || theme.badgeMuted;

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className={cn("text-3xl font-bold tracking-tight", theme.text)}>Society Profile</h1>
          <p className={cn("text-sm", theme.muted)}>Your society public identity and leadership snapshot.</p>
        </div>
        <button
          onClick={() => navigate(`/society/edit/${societyId}`)}
          className={getButtonClassName({ variant: "secondary", size: "md", isDark })}
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit Society
        </button>
      </div>

      <div className={cn("overflow-hidden rounded-[28px] border", theme.card)}>
        <div className={cn("relative h-52 border-b", theme.divider)}>
          {headSociety?.media?.coverImage ? (
            <img src={headSociety.media.coverImage} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className={cn("flex h-full w-full items-center justify-center", theme.subtle)}>
              <span className={cn("material-symbols-outlined text-7xl opacity-40", theme.muted)}>groups</span>
            </div>
          )}
          <div className="absolute bottom-0 left-6 translate-y-1/2">
            {headSociety?.media?.logo ? (
              <img
                src={headSociety.media.logo}
                alt={headSociety.name}
                className={cn("h-20 w-20 rounded-3xl border-4 object-cover", isDark ? "border-surface-dark" : "border-white")}
              />
            ) : (
              <div
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-3xl border-4",
                  isDark ? "border-surface-dark bg-container-dark" : "border-white bg-slate-100"
                )}
              >
                <span className={cn("material-symbols-outlined text-3xl", theme.muted)}>groups</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 px-6 pb-6 pt-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h2 className={cn("text-3xl font-bold tracking-tight", theme.text)}>{headSociety?.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("text-sm", theme.muted)}>#{headSociety?.tag}</span>
                <span className={cn("text-sm", theme.muted)}>{headSociety?.category}</span>
                <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase", statusCls)}>
                  {headSociety?.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/societies/${societyId}`)}
              className={getButtonClassName({ variant: "secondary", size: "md", isDark })}
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              Public View
            </button>
          </div>

          <p className={cn("max-w-3xl text-sm leading-7 sm:text-base", theme.muted)}>
            {headSociety?.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: "group", label: "Members", value: headSociety?.memberCount ?? approved.length },
          { icon: "event", label: "Events", value: stats?.events?.total ?? 0 },
          { icon: "campaign", label: "Completed Events", value: stats?.events?.completed ?? 0 },
          {
            icon: "calendar_today",
            label: "Founded",
            value: headSociety?.createdAt ? new Date(headSociety.createdAt).getFullYear() : "--",
          },
        ].map(({ icon, label, value }) => (
          <div key={label} className={cn("rounded-2xl border p-5 text-center", theme.card)}>
            <span className={cn("material-symbols-outlined mb-2 block text-xl", theme.muted)}>{icon}</span>
            <p className={cn("text-2xl font-bold", theme.text)}>{value}</p>
            <p className={cn("mt-1 text-xs font-semibold uppercase tracking-[0.16em]", theme.muted)}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={cn("rounded-3xl border p-6", theme.card)}>
          <h3 className={cn("text-lg font-medium", theme.text)}>Society Details</h3>
          <div className="mt-5 space-y-4">
            {[
              { label: "Founded", value: formatDate(headSociety?.createdAt) },
              { label: "Category", value: headSociety?.category ?? "--" },
              { label: "Tag", value: headSociety?.tag ? `#${headSociety.tag}` : "--" },
              { label: "Join Mode", value: headSociety?.requireApproval ? "Approval Required" : "Open Join" },
            ].map(({ label, value }) => (
              <div key={label} className={cn("flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0", theme.divider)}>
                <span className={cn("text-sm", theme.muted)}>{label}</span>
                <span className={cn("text-sm font-medium capitalize", theme.text)}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("rounded-3xl border p-6", theme.card)}>
          <div className="flex items-center justify-between gap-3">
            <h3 className={cn("text-lg font-medium", theme.text)}>Member Roster Preview</h3>
            {approved.length > 6 && <span className={cn("text-xs", theme.muted)}>{approved.length} members</span>}
          </div>

          {approved.length === 0 ? (
            <p className={cn("mt-5 text-sm", theme.muted)}>No approved members yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {approved.slice(0, 6).map((member) => {
                const profile = member.memberId?.profile ?? {};
                const name = getMemberName(member);
                const roleCfg = ROLE_CFG[member.role] || ROLE_CFG.student;

                return (
                  <div key={member.memberId?._id ?? member.memberId} className={cn("flex items-center gap-3 rounded-2xl border p-3", theme.subtle)}>
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className={cn("min-w-0 flex-1 truncate text-sm font-medium", theme.text)}>{name}</span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase", roleCfg.cls)}>
                      {roleCfg.label}
                    </span>
                  </div>
                );
              })}

              {approved.length > 6 && <p className={cn("text-xs", theme.muted)}>+{approved.length - 6} more members</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
