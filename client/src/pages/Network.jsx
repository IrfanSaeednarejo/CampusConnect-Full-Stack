import React from 'react';
import NetworkTabs from '../components/network/NetworkTabs';
import NetworkInsightsPanel from '../components/network/NetworkInsightsPanel';

export default function Network() {
  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 lg:px-20">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Professional Network</h1>
            <p className="text-[#8b949e]">Build your academic graph and discover new opportunities.</p>
          </div>
          <NetworkTabs />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <NetworkInsightsPanel />
        </div>
      </div>
    </div>
  );
}
