import React from 'react';
import NetworkTabs from '../components/network/NetworkTabs';

export default function Network() {
  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-[960px] mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">My Network</h1>
          <p className="text-[#8b949e]">Manage your connections and pending requests.</p>
        </div>
        <NetworkTabs />
      </div>
    </div>
  );
}
