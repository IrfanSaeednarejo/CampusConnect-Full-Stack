import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * MobileBottomNav — fixed bottom navigation bar for mobile screens.
 * Shows 5 key navigation items. Only visible below `lg` breakpoint.
 */

const NAV_ITEMS = [
  { path: '/student/dashboard', label: 'Home', icon: 'dashboard' },
  { path: '/student/events', label: 'Events', icon: 'calendar_month' },
  { path: '/student/messages', label: 'Chat', icon: 'chat' },
  { path: '/student/societies', label: 'Clubs', icon: 'diversity_3' },
  { path: '/profile/view', label: 'Profile', icon: 'person' },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1 rounded-lg transition-colors ${isActive
                  ? 'text-primary'
                  : 'text-text-secondary active:text-text-primary'
                }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${isActive ? 'text-primary' : ''
                  }`}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
