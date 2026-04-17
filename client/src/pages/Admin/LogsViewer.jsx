import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';

/**
 * Administrative System Logs Viewer.
 * High-performance log exploration for developers and system admins.
 */
export default function LogsViewer() {
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { id: 'system', label: 'System Kernel', icon: 'developer_board' },
    { id: 'auth', label: 'Auth Events', icon: 'security' },
    { id: 'api', label: 'API Gateway', icon: 'router' },
    { id: 'errors', label: 'Error Stream', icon: 'error_outline' }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="Log Explorer" 
          subtitle="Real-time unified logging system for diagnosis and forensic audit."
          icon="text_snippet"
        />

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
          <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            tabs={tabs} 
          />

          <div className="p-8">
             <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                   <div className="flex-1 px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs font-mono text-gray-400">
                      stream --tail 100 --service={activeTab} --format=json
                   </div>
                   <Button variant="primary" className="bg-[#1f6feb] text-xs h-9">Execute Query</Button>
                </div>
             </div>

             <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 font-mono text-xs leading-relaxed space-y-1 max-h-[600px] overflow-y-auto overflow-x-auto select-all">
                <div className="text-gray-500">{"[2026-04-17T05:43:12] [INFO] [" + activeTab + "] Initializing stream processing..."}</div>
                <div className="text-gray-500">{"[2026-04-17T05:43:12] [INFO] [" + activeTab + "] Buffering telemetry data..."}</div>
                <div className="text-blue-400">{"[2026-04-17T05:43:13] [DEBUG] [" + activeTab + "] Connection healthy (ms: 42)"}</div>
                <div className="text-purple-400">{"[2026-04-17T05:43:14] [METRIC] [" + activeTab + "] Load: 0.12, 0.08, 0.05"}</div>
                <div className="text-green-400">{"[2026-04-17T05:43:15] [OK] [" + activeTab + "] Subsystem ready. Listening for interrupts..."}</div>
                <div className="mt-8 pt-8 border-t border-[#30363d] text-center text-gray-600 italic">
                   No further log entries available in the current selection window.
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
