import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { logoutUser } from '../../redux/slices/authSlice';
import { selectUnreadCount } from '../../redux/slices/notificationSlice';

/**
 * GlobalNavbar — top navigation bar for all authenticated pages.
 * Renders logo, global search, notification bell, and user avatar menu.
 */
export default function GlobalNavbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const unreadCount = useSelector(selectUnreadCount);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const displayName = user?.profile?.displayName || user?.profile?.firstName || 'You';
  const avatar      = user?.profile?.avatar;
  const initials    = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 bg-[#0d1117] border-b border-[#21262d] flex items-center px-4 gap-4 sticky top-0 z-50 shrink-0">

      {/* ── Hamburger (mobile sidebar toggle) ─────── */}
      <button
        id="sidebar-toggle"
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
        className="lg:hidden p-2 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Logo ──────────────────────────────────── */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 shrink-0"
        aria-label="CampusConnect Dashboard"
      >
        <span className="w-7 h-7 rounded-md bg-[#238636] flex items-center justify-center text-white font-bold text-sm">
          CC
        </span>
        <span className="hidden sm:block text-[#e6edf3] font-semibold text-sm tracking-tight">
          CampusConnect
        </span>
      </Link>

      {/* ── Global Search ─────────────────────────── */}
      <div className="flex-1 max-w-sm hidden md:flex">
        <div className="w-full relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search…"
            className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-4 py-1.5 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#388bfd] transition-colors"
          />
        </div>
      </div>

      {/* ── Right Side Actions ────────────────────── */}
      <div className="ml-auto flex items-center gap-2">

        {/* Notification Bell */}
        <Link
          to="/notifications"
          id="notification-bell"
          aria-label="Notifications"
          className="relative p-2 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#da3633] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            id="user-menu-btn"
            onClick={() => setUserMenuOpen((o) => !o)}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-[#21262d] transition-colors"
          >
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-[#30363d]"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center text-white text-xs font-bold border border-[#30363d]">
                {initials}
              </span>
            )}
            <svg
              className={`w-3.5 h-3.5 text-[#8b949e] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl z-50 py-1 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-[#21262d]">
                <p className="text-[#e6edf3] text-sm font-medium truncate">{displayName}</p>
                <p className="text-[#8b949e] text-xs truncate">{user?.email}</p>
              </div>

              <DropdownLink to="/dashboard"         onClick={() => setUserMenuOpen(false)} label="Dashboard" />
              <DropdownLink to="/profile/view"      onClick={() => setUserMenuOpen(false)} label="Your profile" />
              <DropdownLink to="/profile/account-settings" onClick={() => setUserMenuOpen(false)} label="Settings" />

              <div className="border-t border-[#21262d] mt-1 pt-1">
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-[#f85149] hover:bg-[#21262d] transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownLink({ to, onClick, label }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] hover:text-white transition-colors"
    >
      {label}
    </Link>
  );
}
