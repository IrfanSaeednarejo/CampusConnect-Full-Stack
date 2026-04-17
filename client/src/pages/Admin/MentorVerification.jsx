import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';

/**
 * Administrative Mentor Verification Dashboard.
 * Processes mentor applications, identity proofing, and credential checks.
 */
export default function MentorVerification() {
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
    { id: 'pending', label: 'Pending Applications', icon: 'pending' },
    { id: 'review', label: 'Under Review', icon: 'rate_review' },
    { id: 'approved', label: 'Verified Mentors', icon: 'verified' },
    { id: 'rejected', label: 'Rejected Applications', icon: 'do_not_disturb_on' }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="Mentor Verification" 
          subtitle="Expert onboarding and institutional credential validation module."
          icon="fact_check"
        />

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
          <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            tabs={tabs} 
          />

          <div className="p-8">
             <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                <span className="material-symbols-outlined text-6xl mb-4 text-[#58a6ff]">assignment_ind</span>
                <h3 className="text-xl font-bold text-white">All Applications Processed</h3>
                <p className="max-w-sm mx-auto mt-2 italic">
                   No applications are currently awaiting attention in the "{activeTab}" queue. 
                   Stay vigilant for new institutional registrations.
                </p>
                <div className="mt-8">
                   <Button variant="outline" className="border-[#30363d] text-[#58a6ff] hover:bg-[#1f242c]">Verification Settings</Button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
