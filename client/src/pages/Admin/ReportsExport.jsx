import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';

/**
 * Administrative Reporting and Data Export Module.
 * Generates institutional summaries, financial reports, and system audit files.
 */
export default function ReportsExport() {
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { id: 'system', label: 'System Health Reports', icon: 'analytics' },
    { id: 'financial', label: 'Financial Summaries', icon: 'payments' },
    { id: 'users', label: 'User Demographics', icon: 'group' },
    { id: 'societies', label: 'Society Engagement', icon: 'diversity_3' }
  ];

  const reportTypes = [
    { id: 'daily', label: 'Daily Status Snapshot', icon: 'today' },
    { id: 'weekly', label: 'Weekly Performance Digest', icon: 'date_range' },
    { id: 'monthly', label: 'Monthly Growth Strategy', icon: 'calendar_month' },
    { id: 'custom', label: 'Custom Data Parameters', icon: 'tune' }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="Reporting & Export" 
          subtitle="Enterprise-grade institutional analytics and data archiving service."
          icon="file_download"
        />

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
          <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            tabs={tabs} 
          />

          <div className="p-8">
             <div className="mb-10 text-center space-y-2">
                <h3 className="text-2xl font-black text-white">Generate {activeTab === 'financial' ? 'Financial' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Summary</h3>
                <p className="max-w-xl mx-auto text-gray-400">
                   Select the institutional depth and temporal range for the current reporting operation.
                   Exports are available in PDF, XLSX, and JSON formats.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reportTypes.map((type) => (
                   <div key={type.id} className="p-6 bg-[#0d1117] border border-[#30363d] rounded-2xl hover:border-[#1f6feb] group transition-all cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-[#161b22] flex items-center justify-center text-[#58a6ff] mb-4 group-hover:bg-[#1f6feb] group-hover:text-white transition-all">
                         <span className="material-symbols-outlined">{type.icon}</span>
                      </div>
                      <h4 className="font-bold text-white mb-1">{type.label}</h4>
                      <p className="text-xs text-gray-500 mb-6">Unified telemetry from all campus nodes included.</p>
                      <Button variant="outline" className="w-full text-xs py-2 h-auto border-[#30363d]">
                        Prepare Export
                      </Button>
                   </div>
                ))}
             </div>

             <div className="mt-12 p-6 bg-[#0d1117] border border-[#30363d] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center md:text-left">
                   <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined text-xl">info</span>
                   </div>
                   <div>
                      <h4 className="text-sm font-bold">Scheduled Reporting Enabled</h4>
                      <p className="text-xs text-gray-500">Weekly institutional summaries are automatically delivered to stakeholders every Monday at 00:00 UTC.</p>
                   </div>
                </div>
                <Button variant="primary" className="bg-[#1f6feb] text-xs h-10 px-6">Manage Schedules</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
