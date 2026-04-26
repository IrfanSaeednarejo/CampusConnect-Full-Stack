import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  fetchMySocieties,
  selectMySocieties,
  selectMemberRequests,
} from '../../redux/slices/societySlice';

/* ─── Nav item data ──────────────────────────────────────────────────────── */

const CORE_NAV = [
  { label: 'Dashboard',   to: '/dashboard', icon: 'grid_view' },
  { label: 'Feed',        to: '/feed',      icon: 'dynamic_feed' },
  { label: 'Nexus AI',   to: '/nexus',     icon: 'auto_awesome', highlight: true },
  { label: 'Tasks',       to: '/tasks',     icon: 'task_alt' },
  { label: 'Events',      to: '/events',    icon: 'event' },
  { label: 'Societies',   to: '/societies', icon: 'diversity_3' },
  { label: 'Study Groups',to: '/study-groups', icon: 'groups' },
  { label: 'Mentors',     to: '/mentors',   icon: 'school' },
  { label: 'My Sessions', to: '/my-sessions', icon: 'calendar_month' },
  { label: 'Network',     to: '/network',   icon: 'hub' },
  { label: 'Notes',       to: '/notes',     icon: 'sticky_note_2' },
  { label: 'Messages',    to: '/messages',  icon: 'chat_bubble' },
  { label: 'Notifications', to: '/notifications', icon: 'notifications' },
];

const MENTOR_NAV = [
  { label: 'Mentor Hub', to: '/mentor/dashboard', icon: 'grid_view' },
  { label: 'My Sessions', to: '/my-sessions', icon: 'schedule' },
  { label: 'Earnings', to: '/mentor/earnings', icon: 'payments' },
  { label: 'Reviews', to: '/mentor/reviews', icon: 'star' },
  { label: 'Edit Profile', to: '/mentor/profile/edit', icon: 'badge' },
];

const getSocietyNav = (id, pendingCount = 0) => [
  { label: 'Dashboard', to: `/society/${id}/manage`, icon: 'apartment' },
  { label: 'Members', to: `/society/${id}/members`, icon: 'group' },
  { label: 'Join Requests', to: `/society/${id}/member-requests`, icon: 'how_to_reg', badge: pendingCount },
  { label: 'Events', to: `/society/${id}/events`, icon: 'event_available' },
  { label: 'Analytics', to: `/society/${id}/analytics`, icon: 'bar_chart' },
  { label: 'Settings', to: `/society/${id}/settings`, icon: 'settings' },
];

const ADMIN_NAV = [
  { label: 'Users', to: '/admin/users', icon: 'manage_accounts' },
  { label: 'Campuses', to: '/admin/campuses', icon: 'domain' },
  { label: 'Approvals', to: '/admin/approvals/societies', icon: 'verified' },
  { label: 'Mentor Review', to: '/admin/approvals/mentors', icon: 'fact_check' },
  { label: 'Analytics', to: '/admin/analytics', icon: 'analytics' },
  { label: 'Moderation', to: '/admin/moderation', icon: 'gavel' },
  { label: 'System Health', to: '/admin/system', icon: 'monitor_heart' },
];

