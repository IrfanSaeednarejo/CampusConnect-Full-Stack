import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

/* ─── Nav item data ──────────────────────────────────────────────────────── */

const CORE_NAV = [
  { label: 'Dashboard',    to: '/dashboard',     icon: 'grid_view' },
  { label: 'Events',       to: '/events',         icon: 'event' },
  { label: 'Societies',    to: '/societies',      icon: 'diversity_3' },
  { label: 'Study Groups', to: '/study-groups',   icon: 'groups' },
  { label: 'Mentors',      to: '/mentors',        icon: 'school' },
  { label: 'Network',      to: '/network',        icon: 'hub' },
  { label: 'Notes',        to: '/notes',          icon: 'sticky_note_2' },
  { label: 'Messages',     to: '/messages',       icon: 'chat_bubble' },
  { label: 'Notifications',to: '/notifications',  icon: 'notifications' },
];

const MENTOR_NAV = [
  { label: 'My Sessions',  to: '/mentor/sessions',   icon: 'calendar_month' },
  { label: 'My Mentees',  to: '/mentor/mentees',    icon: 'person' },
  { label: 'My Schedule', to: '/mentor/sessions',   icon: 'schedule' },
  { label: 'Earnings',    to: '/mentor/earnings',   icon: 'payments' },
  { label: 'My Profile',  to: '/mentor/display-profile', icon: 'badge' },
];

const SOCIETY_NAV = [
  { label: 'Manage Society',  to: '/society/manage',          icon: 'apartment' },
  { label: 'Members',         to: '/society/members',         icon: 'group' },
  { label: 'Join Requests',   to: '/society/member-requests', icon: 'how_to_reg' },
  { label: 'Society Events',  to: '/society/events',          icon: 'event_available' },
  { label: 'Analytics',       to: '/society/analytics',       icon: 'bar_chart' },
  { label: 'Settings',        to: '/society/settings',        icon: 'settings' },
];

const ADMIN_NAV = [
  { label: 'Users',         to: '/admin/users',               icon: 'manage_accounts' },
  { label: 'Campuses',      to: '/admin/campuses',            icon: 'domain' },
  { label: 'Approvals',     to: '/admin/approvals/societies', icon: 'verified' },
  { label: 'Mentor Review', to: '/admin/approvals/mentors',   icon: 'fact_check' },
  { label: 'Analytics',     to: '/admin/analytics',           icon: 'analytics' },
  { label: 'Moderation',    to: '/admin/moderation',          icon: 'gavel' },
  { label: 'System Health', to: '/admin/system',              icon: 'monitor_heart' },
];

const PROFILE_NAV = [
  { label: 'Your Profile', to: '/profile/view',          icon: 'account_circle' },
  { label: 'Settings',     to: '/profile/account-settings', icon: 'settings' },
];

/* ─── Helper sub-components ─────────────────────────────────────────────── */

