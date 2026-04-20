import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNetworkState, fetchSuggestedMembers } from '../../redux/slices/networkSlice';
import MemberCard from '../common/MemberCard';
import SectionHeader from '../common/SectionHeader';
import MemberDiscovery from './MemberDiscovery';

export default function NetworkTabs() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('network');
  const { connected, pendingSent, pendingReceived, suggested, loading } = useSelector((state) => state.network);

  useEffect(() => {
    dispatch(fetchNetworkState());
    dispatch(fetchSuggestedMembers(10));
  }, [dispatch]);

  if (loading && !connected.length && !suggested.length) {
    return <div className="text-center py-10 text-slate-400">Loading network graph...</div>;
  }

  const renderSection = (title, items) => (
    <div className="mb-12">
      <SectionHeader title={title} align="left" subtitle={`${items.length} people`} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {items.map((item) => (
          <MemberCard
            key={item.user._id}
            userId={item.user._id}
            name={item.user.profile?.displayName || 'Unknown'}
            displayName={item.user.profile?.displayName}
            role={item.user.roles?.[0]}
            avatarUrl={item.user.profile?.avatar}
            bio={item.user.profile?.bio}
            interests={item.user.interests}
            isConnected={title === "My Connections"}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#30363d] gap-8">
        <button 
          onClick={() => setActiveTab('network')}
          className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'network' ? 'text-[#e6edf3]' : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          My Network
          {activeTab === 'network' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f78166] rounded-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('discover')}
          className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'discover' ? 'text-[#e6edf3]' : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          Discover Members
          {activeTab === 'discover' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f78166] rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'network' ? (
        <div className="flex flex-col animate-fadeIn">
          {pendingReceived.length > 0 && renderSection("Incoming Requests", pendingReceived)}
          {pendingSent.length > 0 && renderSection("Pending Requests", pendingSent)}
          {connected.length > 0 && renderSection("My Connections", connected)}
          
          {suggested.length > 0 && (
            <div className="mb-12 border-t border-[#30363d] pt-8 mt-4">
              <SectionHeader title="People You May Know" align="left" subtitle="Smart recommendations based on your network and interests" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {suggested.map((user) => (
                  <MemberCard
                    key={user._id}
                    userId={user._id}
                    name={user.profile?.displayName || 'Unknown'}
                    displayName={user.profile?.displayName}
                    role={user.roles?.[0]}
                    avatarUrl={user.profile?.avatar}
                    bio={user.profile?.bio}
                    interests={user.interests}
                    sharedInterests={user.sharedInterests}
                    matchType={user.matchType}
                    mutualCount={user.mutualCount}
                  />
                ))}
              </div>
            </div>
          )}

          {connected.length === 0 && pendingReceived.length === 0 && pendingSent.length === 0 && (
            <div className="py-20 text-center bg-[#161b22] rounded-lg border border-dashed border-[#30363d]">
              <span className="material-symbols-outlined text-4xl text-[#8b949e] mb-3">hub</span>
              <p className="text-[#8b949e]">Your professional network is empty.</p>
              <button 
                onClick={() => setActiveTab('discover')}
                className="mt-4 text-[#58a6ff] hover:underline text-sm font-medium"
              >
                Start discovering members &rarr;
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fadeIn">
          <MemberDiscovery />
        </div>
      )}
    </div>
  );
}
