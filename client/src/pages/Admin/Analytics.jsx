import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Tabs from '../../components/common/Tabs';

/**
 * Administrative Analytics Dashboard.
 * Provides a high-level overview of system metrics, growth, and engagement.
 */
export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for initial iteration
  const metrics = [
    { label: 'Total Users', value: '14,285', change: '+12%', icon: 'group', color: '#1f6feb' },
    { label: 'Active Sessions', value: '3,102', change: '+5%', icon: 'bolt', color: '#238636' },
    { label: 'New Societies', value: '42', change: '-2%', icon: 'diversity_3', color: '#d29922' },
    { label: 'System Uptime', value: '99.98%', change: 'stable', icon: 'speed', color: '#8b949e' }
  ];

  const tabs = [
    { id: 'overview', label: 'Growth Overview', icon: 'trending_up' },
    { id: 'usage', label: 'User Engagement', icon: 'interests' },
    { id: 'performance', label: 'API Performance', icon: 'monitoring' },
    { id: 'revenue', label: 'Revenue & Payments', icon: 'payments' }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="System Analytics" 
          subtitle="Real-time operational intelligence and platform health monitoring."
          icon="analytics"
        />

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, idx) => (
            <StatCard 
              key={idx}
              label={m.label}
              value={m.value}
              trend={m.change}
              icon={m.icon}
              color={m.color}
            />
          ))}
        </div>

        {/* Detailed Analysis Section */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl">
          <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            tabs={tabs} 
          />
          
          <div className="p-8">
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <span className="material-symbols-outlined text-6xl mb-4">data_exploration</span>
              <h3 className="text-xl font-bold">Data Visualization Layer Initializing</h3>
              <p className="max-w-md mx-auto mt-2 text-sm">
                The analytics engine is currently processing real-time telemetry from the {activeTab} service. 
                Full chart integration will be available shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Events / Activity Log */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[#58a6ff]">history</span>
              Recent Anomalies & Alerts
            </h3>
            <button className="text-sm text-[#58a6ff] hover:underline">View All Logs</button>
          </div>

          <div className="space-y-4">
             {[1, 2, 3].map((item) => (
               <div key={item} className="flex items-start gap-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl hover:bg-[#1f242c] transition-colors cursor-default">
                  <div className="w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center text-red-500">
                     <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold">API Latency Spike (E042)</h4>
                        <span className="text-[10px] text-gray-500 font-mono">14:0{item} UTC</span>
                     </div>
                     <p className="text-xs text-gray-400 mt-1">
                        Detected an unusual response time increase (>500ms) on the Payment verification node. 
                        Automatic scaling initiated.
                     </p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