const PROFILE_NAV = [
  { label: 'Your Profile', to: '/profile/view', icon: 'account_circle' },
  { label: 'Settings', to: '/profile/account-settings', icon: 'settings' },
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
        ${
          item.highlight
            ? active
              ? 'bg-gradient-to-r from-[#238636]/30 to-[#1a7f37]/10 border border-[#3fb950]/30 text-[#3fb950]'
              : 'border border-[#3fb950]/20 text-[#3fb950] hover:bg-[#238636]/10'
            : active
              ? 'bg-[#238636]/20 text-[#3fb950]'
              : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'
        }`}
    >
      <span className={`material-symbols-outlined text-xl shrink-0 ${active ? 'text-[#3fb950]' : ''}`}>
        {item.icon}
      </span>
      {!collapsed && (
        <span className="text-sm font-medium truncate flex-1">{item.label}</span>
      )}
      {!collapsed && item.highlight && !active && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/20">AI</span>
      )}
      {!collapsed && item.badge > 0 && (
        <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/20">
          {item.badge}
        </span>
      )}
      {collapsed && item.badge > 0 && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border border-[#0d1117]" />
      )}
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

function SocietySwitcher({ societies, activeId, collapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const current = societies.find(s => s._id === activeId) || societies[0];

  if (!societies.length) return null;

  return (
    <div className="relative mx-2 mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 p-2 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-[#8b949e] transition-all
          ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={current?.media?.logo || '/default-society.png'}
            className="w-6 h-6 rounded bg-[#0d1117] object-cover shrink-0"
            alt=""
          />
          {!collapsed && (
            <span className="text-sm font-medium text-[#e6edf3] truncate">
              {current?.name || 'Select Society'}
            </span>
          )}
        </div>
        {!collapsed && (
          <span className={`material-symbols-outlined text-[#8b949e] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        )}
      </button>

      {isOpen && !collapsed && (
        <div className="absolute top-full left-0 right-0 mt-1 pb-1 bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl z-50">
          <div className="max-h-48 overflow-y-auto">
            {societies.map(soc => (
              <button
                key={soc._id}
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/society/${soc._id}/manage`);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#21262d] transition-colors
                  ${soc._id === activeId ? 'bg-[#238636]/10 text-[#3fb950]' : 'text-[#8b949e]'}`}
              >
                <img src={soc.media?.logo || '/default-society.png'} className="w-5 h-5 rounded object-cover" />
                <span className="text-xs font-medium truncate">{soc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Role-lifecycle status banners ─────────────────────────────────────── */

function MentorStatusBanner({ user, collapsed }) {
  const status = user?.mentorVerification;
  if (!status || status.isVerified) return null;
  if (collapsed) return null;
  return (
    <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-[#b08800]/10 border border-[#b08800]/30 text-[#e3b341] text-xs">
      ⏳ Apply to Become Mentor
    </div>
  );
}

function SocietyStatusBanner({ user, collapsed }) {
  const status = user?.societyHeadVerification;
  if (!status || status.isVerified) return null;
  if (collapsed) return null;
  return (
    <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-[#b08800]/10 border border-[#b08800]/30 text-[#e3b341] text-xs">
      ⏳ Society Heads are Selected By Admins
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const mySocieties = useSelector(selectMySocieties);
  const memberRequests = useSelector(selectMemberRequests);

  // Determine active society from URL
  const societyMatch = location.pathname.match(/\/society\/([^/]+)/);
  const activeSocietyId = societyMatch ? societyMatch[1] : null;

  const pendingCount = memberRequests.filter(m => m.status === 'pending').length;

  const isMentor = roles.includes('mentor');
  const isSocietyHead = roles.includes('society_head');
  const isAdmin = roles.includes('admin');

  // Filter societies where user has management permissions
  const managedSocieties = mySocieties.filter(soc => {
    if (soc.createdBy === user?._id || soc.createdBy?._id === user?._id) return true;
    const myMemberObj = soc.members?.find(m => (m.memberId === user?._id || m.memberId?._id === user?._id));
    return myMemberObj && ['society_head', 'co-coordinator', 'executive'].includes(myMemberObj.role) && myMemberObj.status === 'approved';
  });

  const hasManagementAccess = managedSocieties.length > 0;

  useEffect(() => {
    if (user?._id) dispatch(fetchMySocieties(user._id));
  }, [dispatch, user?._id]);

  // Mentor/Society pending logic
  const mentorPending = !isMentor && user?.mentorVerification &&
    !user.mentorVerification.isVerified && !user.mentorVerification.rejectedAt;

  const societyPending = !isSocietyHead && user?.societyHeadVerification &&
    !user.societyHeadVerification.isVerified && !user.societyHeadVerification.rejectedAt;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} aria-hidden="true" />
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
        <div className="hidden lg:flex items-center justify-end px-2 pt-3 pb-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-md text-[#8b949e] hover:bg-[#21262d] hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 flex flex-col gap-0.5 custom-scrollbar">

          {!collapsed && <SectionHeader label="General" collapsed={collapsed} />}
          {CORE_NAV.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}

          {(isMentor || mentorPending) && (
            <>
              <SectionHeader label="Mentor Portal" collapsed={collapsed} />
              {mentorPending
                ? <MentorStatusBanner user={user} collapsed={collapsed} />
                : MENTOR_NAV.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} />)
              }
            </>
          )}
          {!isMentor && !mentorPending && <BecomeMentorCallout collapsed={collapsed} />}

          {/* ──────  SOCIETY MANAGEMENT SECTION  ────── */}
          {(hasManagementAccess || isSocietyHead || societyPending) && (
            <>
              <SectionHeader label="Society Portal" collapsed={collapsed} />
              {societyPending ? (
                <SocietyStatusBanner user={user} collapsed={collapsed} />
              ) : (
                <>
                  {hasManagementAccess && (
                    <SocietySwitcher
                      societies={managedSocieties}
                      activeId={activeSocietyId}
                      collapsed={collapsed}
                    />
                  )}
                  {activeSocietyId ? (
                    getSocietyNav(activeSocietyId, pendingCount).map(item => (
                      <NavItem key={item.to} item={item} collapsed={collapsed} />
                    ))
                  ) : (
                    !collapsed && (
                      <p className="px-3 py-2 text-[11px] text-[#8b949e] italic leading-relaxed">
                        Select a society above to manage its members, events, and analytics.
                      </p>
                    )
                  )}
                </>
              )}
            </>
          )}
          {!isSocietyHead && !societyPending && <CreateSocietyCallout collapsed={collapsed} />}

          {isAdmin && (
            <>
              <SectionHeader label="Admin" collapsed={collapsed} />
              {ADMIN_NAV.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
            </>
          )}
        </nav>

        <div className="border-t border-[#21262d] px-2 py-2 flex flex-col gap-0.5">
          {PROFILE_NAV.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
        </div>
      </aside>
    </>
  );
}
