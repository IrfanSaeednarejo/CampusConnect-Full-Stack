import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext.jsx";
import useHomeTheme from "@/hooks/useHomeTheme";
import {
  fetchMySocieties,
  selectMySocieties,
  selectMemberRequests,
} from "../../redux/slices/societySlice";
import { selectUnreadCount } from "../../redux/slices/notificationSlice";
import { selectUnreadByConversation } from "../../redux/slices/chatSlice";
import { useLanguage } from "../../hooks/useLanguage";

const CORE_NAV = [
  { labelKey: "nav.dashboard", to: "/dashboard", icon: "grid_view" },
  { labelKey: "nav.feed", to: "/feed", icon: "dynamic_feed" },
  { labelKey: "nav.nexus", to: "/nexus", icon: "auto_awesome", highlight: true },
  { labelKey: "nav.tasks", to: "/tasks", icon: "task_alt" },
  { labelKey: "nav.events", to: "/events", icon: "event" },
  { labelKey: "nav.societies", to: "/societies", icon: "diversity_3" },
  { labelKey: "nav.studyGroups", to: "/study-groups", icon: "groups" },
  { labelKey: "nav.mentors", to: "/mentors", icon: "school" },
  { labelKey: "nav.mySessions", to: "/my-sessions", icon: "calendar_month" },
  { labelKey: "nav.network", to: "/network", icon: "hub" },
  { labelKey: "nav.notes", to: "/notes", icon: "sticky_note_2" },
  { labelKey: "nav.rewards", to: "/dashboard#rewards", icon: "workspace_premium" },
  { labelKey: "nav.messages", to: "/messages", icon: "chat_bubble" },
  { labelKey: "nav.notifications", to: "/notifications", icon: "notifications" },
];

const MENTOR_NAV = [
  { labelKey: "nav.mentorHub", to: "/mentor/dashboard", icon: "grid_view" },
  { labelKey: "nav.mySessions", to: "/my-sessions", icon: "schedule" },
  { labelKey: "nav.earnings", to: "/mentor/earnings", icon: "payments" },
  { labelKey: "nav.reviews", to: "/mentor/reviews", icon: "star" },
  { labelKey: "nav.editProfile", to: "/mentor/profile/edit", icon: "badge" },
];

const getSocietyNav = (id, pendingCount = 0) => [
  { labelKey: "nav.dashboard", to: `/society/${id}/manage`, icon: "apartment" },
  { labelKey: "nav.members", to: `/society/${id}/members`, icon: "group" },
  {
    labelKey: "nav.joinRequests",
    to: `/society/${id}/member-requests`,
    icon: "how_to_reg",
    badge: pendingCount,
  },
  { labelKey: "nav.events", to: `/society/${id}/events`, icon: "event_available" },
  { labelKey: "nav.analytics", to: `/society/${id}/analytics`, icon: "bar_chart" },
  { labelKey: "nav.settings", to: `/society/${id}/settings`, icon: "settings" },
];

const ADMIN_NAV = [
  { label: "Users", to: "/admin/users", icon: "manage_accounts" },
  { label: "Campuses", to: "/admin/campuses", icon: "domain" },
  { label: "Approvals", to: "/admin/approvals/societies", icon: "verified" },
  { label: "Mentor Review", to: "/admin/approvals/mentors", icon: "fact_check" },
  { label: "Analytics", to: "/admin/analytics", icon: "analytics" },
  { label: "Moderation", to: "/admin/moderation", icon: "gavel" },
  { label: "System Health", to: "/admin/system", icon: "monitor_heart" },
];

const PROFILE_NAV = [
  { labelKey: "nav.yourProfile", to: "/profile/view", icon: "account_circle" },
  { labelKey: "nav.settings", to: "/profile/account-settings", icon: "settings" },
];

