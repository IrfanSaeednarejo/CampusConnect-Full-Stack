import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { logoutUser } from '../../redux/slices/authSlice';
import { selectUnreadCount } from '../../redux/slices/notificationSlice';
import { selectActiveCampus } from '../../redux/slices/campusSlice';
import NotificationDropdown from './NotificationDropdown';
import { getButtonClassName } from '../common/Button';
import { useLanguage } from '../../hooks/useLanguage';

export default function GlobalNavbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = effectiveTheme === 'dark';
  const unreadCount = useSelector(selectUnreadCount);
  const activeCampus = useSelector(selectActiveCampus);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);

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
  const avatar = user?.profile?.avatar;
  const initials = displayName.slice(0, 2).toUpperCase();

  const navbarClass = isDark
      ? 'border-border-dark bg-background-dark'
      : 'border-border-light bg-background-light/95';
  const iconButtonClass = getButtonClassName({
    variant: 'icon',
    size: 'icon-sm',
    isDark,
  });
    const iconButtonActiveClass = isDark ? 'border-info/50 bg-surface-dark text-text-primary-dark' : 'border-info/30 bg-surface-light text-text-primary-light';
    const brandTextClass = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
  const campusBadgeClass = isDark
    ? 'bg-info/15 text-info'
    : 'bg-info/10 text-info';
  const searchIconClass = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';
  const searchInputClass = isDark
      ? 'border-border-dark bg-surface-dark text-text-primary-dark placeholder:text-text-secondary-dark focus:border-info'
      : 'border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light focus:border-info';
  const avatarBorderClass = isDark ? 'border-border-dark' : 'border-border-light';
  const avatarFallbackClass = isDark
      ? 'border-border-dark bg-primary text-white'
      : 'border-primary bg-primary text-white';
  const chevronClass = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';
  const menuButtonHoverClass = isDark ? 'hover:bg-[rgb(var(--color-surface-muted-dark)/1)]' : 'hover:bg-[rgb(var(--color-surface-muted-light)/1)]';
  const dropdownClass = isDark
      ? 'border-border-dark bg-surface-dark shadow-xl'
      : 'border-border-light bg-surface-light shadow-[0_18px_42px_rgba(15,23,42,0.12)]';
  const dropdownDividerClass = isDark ? 'border-border-dark' : 'border-border-light';
  const dropdownTextClass = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
  const dropdownMutedClass = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';
  const logoutClass = isDark
    ? 'text-danger hover:bg-[rgb(var(--color-surface-muted-dark)/1)]'
    : 'text-danger hover:bg-danger/5';
  const themeToggleLabel = isDark ? t('navbar.theme.light') : t('navbar.theme.dark');

  return (
    <header
      className={`sticky top-0 z-50 flex h-14 shrink-0 items-center gap-4 border-b px-4 backdrop-blur-sm ${navbarClass}`}
    >
        <button
          id="sidebar-toggle"
          onClick={onMenuToggle}
          aria-label={t("nav.main")}
          className={`lg:hidden ${iconButtonClass}`}
        >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Link
        to="/dashboard"
        className="flex shrink-0 items-center gap-2"
        aria-label="CampusNexus Dashboard"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
          CC
        </span>
        <div className="hidden items-center sm:flex">
          <span className={`text-sm font-semibold tracking-tight ${brandTextClass}`}>CampusNexus</span>
          {activeCampus && (
            <span
              className={`ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${campusBadgeClass}`}
            >
              {activeCampus.slug || 'CAMPUS'}
            </span>
          )}
        </div>
      </Link>

      <div className="hidden max-w-sm flex-1 md:flex">
        <div className="relative w-full">
          <svg
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${searchIconClass}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder={t("common.search")}
            className={`w-full rounded-md border py-1.5 pl-9 pr-4 text-sm transition-colors focus:outline-none ${searchInputClass}`}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={themeToggleLabel}
          title={themeToggleLabel}
          className={`${iconButtonClass} ${isDark ? 'hover:text-amber-300' : 'hover:text-slate-900'} transition-colors focus-visible:ring-2 focus-visible:ring-info/40`}
        >
          {isDark ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25M12 18.75V21M4.97 4.97l1.59 1.59M17.44 17.44l1.59 1.59M3 12h2.25M18.75 12H21M4.97 19.03l1.59-1.59M17.44 6.56l1.59-1.59M15.75 12A3.75 3.75 0 1 1 8.25 12a3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12.79A9 9 0 1 1 11.21 3c0 .8.1 1.58.29 2.33A7.5 7.5 0 0 0 18.67 12.5c.75.19 1.53.29 2.33.29Z"
              />
            </svg>
          )}
        </button>

        <div className="relative">
          <button
            id="notification-bell"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label={t("navbar.notifications")}
            className={`relative ${iconButtonClass} ${notifOpen ? iconButtonActiveClass : ''}`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            id="user-menu-btn"
            onClick={() => setUserMenuOpen((o) => !o)}
            aria-label={t("navbar.userMenu")}
            aria-expanded={userMenuOpen}
            className={`flex items-center gap-2 rounded-xl border px-1.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isDark
                ? `border-border-dark bg-surface-dark text-text-primary-dark ${menuButtonHoverClass} focus-visible:ring-info focus-visible:ring-offset-background-dark`
                : `border-border-light bg-surface-light text-text-primary-light shadow-[0_8px_18px_rgba(15,23,42,0.06)] ${menuButtonHoverClass} focus-visible:ring-info focus-visible:ring-offset-white`
            }`}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className={`h-8 w-8 rounded-full border object-cover ${avatarBorderClass}`}
              />
            ) : (
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${avatarFallbackClass}`}
              >
                {initials}
              </span>
            )}
            <svg
              className={`h-3.5 w-3.5 transition-transform ${chevronClass} ${userMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {userMenuOpen && (
            <div
              className={`absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border py-1 ${dropdownClass}`}
            >
              <div className={`border-b px-4 py-3 ${dropdownDividerClass}`}>
                <p className={`truncate text-sm font-medium ${dropdownTextClass}`}>{displayName}</p>
                <p className={`truncate text-xs ${dropdownMutedClass}`}>{user?.email}</p>
              </div>

              <DropdownLink to="/dashboard" onClick={() => setUserMenuOpen(false)} label={t("navbar.dashboard")} isDark={isDark} />
              <DropdownLink to="/profile/view" onClick={() => setUserMenuOpen(false)} label={t("navbar.profile")} isDark={isDark} />
              <DropdownLink
                to="/profile/account-settings"
                onClick={() => setUserMenuOpen(false)}
                label={t("navbar.settings")}
                isDark={isDark}
              />

              <div className={`mt-1 border-t pt-1 ${dropdownDividerClass}`}>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${logoutClass}`}
                >
                  {t("navbar.signOut")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownLink({ to, onClick, label, isDark }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-2 text-sm transition-colors ${
        isDark
          ? 'text-text-primary-dark hover:bg-[rgb(var(--color-surface-muted-dark)/1)] hover:text-text-primary-dark'
          : 'text-text-primary-light hover:bg-[rgb(var(--color-surface-muted-light)/1)] hover:text-text-primary-light'
      }`}
    >
      {label}
    </Link>
  );
}
