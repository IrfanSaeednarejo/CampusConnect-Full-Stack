import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import RoleGuard from '../../routes/RoleGuard.jsx';

/* ─── Shared utility components ─────────────────────────────────────── */

function StatCard({ icon, label, value, color = '#238636', to }) {
  const content = (
    <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 flex items-center gap-4 hover:border-[#30363d] transition-colors">
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 text-xl"
        style={{ background: `${color}18` }}
      >
        <span className="material-symbols-outlined" style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-[#8b949e] text-xs font-medium">{label}</p>
        <p className="text-[#e6edf3] text-2xl font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function SectionCard({ title, action, actionTo, children }) {
  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
        <h2 className="text-[#e6edf3] text-base font-semibold">{title}</h2>
        {action && actionTo && (
          <Link to={actionTo} className="text-[#3fb950] text-sm hover:underline">
            {action}
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState({ icon, message, cta, onClick }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="material-symbols-outlined text-4xl text-[#3d444d]">{icon}</span>
      <p className="text-[#8b949e] text-sm">{message}</p>
      {cta && (
        <button
          onClick={onClick}
          className="px-4 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors"
        >
          {cta}
        </button>
      )}
    </div>
  );
}

function QuickActionPill({ icon, label, to, color }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#30363d] text-sm text-[#c9d1d9] hover:border-[#3fb950] hover:text-[#3fb950] transition-colors bg-[#0d1117]"
    >
      <span className="material-symbols-outlined text-base" style={{ color }}>{icon}</span>
      {label}
    </Link>
  );
}

/* ─── Role-specific widget panels ───────────────────────────────────── */

function StudentWidgets() {
  const navigate = useNavigate();
  return (
    <>
      <SectionCard title="Upcoming Events" action="View all" actionTo="/events">
        <EmptyState icon="event" message="No upcoming events. Explore what's happening on campus." cta="Browse Events" onClick={() => navigate('/events')} />
      </SectionCard>

      <SectionCard title="My Societies" action="View all" actionTo="/societies">
        <EmptyState icon="diversity_3" message="You haven't joined any societies yet." cta="Explore Societies" onClick={() => navigate('/societies')} />
      </SectionCard>
    </>
  );
}

function MentorWidgets() {
  const navigate = useNavigate();
  return (
    <>
      <SectionCard title="Pending Session Requests">
        <EmptyState icon="calendar_month" message="No pending session requests." cta="Set Availability" onClick={() => navigate('/mentor/availability')} />
      </SectionCard>

      <SectionCard title="My Mentoring Sessions">
        <EmptyState icon="group" message="No sessions yet." cta="View Sessions" onClick={() => navigate('/mentor/sessions')} />
      </SectionCard>
    </>
  );
}

function SocietyHeadWidgets() {
  const navigate = useNavigate();
  return (
    <>
      <SectionCard title="Member Join Requests">
        <EmptyState icon="how_to_reg" message="No pending member requests." cta="Manage Members" onClick={() => navigate('/society/member-requests')} />
      </SectionCard>

      <SectionCard title="Upcoming Society Events">
        <EmptyState icon="event_available" message="No events scheduled." cta="Create Event" onClick={() => navigate('/events/create')} />
      </SectionCard>
    </>
  );
}

function AdminWidgets() {
  const navigate = useNavigate();
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="pending_actions" label="Society Approvals" value="—" color="#e3b341" to="/admin/approvals/societies" />
        <StatCard icon="fact_check"     label="Mentor Reviews"    value="—" color="#388bfd" to="/admin/approvals/mentors" />
        <StatCard icon="group"          label="Total Users"       value="—" color="#3fb950" to="/admin/users" />
      </div>
      <div className="mt-4">
        <SectionCard title="Quick Admin Actions">
          <div className="flex flex-wrap gap-2">
            <QuickActionPill icon="manage_accounts" label="Users"     to="/admin/users"               color="#3fb950" />
            <QuickActionPill icon="domain"          label="Campuses"  to="/admin/campuses"            color="#3fb950" />
            <QuickActionPill icon="monitor_heart"   label="System"    to="/admin/system"              color="#e3b341" />
            <QuickActionPill icon="analytics"       label="Analytics" to="/admin/analytics"           color="#388bfd" />
          </div>
        </SectionCard>
      </div>
    </>
  );
}

/* ─── Role badge pill ────────────────────────────────────────────────── */

const ROLE_META = {
  student:      { label: 'Student',      color: '#388bfd', bg: '#388bfd18' },
  mentor:       { label: 'Mentor',       color: '#3fb950', bg: '#3fb95018' },
  society_head: { label: 'Society Head', color: '#e3b341', bg: '#e3b34118' },
  admin:        { label: 'Admin',        color: '#f0883e', bg: '#f0883e18' },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role, color: '#8b949e', bg: '#8b949e18' };
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center"
      style={{ color: meta.color, background: meta.bg }}
    >
      {meta.label}
    </span>
  );
}

/* ─── Main Unified Dashboard ─────────────────────────────────────────── */

export default function UnifiedDashboard() {
  const { user, roles } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.profile?.firstName
    ? user.profile.firstName.charAt(0).toUpperCase() + user.profile.firstName.slice(1)
    : user?.profile?.displayName || 'there';

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' :
    currentHour < 18 ? 'Good afternoon' :
                       'Good evening';

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">

      {/* ── Welcome Banner ────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[#e6edf3] text-3xl font-bold tracking-tight">
              {greeting}, {displayName}! 👋
            </h1>
            <p className="text-[#8b949e] mt-1 text-sm">
              Here's your campus at a glance.
            </p>
            {/* Role badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {roles.map((r) => <RoleBadge key={r} role={r} />)}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <QuickActionPill icon="search" label="Find Mentors" to="/mentors" color="#3fb950" />
            <QuickActionPill icon="groups" label="Study Groups" to="/study-groups" color="#388bfd" />
            <QuickActionPill icon="event" label="Events" to="/events" color="#e3b341" />
          </div>
        </div>
      </div>

      {/* ── Global Stats Row ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="event"        label="Active Events"    value="—" color="#e3b341" to="/events" />
        <StatCard icon="diversity_3"  label="My Societies"     value="—" color="#388bfd" to="/societies" />
        <StatCard icon="chat_bubble"  label="Unread Messages"  value="—" color="#3fb950" to="/messages" />
        <StatCard icon="school"       label="Available Mentors" value="—" color="#f0883e" to="/mentors" />
      </div>

      {/* ── Role-specific widget columns ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Always show student widgets for all users (student features are universal) */}
        <StudentWidgets />

        {/* Extra column: mentor or society head widgets */}
        <div className="flex flex-col gap-6">

          <RoleGuard role="mentor">
            <MentorWidgets />
          </RoleGuard>

          <RoleGuard role="society_head">
            <SocietyHeadWidgets />
          </RoleGuard>

          {/* Messages / Notifications teaser for everyone */}
          <SectionCard title="My Notes" action="View all" actionTo="/notes">
            <EmptyState
              icon="sticky_note_2"
              message="You have no notes yet."
              cta="Create Note"
              onClick={() => navigate('/notes/create')}
            />
          </SectionCard>
        </div>
      </div>

      {/* ── Admin section (full width) ────────────── */}
      <RoleGuard role="admin">
        <div className="mt-8 border-t border-[#21262d] pt-8">
          <h2 className="text-[#e6edf3] text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f0883e]">admin_panel_settings</span>
            Admin Overview
          </h2>
          <AdminWidgets />
        </div>
      </RoleGuard>

    </div>
  );
}