function getDisplayName(user, t) {
  return (
    user?.profile?.displayName ||
    [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    t("nav.studentFallback")
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CN";
}

function getSidebarTheme(isDark) {
  return {
    shell: isDark
      ? "bg-background-dark text-text-primary-dark"
      : "bg-background-light text-text-primary-light",
    frame: isDark
      ? "border-border-dark bg-background-dark shadow-[0_20px_48px_rgba(0,0,0,0.24)]"
      : "border-border-light bg-surface-light shadow-[0_20px_48px_rgba(15,23,42,0.08)]",
    sectionLabel: isDark ? "text-text-secondary-dark" : "text-text-secondary-light",
    helper: isDark ? "text-text-secondary-dark" : "text-text-secondary-light",
    text: isDark ? "text-text-primary-dark" : "text-text-primary-light",
    icon: isDark ? "text-text-secondary-dark" : "text-text-secondary-light",
    iconHover: isDark ? "group-hover:text-text-primary-dark" : "group-hover:text-text-primary-light",
    divider: isDark ? "border-border-dark" : "border-border-light",
    tooltip: isDark
      ? "border-border-dark bg-surface-dark text-text-primary-dark"
      : "border-border-light bg-surface-light text-text-primary-light shadow-[0_10px_24px_rgba(15,23,42,0.10)]",
    active: isDark
      ? "border-border-dark bg-surface-dark text-text-primary-dark"
      : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)] text-text-primary-light",
    inactive: isDark
      ? "border-transparent text-text-secondary-dark hover:border-border-dark hover:bg-surface-dark hover:text-text-primary-dark"
      : "border-transparent text-text-secondary-light hover:border-border-light hover:bg-[rgb(var(--color-surface-muted-light)/1)] hover:text-text-primary-light",
    activeAccent: isDark ? "text-info" : "text-info",
    highlightActive: isDark
      ? "border-info/30 bg-info/10 text-info"
      : "border-info/20 bg-info/10 text-info",
    highlightInactive: isDark
      ? "border-info/20 text-info hover:bg-info/10"
      : "border-info/20 text-info hover:bg-info/10",
    badgeGreen: isDark
      ? "border-info/20 bg-info/10 text-info"
      : "border-info/20 bg-info/10 text-info",
    badgeAmber: isDark
      ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
      : "border-amber-200 bg-amber-50 text-amber-700",
    pending: isDark
      ? "border-warning/30 bg-warning/10 text-warning"
      : "border-amber-200 bg-amber-50 text-amber-700",
    callout: isDark
      ? "border-border-dark bg-surface-dark text-text-secondary-dark hover:border-info/40 hover:text-info"
      : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)] text-text-secondary-light hover:border-slate-300 hover:bg-surface-light hover:text-text-primary-light",
    switcherButton: isDark
      ? "border-border-dark bg-surface-dark hover:border-slate-500"
      : "border-border-light bg-surface-light hover:border-slate-300",
    switcherText: isDark ? "text-text-primary-dark" : "text-text-primary-light",
    switcherMenu: isDark
      ? "border-border-dark bg-surface-dark"
      : "border-border-light bg-surface-light shadow-[0_14px_32px_rgba(15,23,42,0.10)]",
    switcherItem: isDark ? "hover:bg-[rgb(var(--color-surface-muted-dark)/1)]" : "hover:bg-[rgb(var(--color-surface-muted-light)/1)]",
    switcherItemActive: isDark
      ? "bg-info/10 text-info"
      : "bg-info/10 text-info",
    switcherItemIdle: isDark ? "text-text-secondary-dark" : "text-text-secondary-light",
    profileCard: isDark
      ? "border-border-dark bg-surface-dark"
      : "border-border-light bg-surface-light",
    profileAvatar: isDark
      ? "border-info/30 bg-info/10 text-info"
      : "border-info/20 bg-info/10 text-info",
  };
}

function getNavItemClasses(theme, item, active) {
  if (item.highlight) {
    return active ? theme.highlightActive : theme.highlightInactive;
  }

  return active ? theme.active : theme.inactive;
}

