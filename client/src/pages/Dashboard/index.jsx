import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import RoleGuard from "../../routes/RoleGuard.jsx";
import { useAuth } from "../../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardSummary,
  fetchDashboardTimeline,
  selectDashboardSummary,
  selectDashboardTimeline,
} from "../../redux/slices/dashboardSlice";
import {
  fetchMyMentorProfile,
  selectMyMentorProfile,
} from "../../redux/slices/mentoringSlice";
import {
  fetchGamificationBadges,
  fetchGamificationProgress,
  fetchGamificationStreaks,
  fetchGamificationSummary,
  fetchGamificationTransactions,
} from "../../redux/slices/gamificationSlice";
import { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";
import GamificationDashboard from "../../components/gamification/GamificationDashboard";
import { useLanguage } from "../../hooks/useLanguage";

function StatCard({ icon, label, value, color = "#238636", to, isDark = true }) {
  const content = (
    <div
      className={`flex items-center gap-4 rounded-[24px] border p-5 transition-all duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] hover:border-[#475569] hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
          : "border-[#dce4ee] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] hover:border-[#cbd5e1] hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
      }`}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: isDark ? `${color}18` : `${color}12` }}
      >
        <span className="material-symbols-outlined" style={{ color }}>
          {icon}
        </span>
      </div>
      <div>
        <p className={isDark ? "text-xs font-medium text-[#8b949e]" : "text-xs font-medium text-[#526277]"}>
          {label}
        </p>
        <p className={isDark ? "text-2xl font-bold leading-tight text-[#e6edf3]" : "text-2xl font-bold leading-tight text-[#162033]"}>
          {value}
        </p>
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function SectionCard({ title, action, actionTo, children, isDark = true }) {
  return (
    <div
      className={`overflow-hidden rounded-[28px] border transition-all duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
          : "border-[#dce4ee] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
          isDark ? "border-[#30363d]" : "border-[#e2e8f0]"
        }`}
      >
        <h2 className={isDark ? "text-xl font-semibold text-[#e6edf3]" : "text-xl font-semibold text-[#162033]"}>
          {title}
        </h2>
        {action && actionTo && (
          <Link
            to={actionTo}
            className="text-sm font-medium text-primary hover:underline"
          >
            {action}
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState({ icon, message, cta, onClick, isDark = true }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className={isDark ? "material-symbols-outlined text-4xl text-[#3d444d]" : "material-symbols-outlined text-4xl text-[#94A3B8]"}>
        {icon}
      </span>
      <p className={isDark ? "text-sm text-[#8b949e]" : "text-sm text-[#526277]"}>{message}</p>
      {cta && (
        <button
          onClick={onClick}
          className={getButtonClassName({ variant: "primary", size: "md" })}
        >
          {cta}
        </button>
      )}
    </div>
  );
}

function QuickActionPill({ icon, label, to, color, isDark = true }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] hover:border-[#475569] hover:text-[#e6edf3]"
          : "border-[#dce4ee] bg-white text-[#334155] shadow-sm hover:border-[#cbd5e1] hover:text-[#0f172a]"
      }`}
    >
      <span className="material-symbols-outlined text-base" style={{ color }}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

function TimelineItem({ item, isDark = true }) {
  const navigate = useNavigate();
  const isEvent = item.type === "event";
  const icon = isEvent ? "event" : "calendar_month";
  const color = isEvent ? "#e3b341" : "#3fb950";

  return (
    <div
      onClick={() => navigate(isEvent ? `/events/${item.id}` : `/mentor/sessions/${item.id}`)}
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-3 transition-all duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#0d1117] hover:border-[#475569] hover:bg-[#161b22]"
          : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#cbd5e1] hover:bg-white"
      }`}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: isDark ? `${color}18` : `${color}12` }}
      >
        <span className="material-symbols-outlined text-lg" style={{ color }}>
          {icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className={isDark ? "truncate text-sm font-medium text-[#e6edf3]" : "truncate text-sm font-medium text-[#162033]"}>
          {item.title}
        </h4>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={isDark ? "text-xs text-[#8b949e]" : "text-xs text-[#526277]"}>
            {new Date(item.time).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {item.category && (
            <>
              <span className={isDark ? "h-1 w-1 rounded-full bg-[#30363d]" : "h-1 w-1 rounded-full bg-[#E2E8F0]"} />
              <span className={isDark ? "truncate text-xs text-[#8b949e]" : "truncate text-xs text-[#526277]"}>
                {item.category}
              </span>
            </>
          )}
        </div>
      </div>
      <span className={isDark ? "material-symbols-outlined text-lg text-[#3d444d]" : "material-symbols-outlined text-lg text-[#94A3B8]"}>
        chevron_right
      </span>
    </div>
  );
}

function StudentWidgets({ timeline = [], isDark = true, t }) {
  const navigate = useNavigate();

  return (
    <SectionCard title={t("dashboard.timeline.title")} action={t("dashboard.timeline.action")} actionTo="/events" isDark={isDark}>
      {timeline.length > 0 ? (
        <div className="space-y-2">
          {timeline.map((item) => (
            <TimelineItem key={item.id} item={item} isDark={isDark} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="event"
          message={t("dashboard.timeline.empty")}
          cta={t("dashboard.timeline.cta")}
          onClick={() => navigate("/events")}
          isDark={isDark}
        />
      )}
    </SectionCard>
  );
}

function MentorWidgets({ pendingCount = 0, myMentorProfile, isDark = true }) {
  const navigate = useNavigate();

  if (myMentorProfile && !myMentorProfile.isActive) {
    return (
      <SectionCard title="Mentor Status" isDark={isDark}>
        <div className={isDark ? "rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center" : "rounded-2xl border border-red-200 bg-red-50 p-5 text-center"}>
          <span className="material-symbols-outlined mb-2 block text-3xl text-red-400">block</span>
          <p className="font-bold text-red-400">Profile Suspended</p>
          <p className={isDark ? "mt-1 text-sm text-[#8b949e]" : "mt-1 text-sm text-[#526277]"}>
            Your mentor profile has been suspended. Please contact an administrator for details.
          </p>
        </div>
      </SectionCard>
    );
  }

  if (myMentorProfile && !myMentorProfile.verified) {
    return (
      <SectionCard title="Mentor Verification" isDark={isDark}>
        <div className={isDark ? "rounded-2xl border border-[#e3b341]/30 bg-[#e3b341]/10 p-5" : "rounded-2xl border border-amber-200 bg-amber-50 p-5"}>
          <div className="mb-3 flex items-center gap-3">
            <div className={isDark ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e3b341]/20" : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100"}>
              <span className="material-symbols-outlined text-lg text-[#e3b341]">hourglass_top</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#e3b341]">Application Pending</p>
              <p className={isDark ? "text-xs text-[#8b949e]" : "text-xs text-[#526277]"}>
                Awaiting admin review, typically 1-3 business days
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {["Submitted", "Under Review", "Approved"].map((step, index) => (
              <div
                key={step}
                className={`rounded-xl p-2 text-xs font-medium ${
                  index === 0
                    ? isDark
                      ? "bg-[#e3b341]/20 text-[#e3b341]"
                      : "bg-amber-200 text-amber-700"
                    : index === 1
                      ? isDark
                        ? "bg-[#e3b341]/10 text-[#e3b341]/70"
                        : "bg-amber-100 text-amber-600/70"
                      : isDark
                        ? "bg-[#21262d] text-[#3d444d]"
                        : "bg-slate-200 text-slate-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Mentor Dashboard" isDark={isDark}>
      {pendingCount > 0 ? (
        <div
          onClick={() => navigate("/mentor/sessions")}
          className={`flex cursor-pointer items-center justify-between rounded-2xl border p-5 transition-all duration-300 ${
            isDark
              ? "border-[#3fb950]/30 bg-[#3fb950]/10 hover:bg-[#3fb950]/20"
              : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
          }`}
        >
          <div>
            <p className="text-sm font-bold text-[#3fb950]">New Session Requests</p>
            <p className={isDark ? "text-xl font-bold text-[#e6edf3]" : "text-xl font-bold text-[#162033]"}>
              {pendingCount}
            </p>
          </div>
          <span className="material-symbols-outlined text-2xl text-[#3fb950]">arrow_circle_right</span>
        </div>
      ) : (
        <EmptyState
          icon="calendar_month"
          message="No pending session requests."
          cta="Set Availability"
          onClick={() => navigate("/mentor/availability")}
          isDark={isDark}
        />
      )}
    </SectionCard>
  );
}

function BecomeMentorCTA({ isDark = true, t }) {
  const navigate = useNavigate();

  return (
    <SectionCard title={t("dashboard.mentorship.title")} isDark={isDark}>
      <div className="py-4 text-center">
        <div className={isDark ? "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3fb950]/10" : "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100"}>
          <span className="material-symbols-outlined text-2xl text-[#3fb950]">school</span>
        </div>
        <p className={isDark ? "text-sm font-semibold text-[#e6edf3]" : "text-sm font-semibold text-[#162033]"}>
          {t("dashboard.mentorship.headline")}
        </p>
        <p className={isDark ? "mb-4 mt-1 text-xs text-[#8b949e]" : "mb-4 mt-1 text-xs text-[#526277]"}>
          {t("dashboard.mentorship.text")}
        </p>
        <button
          onClick={() => navigate("/mentor/register")}
          className={getButtonClassName({ variant: "primary", size: "md" })}
        >
          {t("dashboard.mentorship.cta")}
        </button>
      </div>
    </SectionCard>
  );
}

function SocietyHeadWidgets({ isDark = true }) {
  const navigate = useNavigate();

  return (
    <>
      <SectionCard title="Member Join Requests" isDark={isDark}>
        <EmptyState
          icon="how_to_reg"
          message="No pending member requests."
          cta="Manage Members"
          onClick={() => navigate("/society/member-requests")}
          isDark={isDark}
        />
      </SectionCard>

      <SectionCard title="Upcoming Society Events" isDark={isDark}>
        <EmptyState
          icon="event_available"
          message="No events scheduled."
          cta="Create Event"
          onClick={() => navigate("/events/create")}
          isDark={isDark}
        />
      </SectionCard>
    </>
  );
}

function AdminWidgets({ pendingApprovals = 0, isDark = true }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon="pending_actions" label="Pending Approvals" value={pendingApprovals} color="#e3b341" to="/admin/approvals" isDark={isDark} />
        <StatCard icon="fact_check" label="Health Check" value="Optimal" color="#388bfd" to="/admin/system" isDark={isDark} />
        <StatCard icon="group" label="Total Users" value="Live" color="#3fb950" to="/admin/users" isDark={isDark} />
      </div>
      <div className="mt-4">
        <SectionCard title="Quick Admin Actions" isDark={isDark}>
          <div className="flex flex-wrap gap-2">
            <QuickActionPill icon="manage_accounts" label="Users" to="/admin/users" color="#3fb950" isDark={isDark} />
            <QuickActionPill icon="domain" label="Campuses" to="/admin/campuses" color="#3fb950" isDark={isDark} />
            <QuickActionPill icon="monitor_heart" label="System" to="/admin/system" color="#e3b341" isDark={isDark} />
            <QuickActionPill icon="analytics" label="Analytics" to="/admin/analytics" color="#388bfd" isDark={isDark} />
          </div>
        </SectionCard>
      </div>
    </>
  );
}

const ROLE_META = {
  student: { labelKey: "dashboard.roles.student", color: "#388bfd", bg: "#388bfd18" },
  mentor: { labelKey: "dashboard.roles.mentor", color: "#3fb950", bg: "#3fb95018" },
  society_head: { labelKey: "dashboard.roles.societyHead", color: "#e3b341", bg: "#e3b34118" },
  admin: { labelKey: "dashboard.roles.admin", color: "#f0883e", bg: "#f0883e18" },
};

function RoleBadge({ role, isDark = true, t }) {
  const meta = ROLE_META[role] || { labelKey: null, color: "#8b949e", bg: "#8b949e18" };
  const label = meta.labelKey ? t(meta.labelKey) : role;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isDark ? "" : "border"
      }`}
      style={{
        color: meta.color,
        backgroundColor: meta.bg,
        borderColor: meta.color,
      }}
    >
      {label}
    </span>
  );
}

export default function UnifiedDashboard() {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const summary = useSelector(selectDashboardSummary);
  const timeline = useSelector(selectDashboardTimeline);
  const myMentorProfile = useSelector(selectMyMentorProfile);
  const isMentor = roles?.includes("mentor");
  const isDark = useHomeTheme();
  const { t } = useLanguage();

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchDashboardTimeline());
    dispatch(fetchGamificationSummary());
    dispatch(fetchGamificationProgress());
    dispatch(fetchGamificationBadges());
    dispatch(fetchGamificationStreaks());
    dispatch(fetchGamificationTransactions({ limit: 5 }));
    if (isMentor) {
      dispatch(fetchMyMentorProfile());
    }
  }, [dispatch, isMentor]);

  const displayName = user?.profile?.firstName
    ? user.profile.firstName.charAt(0).toUpperCase() + user.profile.firstName.slice(1)
    : user?.profile?.displayName || "there";

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? t("dashboard.greeting.morning") : currentHour < 18 ? t("dashboard.greeting.afternoon") : t("dashboard.greeting.evening");

  return (
    <div className={`min-h-full w-full transition-colors duration-300 ${isDark ? "bg-background-dark" : "bg-background-light"}`}>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div
          className={`mb-8 overflow-hidden rounded-[2rem] border px-6 py-8 transition-all duration-300 md:px-8 md:py-10 ${
            isDark
              ? "border-[#30363d] bg-[#161b22] shadow-[0_24px_70px_rgba(0,0,0,0.24)]"
              : "border-[#dce4ee] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {(roles || []).map((role) => (
                  <RoleBadge key={role} role={role} isDark={isDark} t={t} />
                ))}
              </div>
              <h1 className={isDark ? "text-3xl font-bold tracking-tight text-[#e6edf3]" : "text-3xl font-bold tracking-tight text-[#162033]"}>
                {greeting}, {displayName}!
              </h1>
              <p className={isDark ? "mt-2 text-sm text-[#8b949e] sm:text-base" : "mt-2 text-sm text-[#526277] sm:text-base"}>
                {t("dashboard.atGlance")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <QuickActionPill icon="search" label={t("dashboard.quick.findMentors")} to="/mentors" color="#3fb950" isDark={isDark} />
              <QuickActionPill icon="groups" label={t("dashboard.quick.studyGroups")} to="/study-groups" color="#388bfd" isDark={isDark} />
              <QuickActionPill icon="event" label={t("dashboard.quick.events")} to="/events" color="#e3b341" isDark={isDark} />
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon="event" label={t("dashboard.stats.activeEvents")} value={summary.activeEventsCount} color="#e3b341" to="/events" isDark={isDark} />
          <StatCard icon="diversity_3" label={t("dashboard.stats.mySocieties")} value={summary.mySocietiesCount} color="#388bfd" to="/societies" isDark={isDark} />
          <StatCard icon="chat_bubble" label={t("dashboard.stats.unreadMessages")} value={summary.unreadMessagesCount} color="#3fb950" to="/messages" isDark={isDark} />
          <StatCard icon="school" label={t("dashboard.stats.availableMentors")} value={summary.availableMentorsCount} color="#f0883e" to="/mentors" isDark={isDark} />
        </div>

        <div className="mb-8">
          <GamificationDashboard compact />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StudentWidgets timeline={timeline} isDark={isDark} t={t} />

          <div className="flex flex-col gap-6">
            <RoleGuard role="mentor">
              <MentorWidgets pendingCount={summary.pendingSessionsCount} myMentorProfile={myMentorProfile} isDark={isDark} />
            </RoleGuard>

            {!isMentor && <BecomeMentorCTA isDark={isDark} t={t} />}

            <RoleGuard role="society_head">
              <SocietyHeadWidgets isDark={isDark} />
            </RoleGuard>

            <SectionCard title={t("dashboard.notes.title")} action={t("dashboard.notes.action")} actionTo="/notes" isDark={isDark}>
              <EmptyState
                icon="sticky_note_2"
                message={t("dashboard.notes.empty")}
                cta={t("dashboard.notes.cta")}
                onClick={() => navigate("/notes/create")}
                isDark={isDark}
              />
            </SectionCard>
          </div>
        </div>

        <RoleGuard role="admin">
          <div className={`mt-8 border-t pt-8 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
            <h2 className={isDark ? "mb-4 flex items-center gap-2 text-xl font-semibold text-[#e6edf3]" : "mb-4 flex items-center gap-2 text-xl font-semibold text-[#162033]"}>
              <span className="material-symbols-outlined text-[#f0883e]">admin_panel_settings</span>
              Admin Overview
            </h2>
            <AdminWidgets pendingApprovals={summary.pendingApprovalsCount} isDark={isDark} />
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}
