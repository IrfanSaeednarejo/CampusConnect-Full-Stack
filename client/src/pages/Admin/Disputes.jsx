import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';

/**
 * Dispute Resolution Dashboard.
 * Manages conflicts related to payments, session attendance, and platform ethics.
 */
export default function Disputes() {
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active Disputes', icon: 'gavel' },
    { id: 'pending', label: 'Pending Review', icon: 'pending' },
    { id: 'resolved', label: 'Resolved Cases', icon: 'check_circle' },
    { id: 'history', label: 'Audit Trail', icon: 'history' }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="Dispute Center" 
          subtitle="Formal conflict resolution and ethical oversight module."
          icon="balance"
        />

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
          <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            tabs={tabs} 
          />

          <div className="p-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12">
                <div className="order-2 md:order-1 text-center md:text-left space-y-4">
                   <h3 className="text-3xl font-black text-white leading-tight">Zero Conflicts Identified</h3>
                   <p className="max-w-md text-lg text-gray-500">
                      The current user trust score is at an all-time high. 
                      No active {activeTab} disputes require administrative intervention.
                   </p>
                   <div className="flex gap-4 justify-center md:justify-start pt-4">
                      <Button variant="primary" className="bg-[#1f6feb] transition-transform hover:scale-105">Trust Score Hub</Button>
                      <Button variant="outline" className="border-[#30363d] transition-transform hover:scale-105">Ethics Settings</Button>
                   </div>
                </div>
                <div className="order-1 md:order-2 flex justify-center">
                   <div className="relative w-64 h-64 flex items-center justify-center animate-pulse duration-4000">
                      <div className="absolute inset-0 bg-[#58a6ff]/5 rounded-full blur-3xl" />
                      <span className="material-symbols-outlined text-8xl text-blue-500/50">verified_user</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