function NavItem({ item, collapsed, theme, isDark, t }) {
  const location = useLocation();
  const active =
    location.pathname === item.to ||
    (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
  const label = item.labelKey ? t(item.labelKey) : item.label;

  return (
    <Link
      to={item.to}
      title={collapsed ? label : undefined}
      className={`group relative flex items-center rounded-2xl border text-sm font-medium transition-all duration-200 ${
        collapsed ? "mx-auto h-12 w-12 justify-center rounded-xl p-0" : "gap-3 px-3.5 py-3"
      } ${getNavItemClasses(theme, item, active)}`}
    >
      <span
        className={`material-symbols-outlined shrink-0 leading-none ${collapsed ? "text-[22px]" : "text-xl"} ${
          active ? theme.activeAccent : `${theme.icon} ${theme.iconHover}`
        }`}
      >
        {item.icon}
      </span>

      {!collapsed && <span className="flex-1 truncate">{label}</span>}

      {!collapsed && item.highlight && !active && (
        <span
          className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${
            isDark
          ? "border-primary/20 bg-primary/10 text-primary"
              : "border-info/20 bg-info/10 text-info"
          }`}
        >
          AI
        </span>
      )}

      {!collapsed && item.badge > 0 && (
        <span
          className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${
            item.badgeClasses || theme.badgeAmber
          }`}
        >
          {item.badge}
        </span>
      )}

      {collapsed && item.badge > 0 && (
        <div
          className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full border ${
            isDark ? "border-background-dark" : "border-white"
          } ${item.badgeDot || "bg-amber-500"}`}
        />
      )}

      {collapsed && (
        <span
          className={`pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 ${theme.tooltip}`}
        >
          {label}
        </span>
      )}
    </Link>
  );
}

function SectionHeader({ label, collapsed, theme }) {
  if (collapsed) {
    return <div className={`mx-2 my-4 border-t ${theme.divider}`} />;
  }

  return (
    <p className={`select-none px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] ${theme.sectionLabel}`}>
      {label}
    </p>
  );
}

function SocietySwitcher({ societies, activeId, collapsed, theme, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const current = societies.find((s) => s._id === activeId) || societies[0];

  if (!societies.length) return null;

  return (
    <div className="relative mx-2 mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center gap-2 rounded-xl border p-2.5 transition-all ${theme.switcherButton} ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={current?.media?.logo || "/default-society.png"}
            className="h-7 w-7 shrink-0 rounded-lg object-cover"
            alt=""
          />
          {!collapsed && (
            <span className={`truncate text-sm font-medium ${theme.switcherText}`}>
              {current?.name || t("nav.selectSociety")}
            </span>
          )}
        </div>
        {!collapsed && (
          <span
            className={`material-symbols-outlined ${theme.helper} transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        )}
      </button>

      {isOpen && !collapsed && (
        <div className={`absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border p-1 ${theme.switcherMenu}`}>
          <div className="max-h-48 overflow-y-auto">
            {societies.map((soc) => (
              <button
                key={soc._id}
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/society/${soc._id}/manage`);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  soc._id === activeId
                    ? theme.switcherItemActive
                    : `${theme.switcherItemIdle} ${theme.switcherItem}`
                }`}
              >
                <img
                  src={soc.media?.logo || "/default-society.png"}
                  className="h-5 w-5 rounded object-cover"
                  alt=""
                />
                <span className="truncate text-xs font-medium">{soc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MentorStatusBanner({ user, collapsed, theme, t }) {
  const status = user?.mentorVerification;
  if (!status || status.isVerified || collapsed) return null;

  return (
    <div className={`mx-3 mt-2 rounded-xl border px-3 py-2 text-xs ${theme.pending}`}>
      {t("nav.applyMentor")}
    </div>
  );
}

function SocietyStatusBanner({ user, collapsed, theme, t }) {
  const status = user?.societyHeadVerification;
  if (!status || status.isVerified || collapsed) return null;

  return (
    <div className={`mx-3 mt-2 rounded-xl border px-3 py-2 text-xs ${theme.pending}`}>
      {t("nav.societyHeadsSelected")}
    </div>
  );
}

function BecomeMentorCallout({ collapsed, theme, t }) {
  if (collapsed) return null;

  return (
    <div className="mx-3 mt-2">
      <Link
        to="/mentor/register"
        className={`block rounded-xl border border-dashed px-3 py-2 text-xs transition-colors ${theme.callout}`}
      >
        {t("nav.becomeMentor")}
      </Link>
    </div>
  );
}

function CreateSocietyCallout({ collapsed, theme, t }) {
  if (collapsed) return null;

  return (
    <div className="mx-3 mt-2">
      <Link
        to="/society/create"
        className={`block rounded-xl border border-dashed px-3 py-2 text-xs transition-colors ${theme.callout}`}
      >
        {t("nav.createSociety")}
      </Link>
    </div>
  );
}

export default function AppSidebar({ open, onClose }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, roles } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isDark = useHomeTheme();
  const { t } = useLanguage();
  const theme = getSidebarTheme(isDark);
  const mySocieties = useSelector(selectMySocieties);
  const memberRequests = useSelector(selectMemberRequests);
  const unreadNotificationsCount = useSelector(selectUnreadCount) || 0;
  const unreadByConversation = useSelector(selectUnreadByConversation) || {};
  const unreadChatsCount = Object.values(unreadByConversation).reduce(
    (acc, curr) => acc + (Number(curr) || 0),
    0
  );

  const societyMatch = location.pathname.match(/\/society\/([^/]+)/);
  const activeSocietyId = societyMatch ? societyMatch[1] : null;
  const pendingCount = memberRequests.filter((m) => m.status === "pending").length;
  const isMentor = roles.includes("mentor");
  const isSocietyHead = roles.includes("society_head");
  const isAdmin = roles.includes("admin");

  const managedSocieties = mySocieties.filter((soc) => {
    if (soc.createdBy === user?._id || soc.createdBy?._id === user?._id) return true;
    const myMemberObj = soc.members?.find(
      (m) => m.memberId === user?._id || m.memberId?._id === user?._id
    );
    return (
      myMemberObj &&
      ["society_head", "co-coordinator", "executive"].includes(myMemberObj.role) &&
      myMemberObj.status === "approved"
    );
  });

  const hasManagementAccess = managedSocieties.length > 0;

  useEffect(() => {
    if (user?._id) dispatch(fetchMySocieties(user._id));
  }, [dispatch, user?._id]);

  const mentorPending =
    !isMentor &&
    user?.mentorVerification &&
    !user.mentorVerification.isVerified &&
    !user.mentorVerification.rejectedAt;

  const societyPending =
    !isSocietyHead &&
    user?.societyHeadVerification &&
    !user.societyHeadVerification.isVerified &&
    !user.societyHeadVerification.rejectedAt;

  const displayName = getDisplayName(user, t);
  const initials = getInitials(displayName);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <style>
        {`
          .app-sidebar-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .app-sidebar-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-[320px]"}
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:z-auto lg:translate-x-0 lg:p-4
          ${collapsed ? "bg-transparent" : theme.shell}
        `}
      >
        <div
          className={`flex h-full flex-col py-3 ${
            collapsed
              ? "border-0 bg-transparent px-0 shadow-none"
              : `border px-3 lg:rounded-[30px] ${theme.frame}`
          }`}
        >
          <div className={`flex items-center ${collapsed ? "justify-center" : "justify-end"} px-2 pb-4 pt-1`}>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className={`hidden lg:flex items-center justify-center border transition-colors ${
                collapsed ? "h-10 w-10 rounded-xl" : "h-12 w-12 rounded-2xl"
              } ${theme.switcherButton} ${
                isDark
                  ? "text-text-secondary-dark hover:bg-[rgb(var(--color-surface-muted-dark)/1)] hover:text-text-primary-dark"
                  : "text-text-secondary-light hover:bg-surface-light hover:text-text-primary-light"
              }`}
            >
              <svg
                className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className={`app-sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden pb-3 ${collapsed ? "px-0" : "px-1"}`}>
            <div className="flex flex-col">
              {!collapsed && <SectionHeader label={t("nav.main")} collapsed={collapsed} theme={theme} />}
              <nav className={`flex flex-col gap-2 ${collapsed ? "items-center px-0" : "px-1"}`}>
                {CORE_NAV.map((item) => {
                  let badge = item.badge;
                  let badgeClasses = theme.badgeAmber;
                  let badgeDot = "bg-amber-500";

                  if (item.to === "/notifications" && unreadNotificationsCount > 0) {
                    badge = unreadNotificationsCount;
                    badgeClasses = theme.badgeGreen;
                    badgeDot = "bg-info";
                  } else if (item.to === "/messages" && unreadChatsCount > 0) {
                    badge = unreadChatsCount;
                    badgeClasses = theme.badgeGreen;
                    badgeDot = "bg-info";
                  }

                  return (
                    <NavItem
                      key={item.to}
                      item={{ ...item, badge, badgeClasses, badgeDot }}
                      collapsed={collapsed}
                      theme={theme}
                      isDark={isDark}
                      t={t}
                    />
                  );
                })}
              </nav>

              {(isMentor || mentorPending) && (
                <>
                  <SectionHeader label={t("nav.mentorPortal")} collapsed={collapsed} theme={theme} />
                  <div className={`flex flex-col gap-2 ${collapsed ? "items-center px-0" : "px-1"}`}>
                    {mentorPending ? (
                      <MentorStatusBanner user={user} collapsed={collapsed} theme={theme} t={t} />
                    ) : (
                      MENTOR_NAV.map((item) => (
                        <NavItem
                          key={item.to}
                          item={item}
                          collapsed={collapsed}
                          theme={theme}
                          isDark={isDark}
                          t={t}
                        />
                      ))
                    )}
                  </div>
                </>
              )}

              {!isMentor && !mentorPending && (
                <div className="px-1">
                  <BecomeMentorCallout collapsed={collapsed} theme={theme} t={t} />
                </div>
              )}

              {(hasManagementAccess || isSocietyHead || societyPending) && (
                <>
                  <SectionHeader label={t("nav.societyPortal")} collapsed={collapsed} theme={theme} />
                  <div className={`flex flex-col gap-2 ${collapsed ? "items-center px-0" : "px-1"}`}>
                    {societyPending ? (
                      <SocietyStatusBanner user={user} collapsed={collapsed} theme={theme} t={t} />
                    ) : (
                      <>
                        {hasManagementAccess && (
                          <SocietySwitcher
                            societies={managedSocieties}
                            activeId={activeSocietyId}
                            collapsed={collapsed}
                            theme={theme}
                            t={t}
                          />
                        )}
                        {activeSocietyId ? (
                          <div className="flex flex-col gap-2">
                            {getSocietyNav(activeSocietyId, pendingCount).map((item) => (
                              <NavItem
                                key={item.to}
                                item={item}
                                collapsed={collapsed}
                                theme={theme}
                                isDark={isDark}
                                t={t}
                              />
                            ))}
                          </div>
                        ) : (
                          !collapsed && (
                            <p className={`px-4 py-2 text-[11px] italic leading-relaxed ${theme.helper}`}>
                              {t("nav.selectSocietyHint")}
                            </p>
                          )
                        )}
                      </>
                    )}
                  </div>
                </>
              )}

              {!isSocietyHead && !societyPending && (
                <div className="px-1">
                  <CreateSocietyCallout collapsed={collapsed} theme={theme} t={t} />
                </div>
              )}

              {isAdmin && (
                <>
                  <SectionHeader label="Admin" collapsed={collapsed} theme={theme} />
                  <div className={`flex flex-col gap-2 ${collapsed ? "items-center px-0" : "px-1"}`}>
                    {ADMIN_NAV.map((item) => (
                      <NavItem
                        key={item.to}
                        item={item}
                        collapsed={collapsed}
                        theme={theme}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={`mt-auto ${collapsed ? "border-t px-0 pt-3" : `border-t px-1 pt-4 ${theme.divider}`}`}>
            {!collapsed && <SectionHeader label={t("nav.account")} collapsed={collapsed} theme={theme} />}
            <nav className={`flex flex-col gap-2 ${collapsed ? "items-center px-0" : "px-1"}`}>
              {PROFILE_NAV.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  theme={theme}
                  isDark={isDark}
                  t={t}
                />
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
