import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeTheme from "../../hooks/useHomeTheme";
import {
  fetchSocietyStats,
  selectSocietyStats,
  selectSocietyMembers,
  selectSocietyLoading,
} from "../../redux/slices/societySlice";
import { cn, getSocietyTheme } from "./societyTheme";

function BarRow({ label, value, max, fillClass, theme }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className={cn("text-sm capitalize", theme.muted)}>{label}</span>
        <span className={cn("text-sm font-semibold", theme.text)}>{value}</span>
      </div>
      <div className={cn("h-2.5 overflow-hidden rounded-full", theme.subtle)}>
        <div className={cn("h-full rounded-full transition-all duration-700", fillClass)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
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

export default function SocietyAnalytics() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);
  const { societyId } = useOutletContext() ?? {};
  const stats = useSelector(selectSocietyStats);
  const members = useSelector(selectSocietyMembers);
  const loading = useSelector(selectSocietyLoading);

  useEffect(() => {
    if (societyId) dispatch(fetchSocietyStats(societyId));
  }, [dispatch, societyId]);

  const approved = members.filter((member) => member.status === "approved");
  const pending = members.filter((member) => member.status === "pending");
  const rejected = members.filter((member) => member.status === "rejected");

  const byRole = stats?.members?.byRole ?? {};
  const byRoleTotal = Object.values(byRole).reduce((a, b) => a + b, 0);
  const eventStats = stats?.events ?? {};
  const eventTotal = eventStats.total ?? 0;

  const roleColors = {
    society_head: "bg-primary",
    "co-coordinator": "bg-info",
    executive: "bg-info",
    "active-member": isDark ? "bg-border-dark" : "bg-border-light",
    student: isDark ? "bg-border-dark" : "bg-border-light",
  };

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="space-y-1">
        <h1 className={cn("text-3xl font-bold tracking-tight", theme.text)}>Analytics</h1>
        <p className={cn("text-sm", theme.muted)}>Track society growth, member distribution, and event performance.</p>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={cn("h-28 animate-pulse rounded-2xl border", theme.card)} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="group"
            label="Total Members"
            value={stats?.members?.total ?? approved.length}
            sub={`+${stats?.members?.joinedLast30Days ?? 0} this month`}
            theme={theme}
          />
          <StatCard
            icon="pending"
            label="Pending Requests"
            value={pending.length}
            color="text-amber-700 dark:text-amber-400"
            theme={theme}
          />
          <StatCard
            icon="event"
            label="Total Events"
            value={eventTotal}
            sub={`${eventStats.published ?? 0} upcoming`}
            theme={theme}
          />
          <StatCard
            icon="check_circle"
            label="Completed Events"
            value={eventStats.completed ?? 0}
            color="text-emerald-700 dark:text-emerald-400"
            theme={theme}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={cn("rounded-3xl border p-6", theme.card)}>
          <h3 className={cn("flex items-center gap-2 text-lg font-medium", theme.text)}>
            <span className={cn("material-symbols-outlined text-lg", theme.muted)}>donut_small</span>
            Member Role Breakdown
          </h3>
          {byRoleTotal === 0 && !loading ? (
            <div className="py-10 text-center">
              <p className={cn("text-sm", theme.muted)}>No member data yet.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {Object.entries(byRole).map(([role, count]) => (
                <BarRow
                  key={role}
                  label={role.replace(/-/g, " ")}
                  value={count}
                  max={byRoleTotal}
                  fillClass={roleColors[role] || (isDark ? "bg-slate-400" : "bg-slate-600")}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>

        <div className={cn("rounded-3xl border p-6", theme.card)}>
          <h3 className={cn("flex items-center gap-2 text-lg font-medium", theme.text)}>
            <span className={cn("material-symbols-outlined text-lg", theme.muted)}>bar_chart</span>
            Member Status
          </h3>
          <div className="mt-6 space-y-5">
            {[
              { key: "approved", label: "Approved", value: approved.length, fill: isDark ? "bg-emerald-500" : "bg-emerald-600" },
              { key: "pending", label: "Pending", value: pending.length, fill: isDark ? "bg-amber-500" : "bg-amber-600" },
              { key: "rejected", label: "Rejected", value: rejected.length, fill: isDark ? "bg-rose-500" : "bg-rose-600" },
            ].map((item) => (
              <BarRow
                key={item.key}
                label={item.label}
                value={item.value}
                max={approved.length + pending.length + rejected.length}
                fillClass={item.fill}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={cn("rounded-3xl border p-6", theme.card)}>
        <h3 className={cn("flex items-center gap-2 text-lg font-medium", theme.text)}>
          <span className={cn("material-symbols-outlined text-lg", theme.muted)}>event</span>
          Event Overview
        </h3>
        {eventTotal === 0 ? (
          <div className="py-10 text-center">
            <span className={cn("material-symbols-outlined mb-2 block text-4xl", theme.muted)}>event_busy</span>
            <p className={cn("text-sm", theme.muted)}>No events organized yet.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total", value: eventTotal, color: theme.text },
              { label: "Upcoming", value: eventStats.published ?? 0, color: "text-sky-700 dark:text-sky-400" },
              { label: "Completed", value: eventStats.completed ?? 0, color: "text-emerald-700 dark:text-emerald-400" },
              { label: "Cancelled", value: eventStats.cancelled ?? 0, color: "text-rose-700 dark:text-rose-400" },
            ].map((item) => (
              <div key={item.label} className={cn("rounded-2xl border p-4 text-center", theme.subtle)}>
                <p className={cn("text-2xl font-bold", item.color)}>{item.value}</p>
                <p className={cn("mt-1 text-xs font-semibold uppercase tracking-[0.16em]", theme.muted)}>{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {approved.length > 0 && (
        <div className={cn("rounded-3xl border p-6", theme.card)}>
          <div className="flex items-center gap-2">
            <span className={cn("material-symbols-outlined text-lg", theme.muted)}>person_add</span>
            <h3 className={cn("text-lg font-medium", theme.text)}>Recent Joins</h3>
            <span className={cn("ml-auto rounded-full border px-2 py-0.5 text-xs font-semibold", theme.badgeMuted)}>
              {stats?.members?.joinedLast30Days ?? 0}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[...approved]
              .filter((member) => {
                const joinedAt = new Date(member.joinedAt);
                return joinedAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              })
              .slice(0, 12)
              .map((member) => {
                const profile = member.memberId?.profile ?? {};
                const name =
                  profile.displayName ||
                  `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
                  "?";

                return profile.avatar ? (
                  <img key={member.memberId?._id} src={profile.avatar} alt={name} title={name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div
                    key={member.memberId?._id}
                    title={name}
                    className={cn("flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold", theme.subtle)}
                  >
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
