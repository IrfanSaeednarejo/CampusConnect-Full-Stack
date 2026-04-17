import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNotifications, selectUnreadCount, markAsRead, markAllAsRead, removeNotification } from '../../redux/slices/notificationSlice';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';

/**
 * Global Notification Center.
 * Aggregates alerts, chat mentions, and system activities.
 */
export default function NotificationCenter() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Alerts', icon: 'notifications' },
    { id: 'mentions', label: 'Mentions', icon: 'alternate_email' },
    { id: 'system', label: 'System Kernel', icon: 'developer_board' },
    { id: 'activity', label: 'User Activity', icon: 'interests' }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader 
          title="Notification Center" 
          subtitle="Real-time aggregation of your institutional telemetry and social engagement."
          icon="notifications_active"
        />

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
          <div className="flex items-center justify-between px-6 bg-[#0d1117] border-b border-[#30363d]">
             <Tabs 
               activeTab={activeTab} 
               onChange={setActiveTab} 
               tabs={tabs} 
             />
             <button 
               onClick={() => dispatch(markAllAsRead())}
               className="text-[10px] font-black uppercase text-[#58a6ff] hover:text-white transition-colors"
             >
                Archice All
             </button>
          </div>

          <div className="p-0">
             {(notifications.length > 0 ? notifications : [1, 2, 3]).map((notif, idx) => (
               <div key={idx} className={`p-6 flex items-start gap-4 hover:bg-[#1f242c] transition-all cursor-pointer border-b border-[#30363d]/50 group relative ${idx === 0 ? 'bg-[#1f6feb08]' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    idx === 0 ? 'bg-blue-900/40 text-blue-400' : 'bg-[#0d1117] text-gray-500'
                  }`}>
                     <span className="material-symbols-outlined text-xl">
                        {idx === 0 ? 'bolt' : idx === 1 ? 'chat_bubble' : 'verified'}
                     </span>
                  </div>

                  <div className="flex-1 space-y-1">
                     <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#58a6ff] transition-colors">
                           {idx === 0 ? 'System Intelligence Node Alpha' : 'Sarah Johnson shared a resource'}
                        </h4>
                        <span className="text-[10px] text-gray-500 font-mono">14:2{idx} UTC</span>
                     </div>
                     <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                        A new institutional event "{idx === 0 ? 'Code Sprint 2026' : 'Advanced React Patterns'}" has been published to your campus. 
                        Registration is now active.
                     </p>
                  </div>

                  {idx === 0 && <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
               </div>
             ))}

             <div className="p-10 text-center opacity-30 italic text-sm">
                No further alerts available in your current history.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
