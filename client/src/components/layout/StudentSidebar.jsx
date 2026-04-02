import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUnreadCount } from '../../redux/slices/notificationsSlice';

/**
 * StudentSidebar — shared sidebar component for all student pages.
 * Highlights the current page's link automatically via useLocation().
 * Hidden on mobile (< lg), visible as a fixed/sticky sidebar on desktop.
 * Now collapsible to save screen space (AI model style).
 */

const NAV_ITEMS = [
  { path: '/student/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/student/events', label: 'Events', icon: 'calendar_month' },
  { path: '/student/notifications', label: 'Notifications', icon: 'notifications', showBadge: true },
  { path: '/student/book-mentor', label: 'Mentors', icon: 'groups' },
  { path: '/student/societies', label: 'Societies', icon: 'diversity_3' },
  { path: '/student/sessions', label: 'Sessions', icon: 'event_available' },
  { path: '/student/messages', label: 'Messages', icon: 'chat' },
  { path: '/student/tasks', label: 'Tasks', icon: 'task_alt' },
  { path: '/academics/notes', label: 'Notes', icon: 'description' },
  { path: '/student/academic-network', label: 'Network', icon: 'hub' },
];

export default function StudentSidebar() {
  const location = useLocation();
  const unreadCount = useSelector(selectUnreadCount);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside 
      className={`hidden lg:flex flex-col p-4 text-text-primary shrink-0 border-r border-[#21262d] sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto transition-all duration-300 ease-in-out glass backdrop-blur-xl ${
        isExpanded ? 'w-64' : 'w-[72px] items-center'
      }`}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Header Area with Toggle */}
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} px-1 pt-2`}>
          {isExpanded && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">CC</div>
              <h1 className="text-white text-lg font-semibold truncate tracking-tight">CampusConnect</h1>
            </div>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-md hover:bg-surface-hover transition-colors flex items-center justify-center shrink-0"
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isExpanded ? "left_panel_close" : "left_panel_open"}
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 w-full">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isExpanded ? item.label : undefined}
                className={`group relative flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-0 w-10 h-10 mx-auto'} py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-surface-hover' : 'hover:bg-surface-hover'
                }`}
              >
                <div className={`flex items-center gap-3 ${isExpanded ? 'overflow-hidden' : 'justify-center w-full'}`}>
                  <span className={`material-symbols-outlined text-xl shrink-0 ${isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                    {item.icon}
                  </span>
                  {isExpanded && (
                    <span className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-white' : 'text-text-primary group-hover:text-white'}`}>
                      {item.label}
                    </span>
                  )}
                </div>
                {/* Notification Badge */}
                {item.showBadge && unreadCount > 0 && (
                  <span className={`flex items-center justify-center font-semibold text-white bg-primary rounded-full shrink-0 ${
                    isExpanded ? 'min-w-[20px] h-5 px-1.5 text-xs' : 'absolute top-1 right-1 w-2.5 h-2.5 text-[0px]'
                  }`}>
                    {isExpanded ? unreadCount : ''}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
