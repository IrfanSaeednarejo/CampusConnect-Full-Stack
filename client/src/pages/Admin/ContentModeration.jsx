import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';

/**
 * Administrative Content Moderation Interface.
 * Handles reported posts, user comments, and automated filtering queues.
 */
export default function ContentModeration() {
  const [activeTab, setActiveTab] = useState('reports');

  const tabs = [
    { id: 'reports', label: 'User Reports', icon: 'flag' },
    { id: 'automated', label: 'Automated Filters', icon: 'auto_awesome' },
    { id: 'banned', label: 'Banned Keywords', icon: 'block' },
    { id: 'history', label: 'Moderation History', icon: 'history' }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="Content Moderation" 
          subtitle="Proactive community protection and policy enforcement module."
          icon="shield_person"
        />

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
          <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            tabs={tabs} 
          />

          <div className="p-8">
             <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#0d1117] border-2 border-[#30363d] flex items-center justify-center text-green-500 mb-6 group hover:border-green-500 transition-all cursor-default">
                   <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">verified_user</span>
                </div>
                <h3 className="text-2xl font-black text-white">Queue is Clear</h3>
                <p className="max-w-md mx-auto mt-2 text-[#8b949e]">
                   No pending content requires manual review for the "{activeTab}" category. 
                   Platform safety scores are currently within optimal parameters.
                </p>
                <div className="flex items-center gap-3 mt-8">
                   <Button variant="outline" className="text-xs border-[#30363d]">Refresh Queue</Button>
                   <Button variant="primary" className="text-xs bg-[#1f6feb] hover:bg-[#58a6ff]">Global Settings</Button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