function NavItem({ item, collapsed }) {
  const location = useLocation();
  const active = location.pathname === item.to ||
                 (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative
        ${active
          ? 'bg-[#238636]/20 text-[#3fb950]'
          : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'
        }`}
    >
      <span className={`material-symbols-outlined text-xl shrink-0 ${active ? 'text-[#3fb950]' : ''}`}>
        {item.icon}
      </span>
      {!collapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-[#30363d] text-[#e6edf3] text-xs whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {item.label}
        </span>
      )}
    </Link>
  );
}

function SectionHeader({ label, collapsed }) {
  if (collapsed) return <div className="border-t border-[#21262d] my-2" />;
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#8b949e] select-none">
      {label}
    </p>
  );
}

/* ─── Role-lifecycle status banners ─────────────────────────────────────── */

function MentorStatusBanner({ user, collapsed }) {
  const status = user?.mentorVerification;
  if (!status || status.isVerified) return null;

  if (collapsed) return null;

  return (
    <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-[#b08800]/10 border border-[#b08800]/30 text-[#e3b341] text-xs">
      ⏳ Mentor application pending admin approval.
    </div>
  );
}

function SocietyStatusBanner({ user, collapsed }) {
  const status = user?.societyHeadVerification;
  if (!status || status.isVerified) return null;

  if (collapsed) return null;

  return (
    <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-[#b08800]/10 border border-[#b08800]/30 text-[#e3b341] text-xs">
      ⏳ Society head application pending admin approval.
    </div>
  );
}

/* ─── Apply-for-role callouts ────────────────────────────────────────────── */

function BecomeMentorCallout({ collapsed }) {
  if (collapsed) return null;
  return (
    <div className="mx-3 mt-2">
      <Link
        to="/mentor/register"
        className="block px-3 py-2 border border-dashed border-[#30363d] rounded-lg text-[#8b949e] text-xs hover:border-[#238636] hover:text-[#3fb950] transition-colors"
      >
        + Become a Mentor
      </Link>
    </div>
  );
}

function CreateSocietyCallout({ collapsed }) {
  if (collapsed) return null;
  return (
    <div className="mx-3 mt-2">
      <Link
        to="/society/create"
        className="block px-3 py-2 border border-dashed border-[#30363d] rounded-lg text-[#8b949e] text-xs hover:border-[#238636] hover:text-[#3fb950] transition-colors"
      >
        + Create a Society
      </Link>
    </div>
  );
}

/* ─── Main Sidebar ───────────────────────────────────────────────────────── */

export default function AppSidebar({ open, onClose }) {
  const { user, roles } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isMentor      = roles.includes('mentor');
  const isSocietyHead = roles.includes('society_head');
  const isAdmin       = roles.includes('admin');

  // Mentor applied but not yet verified
  const mentorPending = !isMentor && user?.mentorVerification &&
    !user.mentorVerification.isVerified && !user.mentorVerification.rejectedAt;

  // Society head applied but not yet verified
  const societyPending = !isSocietyHead && user?.societyHeadVerification &&
    !user.societyHeadVerification.isVerified && !user.societyHeadVerification.rejectedAt;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex flex-col bg-[#0d1117] border-r border-[#21262d]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[60px]' : 'w-64'}
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-end px-2 pt-3 pb-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-md text-[#8b949e] hover:bg-[#21262d] hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Scrollable nav area */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 flex flex-col gap-0.5">

          {/* ── Core Nav ─────────────────────── */}
          {!collapsed && <SectionHeader label="General" collapsed={collapsed} />}
          {CORE_NAV.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}

          {/* ── Mentor Section ───────────────── */}
          {(isMentor || mentorPending) && (
            <>
              <SectionHeader label="Mentor HQ" collapsed={collapsed} />
              {mentorPending
                ? <MentorStatusBanner user={user} collapsed={collapsed} />
                : MENTOR_NAV.map((item) => (
                    <NavItem key={item.to} item={item} collapsed={collapsed} />
                  ))
              }
            </>
          )}
          {!isMentor && !mentorPending && (
            <BecomeMentorCallout collapsed={collapsed} />
          )}

          {/* ── Society Head Section ─────────── */}
          {(isSocietyHead || societyPending) && (
            <>
              <SectionHeader label="Society HQ" collapsed={collapsed} />
              {societyPending
                ? <SocietyStatusBanner user={user} collapsed={collapsed} />
                : SOCIETY_NAV.map((item) => (
                    <NavItem key={item.to} item={item} collapsed={collapsed} />
                  ))
              }
            </>
          )}
          {!isSocietyHead && !societyPending && (
            <CreateSocietyCallout collapsed={collapsed} />
          )}

          {/* ── Admin Section ────────────────── */}
          {isAdmin && (
            <>
              <SectionHeader label="Admin" collapsed={collapsed} />
              {ADMIN_NAV.map((item) => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </>
          )}
        </nav>

        {/* ── Profile footer ───────────────────────── */}
        <div className="border-t border-[#21262d] px-2 py-2 flex flex-col gap-0.5">
          {PROFILE_NAV.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>
      </aside>
    </>
  );
}
