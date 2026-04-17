import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';

/**
 * Administrative System Health & Monitoring Panel.
 * Tracks global infrastructure status, database integrity, and high-availability nodes.
 */
export default function SystemHealth() {
  const [activeTab, setActiveTab] = useState('infrastructure');

  const tabs = [
    { id: 'infrastructure', label: 'Nodes & Core', icon: 'dns' },
    { id: 'database', label: 'Database Integrity', icon: 'database' },
    { id: 'security', label: 'Threat Metrics', icon: 'security' },
    { id: 'cache', label: 'Cache Clusters', icon: 'memory' }
  ];

  const nodeStats = [
    { label: 'Latency', value: '28ms', status: 'optimal' },
    { label: 'Load', value: '1.24', status: 'low' },
    { label: 'Uptime', value: '99.99%', status: 'high' }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="Infrastructure Health" 
          subtitle="Enterprise monitoring and real-time core system status dashboard."
          icon="health_and_safety"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl">
             <Tabs 
               activeTab={activeTab} 
               onChange={setActiveTab} 
               tabs={tabs} 
             />

             <div className="p-10">
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                   <div className="relative group">
                      <div className="absolute inset-0 rounded-full bg-green-500/20 blur-2xl animate-pulse group-hover:bg-green-500/40 transition-all duration-1000" />
                      <div className="relative w-24 h-24 rounded-full border-4 border-[#238636] flex items-center justify-center text-[#238636]">
                         <span className="material-symbols-outlined text-4xl">cloud_done</span>
                      </div>
                   </div>
                   <h3 className="text-3xl font-black text-white">All Core Nodes Operational</h3>
                   <p className="max-w-md text-gray-400">
                      The institutional infrastructure is processing telemetry and API requests within optimal latency thresholds. No degradation identified on the {activeTab} layer.
                   </p>
                   <div className="pt-4 flex gap-3">
                      <Button variant="outline" className="text-xs border-[#30363d] h-9">System Audit</Button>
                      <Button variant="primary" className="text-xs bg-[#238636] hover:bg-[#2eaa42] h-9">Node Management</Button>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 lg:p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                   <span className="material-symbols-outlined text-[#58a6ff]">speed</span>
                   Service Node L1
                </h3>
                <div className="space-y-6">
                   {nodeStats.map((stat, idx) => (
                      <div key={idx} className="flex justify-between items-center group">
                         <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#238636] shadow-[0_0_10px_#238636] group-hover:scale-125 transition-transform" />
                            <span className="text-sm font-medium text-gray-400">{stat.label}</span>
                         </div>
                         <div className="text-right">
                            <div className="text-white font-bold">{stat.value}</div>
                            <div className="text-[10px] text-[#238636] uppercase font-bold tracking-tighter">{stat.status}</div>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="mt-8 pt-8 border-t border-[#30363d]">
                   <p className="text-[10px] text-gray-500 font-mono text-center">Last Refreshed: {new Date().toLocaleTimeString()} UTC</p>
                </div>
             </div>

             <div className="bg-[#161b22]/50 border border-[#30363d] border-dashed rounded-2xl p-6 text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-blue-900/10 flex items-center justify-center text-blue-500 mx-auto">
                   <span className="material-symbols-outlined text-xl">update</span>
                </div>
                <h4 className="text-sm font-bold text-gray-200">Scheduled Maintenance</h4>
                <p className="text-xs text-gray-500 italic">No network-wide maintenance operations scheduled for the next 72 hours.</p>
                <Button variant="outline" className="w-full text-[10px] py-1.5 border-[#30363d] h-auto">View Roadmap</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
