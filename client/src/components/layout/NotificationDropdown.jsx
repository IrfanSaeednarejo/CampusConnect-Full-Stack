import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  selectNotifications, 
  selectUnreadCount, 
  markReadThunk, 
  markAllReadThunk,
  fetchNotifications
} from '../../redux/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const dropdownRef = useRef(null);

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
    
    // Resolve navigation path
    let path = '/notifications';
    switch (notif.refModel) {
      case 'Chat': path = `/messages/${notif.ref}`; break;
      case 'Event': path = `/events/${notif.ref}`; break;
      case 'Society': path = `/societies/${notif.ref}`; break;
      case 'StudyGroup': path = `/study-groups/${notif.ref}`; break;
      case 'User': path = `/users/${notif.ref}`; break;
    }
    
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]/50">
        <h3 className="text-sm font-semibold text-[#e6edf3]">Notifications</h3>
        <button 
          onClick={handleMarkAllRead}
          className="text-xs text-[#58a6ff] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#30363d] mb-2">notifications_off</span>
            <p className="text-[#8b949e] text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`px-4 py-3 border-b border-[#21262d] last:border-0 cursor-pointer transition-colors hover:bg-[#1f242c] relative group ${!notif.read ? 'bg-[#1f6feb]/5' : ''}`}
            >
              {!notif.read && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#1f6feb] rounded-full" />
              )}
              
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getTypeStyles(notif.type)}`}>
                  <span className="material-symbols-outlined text-lg">{getIcon(notif.type)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#e6edf3] leading-tight mb-1 truncate">
                    {notif.title}
                  </p>
                  <p className="text-xs text-[#8b949e] line-clamp-2 mb-1">
                    {notif.body}
                  </p>
                  <p className="text-[10px] text-[#484f58]">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <Link 
        to="/notifications" 
        onClick={onClose}
        className="px-4 py-2 text-center text-xs font-semibold text-[#8b949e] border-t border-[#30363d] hover:bg-[#1f242c] transition-colors"
      >
        View all notifications
      </Link>
    </div>
  );
}

function getIcon(type) {
  if (type.startsWith('chat')) return 'chat_bubble';
  if (type.startsWith('event')) return 'calendar_today';
  if (type.startsWith('society')) return 'groups';
  if (type.startsWith('mentor')) return 'school';
  if (type.startsWith('studygroup')) return 'group_work';
  return 'info';
}

function getTypeStyles(type) {
  if (type.startsWith('chat')) return 'bg-blue-500/10 text-blue-500';
  if (type.startsWith('event')) return 'bg-purple-500/10 text-purple-500';
  if (type.startsWith('society')) return 'bg-green-500/10 text-green-500';
  if (type.startsWith('mentor')) return 'bg-orange-500/10 text-orange-500';
  return 'bg-gray-500/10 text-gray-400';
}
