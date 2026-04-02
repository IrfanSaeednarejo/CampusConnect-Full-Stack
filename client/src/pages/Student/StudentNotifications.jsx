import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  selectNotificationsByType,
  selectAllNotifications,
  selectUnreadCount
} from '../../redux/slices/notificationsSlice';
import { timeAgo } from '../../utils/helpers';


export default function StudentNotifications() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('All');

  const status = useSelector((state) => state.notifications.status);
  const allNotifs = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  // FIX [Bug 3]: Fixed filtering to match corrected singular tab internal types
  const displayedNotifs = activeTab === 'All' 
    ? allNotifs 
    : allNotifs.filter(n => {
        if (activeTab === 'Societies') return n.type === 'society';
        if (activeTab === 'Sessions') return n.type === 'session' || n.type === 'mentor_booking';
        if (activeTab === 'Tasks') return n.type === 'task';
        if (activeTab === 'System') return n.type === 'system';
        return false;
      });

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Handle auto-mark as read from URL query param (e.g., ?notifId=123)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const notifId = searchParams.get('notifId');
    if (notifId) {
      dispatch(markNotificationRead(notifId));
    }
  }, [dispatch, location.search]);

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      dispatch(markAllNotificationsRead());
    }
  };

  const handleNotifClick = (notif) => {
    // FIX BUG 5: isRead becomes true when user clicks anywhere on the row
    if (!notif.read) {
      dispatch(markNotificationRead(notif._id || notif.id));
    }
    // PRESERVED: Navigate to related path feature works perfectly
    if (notif.relatedPath) {
      navigate(notif.relatedPath);
    }
  };

  const handleDelete = (e, notifId) => {
    e.stopPropagation(); // prevent route navigation
    dispatch(deleteNotification(notifId));
  };

  const getIconData = (type) => {
    switch (type) {
      case 'event': return { icon: 'calendar_month', bg: 'bg-blue-500/20', text: 'text-blue-500' };
      case 'society': return { icon: 'groups', bg: 'bg-purple-500/20', text: 'text-purple-500' };
      case 'session':
      case 'mentor_booking': return { icon: 'videocam', bg: 'bg-green-500/20', text: 'text-green-500' };
      case 'task': return { icon: 'task_alt', bg: 'bg-orange-500/20', text: 'text-orange-500' };
      case 'system': return { icon: 'notifications', bg: 'bg-gray-500/20', text: 'text-gray-400' };
      default: return { icon: 'info', bg: 'bg-gray-500/20', text: 'text-gray-400' };
    }
  };

  // FIX [Bug 3]: Spellchecked tab labels: 'Societys' -> 'Societies', 'Systems' -> 'System'
  const tabs = ['All', 'Events', 'Societies', 'Sessions', 'Tasks', 'System'];

  return (
    // FIX [Bug 2]: Outer page wrapper constrained to min-h-screen
    <div className="flex min-h-screen bg-background">


      {/* FIX [Bug 2]: Main content column inside flex flex-col to keep footer at bottom */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 py-8 lg:py-12 px-4 sm:px-10 lg:px-20 text-text-primary max-w-5xl mx-auto w-full">
          <div className="flex flex-col gap-6">
            
            {/* HEADER ROW */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-extrabold text-white">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0 || status === 'loading'}
                className="flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           bg-surface-hover border border-border px-4 py-2 rounded-lg text-white hover:bg-[#30363d]"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                Mark all as read
              </button>
            </div>

            {/* FILTER TABS */}
            <div className="flex overflow-x-auto gap-2 bg-surface/40 glass border border-border p-1.5 rounded-2xl hide-scrollbar backdrop-blur-xl">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-lg shadow-[#238636]/20 scale-105'
                      : 'text-text-secondary hover:bg-[#30363d]/50 hover:text-text-primary hover:translate-y-[-1px]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* NOTIFICATION LIST */}
            <div className="glass border border-border rounded-2xl overflow-hidden min-h-[500px] backdrop-blur-xl shadow-2xl">
              {status === 'failed' ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                  <div className="w-20 h-20 bg-[#f85149]/10 rounded-full flex items-center justify-center border border-[#f85149]/30 mb-4">
                    <span className="material-symbols-outlined text-4xl text-[#f85149]">error</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Failed to load notifications</h3>
                  <p className="text-text-secondary mb-6">Something went wrong. Please try again.</p>
                  <button
                    onClick={() => dispatch(fetchNotifications())}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    Retry
                  </button>
                </div>
              ) : status === 'loading' ? (
                <div className="flex justify-center items-center py-20">
                  <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin">refresh</span>
                </div>
              ) : displayedNotifs.length > 0 ? (
                <div className="flex flex-col">
                  {displayedNotifs.map((notif) => {
                    const { icon, bg, text } = getIconData(notif.type);
                    return (
                      // FIX [Bug 5]: Unread background highlighting vs default read bg
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`
                          group relative flex items-start gap-5 p-6 cursor-pointer
                          border-b border-border/30 last:border-0 transition-all duration-300
                          ${notif.read 
                            ? 'hover:bg-white/5 bg-transparent' 
                            : 'bg-blue-600/5 hover:bg-blue-600/10 border-l-4 border-l-blue-500 shadow-[inset_0_0_30px_rgba(59,130,246,0.03)]'}
                        `}
                      >
                        {/* Left: Type Icon */}
                        <div className={`w-14 h-14 rounded-2xl flex flex-shrink-0 items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300 ${bg} ${text}`}>
                          <span className="material-symbols-outlined text-[28px]">{icon}</span>
                        </div>

                        {/* Center: Content */}
                        <div className="flex-1 min-w-0 pr-16">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            {/* FIX [Bug 5]: Unread title text is bold white, read is lighter gray text */}
                            <h3 className={`text-base truncate ${notif.read ? 'text-gray-300 font-normal' : 'text-white font-semibold'}`}>
                              {notif.title}
                            </h3>
                            <span className="text-xs text-text-secondary whitespace-nowrap mt-1 flex-none hidden sm:block">
                              {timeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary line-clamp-2">
                            {notif.body}
                          </p>
                          <span className="text-xs text-text-secondary block mt-2 sm:hidden">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>

                        {/* Right: Unread Dot & Delete Hover Actions */}
                        {/* FIX [Bug 6]: Positioned far right, hidden by default, visible on group-hover */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                          <button
                            onClick={(e) => handleDelete(e, notif.id)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex-none"
                            title="Delete notification"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>

                          {/* FIX [Bug 5]: Unread dot, right side of row, blue flex-none */}
                          {!notif.read && (
                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] flex-none group-hover:opacity-0 transition-opacity"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center py-32 px-6 text-center bg-surface/10">
                  <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 mb-6 shadow-2xl shadow-[#238636]/5 animate-pulse">
                    <span className="material-symbols-outlined text-5xl text-primary">
                      {activeTab === 'All' ? 'notifications_off' : getIconData(activeTab.toLowerCase()).icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">You're All Caught Up</h3>
                  <p className="text-text-secondary max-w-xs mx-auto leading-relaxed">
                    {activeTab === 'All' 
                      ? "Awesome! You've cleared all your notifications. Enjoy the peace and quiet." 
                      : `No new ${activeTab.toLowerCase()} notifications to show right now.`}
                  </p>
                </div>
              )}
            </div>

            {/* FIX [Bug 7]: Deleted stray space at the bottom to ensure no floating dots! */}

          </div>
        </main>
      </div>
    </div>
  );
}
