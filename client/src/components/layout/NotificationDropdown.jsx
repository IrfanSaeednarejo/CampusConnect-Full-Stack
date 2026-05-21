import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import useHomeTheme from '../../hooks/useHomeTheme';
import { selectUser } from '../../redux/slices/authSlice';
import {
  selectNotifications, 
  selectUnreadCount, 
  markReadThunk, 
  markAllReadThunk,
  fetchNotifications
} from '../../redux/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { getButtonClassName } from '../common/Button';
import { getNotificationTarget } from '../../utils/notificationTargets';

export default function NotificationDropdown({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const user = useSelector(selectUser);
  const dropdownRef = useRef(null);
  const isAdmin = Array.isArray(user?.roles)
    ? user.roles.some((role) => ['admin', 'super_admin', 'campus_admin'].includes(role))
    : false;

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications({ limit: 10 }));
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleMarkAllRead = () => {
    dispatch(markAllReadThunk());
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      dispatch(markReadThunk(notif._id));
    }

    navigate(getNotificationTarget(notif, { isAdmin }));
    onClose();
  };

  if (!isOpen) return null;

  const panelClass = isDark
    ? 'bg-surface-dark border-border-dark shadow-2xl'
    : 'bg-surface-light border-border-light shadow-[0_24px_60px_rgba(15,23,42,0.14)]';
  const headerClass = isDark
    ? 'border-border-dark bg-background-dark/50'
    : 'border-border-light bg-background-light/90';
  const headingClass = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
  const actionClass = 'text-info hover:text-info';
  const emptyIconClass = isDark ? 'text-border-dark' : 'text-border-light';
  const emptyTextClass = isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light';
  const footerClass = isDark
    ? 'border-border-dark text-text-secondary-dark hover:bg-surface-dark hover:text-text-primary-dark'
    : 'border-border-light text-text-secondary-light hover:bg-background-light hover:text-text-primary-light';

  return (
    <div 
      ref={dropdownRef}
      className={`absolute right-0 top-full z-50 mt-2 flex max-h-[500px] w-80 flex-col overflow-hidden rounded-xl border sm:w-96 ${panelClass}`}
    >
      <div className={`flex items-center justify-between border-b px-4 py-3 ${headerClass}`}>
        <h3 className={`text-sm font-semibold ${headingClass}`}>Notifications</h3>
        <button 
          onClick={handleMarkAllRead}
          className={getButtonClassName({
            variant: 'ghost',
            size: 'sm',
            isDark,
            className: `h-auto min-w-0 px-1 text-xs ${actionClass}`,
          })}
        >
          Mark all as read
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <span className={`material-symbols-outlined mb-2 text-4xl ${emptyIconClass}`}>notifications_off</span>
            <p className={`text-sm ${emptyTextClass}`}>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif._id}
              type="button"
              onClick={() => handleNotificationClick(notif)}
              className={`relative block w-full border-b px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset last:border-0 ${
                isDark
                  ? `border-border-dark hover:bg-surface-dark ${!notif.read ? 'bg-info/5' : ''}`
                  : `border-border-light hover:bg-background-light ${!notif.read ? 'bg-info/5' : ''}`
              }`}
            >
              {!notif.read && (
                <div className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-info" />
              )}
              
              <div className="flex gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getTypeStyles(notif.type, isDark)}`}>
                  <span className="material-symbols-outlined text-lg">{getIcon(notif.type)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p
                    className={`mb-1 truncate text-sm font-medium leading-tight ${
                      isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                    }`}
                  >
                    {notif.title}
                  </p>
                  <p
                    className={`mb-1 line-clamp-2 text-xs ${
                      isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                    }`}
                  >
                    {notif.body}
                  </p>
                  <p
                    className={`text-[10px] ${
                      isDark ? 'text-text-secondary-dark/80' : 'text-text-secondary-light/80'
                    }`}
                  >
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <Link 
        to="/notifications" 
        onClick={onClose}
        className={`${getButtonClassName({
          variant: 'ghost',
          size: 'sm',
          isDark,
          className: 'w-full rounded-none border-t px-4 text-center text-xs',
        })} ${footerClass}`}
      >
        View all notifications
      </Link>
    </div>
  );
}

function getIcon(type) {
  if (type.startsWith('GAMIFICATION_')) return 'workspace_premium';
  if (type.startsWith('chat')) return 'chat_bubble';
  if (type.startsWith('event')) return 'calendar_today';
  if (type.startsWith('society')) return 'groups';
  if (type.startsWith('mentor')) return 'school';
  if (type.startsWith('studygroup')) return 'group_work';
  return 'info';
}

function getTypeStyles(type, isDark) {
  if (type.startsWith('GAMIFICATION_')) return 'bg-info/10 text-info';
  if (type.startsWith('chat')) return 'bg-info/10 text-info';
  if (type.startsWith('event')) return 'bg-info/10 text-info';
  if (type.startsWith('society')) return 'bg-success/10 text-success';
  if (type.startsWith('mentor')) return 'bg-warning/10 text-warning';
  return isDark
    ? 'border border-border-dark bg-background-dark text-text-secondary-dark'
    : 'border border-border-light bg-background-light text-text-secondary-light';
}
