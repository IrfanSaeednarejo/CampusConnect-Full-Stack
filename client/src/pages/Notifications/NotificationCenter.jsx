import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  selectNotifications, 
  selectUnreadCount, 
  fetchNotifications, 
  markReadThunk, 
  markAllReadThunk,
  selectNotificationLoading
} from '../../redux/slices/notificationSlice';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import { formatDistanceToNow } from 'date-fns';

/**
 * Global Notification Center.
 * Aggregates alerts, chat mentions, and system activities.
 */
export default function NotificationCenter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(selectNotifications) || [];
  const loading = useSelector(selectNotificationLoading);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 50 }));
  }, [dispatch]);

  const tabs = [
    { id: 'all', label: 'All Alerts', icon: 'notifications' },
    { id: 'activity', label: 'User Activity', icon: 'interests' },
    { id: 'mentions', label: 'Messages', icon: 'chat' },
    { id: 'system', label: 'System', icon: 'developer_board' }
  ];

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'all') return true;
    
    if (activeTab === 'mentions') {
      return ['chat_message'].includes(notif.type);
    }
    
    if (activeTab === 'system') {
      return ['system', 'admin', 'nexus_action'].includes(notif.type);
    }
    
    if (activeTab === 'activity') {
      return [
        'event_reminder', 'event_update', 'event_registration',
        'society_invite', 'society_update',
        'mentor_booking', 'mentor_reminder', 'mentor_review',
        'studygroup_invite', 'studygroup_update',
        'task_reminder', 'task_created',
        'connection_request', 'connection_accepted',
        'profile_view'
      ].includes(notif.type);
    }
    
    return true;
  });

  const getIconForType = (type) => {
    if (type?.includes('event')) return 'event';
    if (type?.includes('society')) return 'groups';
    if (type?.includes('mentor')) return 'school';
    if (type?.includes('chat')) return 'chat_bubble';
    if (type?.includes('studygroup')) return 'local_library';
    if (type?.includes('task')) return 'task_alt';
    if (type?.includes('connection')) return 'person_add';
    if (type === 'nexus_action') return 'psychology';
    if (type === 'admin') return 'shield';
    return 'notifications';
  };

  const getIconColorForType = (type) => {
    if (type?.includes('event')) return 'bg-indigo-900/40 text-indigo-400';
    if (type?.includes('society')) return 'bg-emerald-900/40 text-emerald-400';
    if (type?.includes('mentor')) return 'bg-orange-900/40 text-orange-400';
    if (type?.includes('chat')) return 'bg-blue-900/40 text-blue-400';
    if (type?.includes('connection')) return 'bg-cyan-900/40 text-cyan-400';
    if (type?.includes('system') || type?.includes('admin')) return 'bg-red-900/40 text-red-400';
    if (type === 'nexus_action') return 'bg-purple-900/40 text-purple-400';
    return 'bg-[#0d1117] text-gray-500 border border-[#30363d]';
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      dispatch(markReadThunk(notif._id));
    }

    if (notif.refModel && notif.ref) {
      switch (notif.refModel) {
        case 'Event':
          navigate(`/events/${notif.ref}`);
          break;
        case 'Society':
          navigate(`/societies/${notif.ref}`);
          break;
        case 'StudyGroup':
          navigate(`/study-groups/${notif.ref}`);
          break;
        case 'Chat':
          navigate(`/messages/${notif.ref}`);
          break;
        case 'MentorBooking':
          navigate(`/my-sessions`);
          break;
        case 'Task':
          navigate(`/dashboard?tab=tasks`);
          break;
        case 'NexusConversation':
          navigate(`/nexus`);
          break;
        case 'User':
          navigate(`/users/${notif.ref}`);
          break;
        case 'ProfileView':
          navigate(`/users/${notif.actorId}`); // Go to the visitor's profile
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader 
          title="Notification Center" 
          subtitle="Real-time aggregation of your institutional telemetry and social engagement."
          icon="notifications_active"
        />

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 bg-[#0d1117] border-b border-[#30363d] gap-4">
             <div className="flex-1 overflow-x-auto hide-scrollbar">
               <Tabs 
                 activeTab={activeTab} 
                 onChange={setActiveTab} 
                 tabs={tabs} 
               />
             </div>
             <button 
               onClick={() => dispatch(markAllReadThunk())}
               className="text-[10px] font-black uppercase text-[#58a6ff] hover:text-white transition-colors shrink-0 py-4"
             >
                Archive All Unread
             </button>
          </div>

          <div className="p-0">
             {loading && notifications.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                   <div className="w-8 h-8 border-2 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin mx-auto mb-4" />
                   <p className="text-sm">Loading telemetry...</p>
                </div>
             ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                   <div 
                     key={notif._id} 
                     onClick={() => handleNotificationClick(notif)}
                     className={`p-6 flex items-start gap-4 hover:bg-[#1f242c] transition-all cursor-pointer border-b border-[#30363d]/50 group relative ${!notif.read ? 'bg-[#1f6feb08]' : ''}`}
                   >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColorForType(notif.type)}`}>
                         <span className="material-symbols-outlined text-xl">
                            {getIconForType(notif.type)}
                         </span>
                      </div>

                      <div className="flex-1 space-y-1">
                         <div className="flex justify-between items-start gap-4">
                            <h4 className={`text-sm font-bold transition-colors ${!notif.read ? 'text-white group-hover:text-[#58a6ff]' : 'text-gray-300 group-hover:text-white'}`}>
                               {notif.title}
                            </h4>
                            <span className="text-[10px] text-gray-500 font-mono shrink-0 whitespace-nowrap mt-1">
                               {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </span>
                         </div>
                         <p className={`text-xs leading-relaxed max-w-xl ${!notif.read ? 'text-gray-300' : 'text-gray-500'}`}>
                            {notif.body}
                         </p>
                      </div>

                      {!notif.read && (
                         <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                   </div>
                ))
             ) : (
                <div className="p-10 text-center opacity-30 italic text-sm">
                   No alerts available in this category.
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
