import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNetworkState, fetchSuggestedMembers } from '../../redux/slices/networkSlice';
import MemberCard from '../common/MemberCard';
import SectionHeader from '../common/SectionHeader';

export default function NetworkTabs() {
  const dispatch = useDispatch();
  const { connected, pendingSent, pendingReceived, suggested, loading } = useSelector((state) => state.network);

  useEffect(() => {
    dispatch(fetchNetworkState());
    dispatch(fetchSuggestedMembers(10));
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading network...</div>;
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
            role={item.user.roles?.[0]}
            interests={item.user.interests}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {pendingReceived.length > 0 && renderSection("Incoming Requests", pendingReceived)}
      {pendingSent.length > 0 && renderSection("Pending Requests", pendingSent)}
      {connected.length > 0 && renderSection("My Connections", connected)}
      {suggested.length > 0 && (
        <div className="mb-12">
          <SectionHeader title="Suggested Members" align="left" subtitle="People you may know" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {suggested.map((user) => (
              <MemberCard
                key={user._id}
                userId={user._id}
                name={user.profile?.displayName || 'Unknown'}
                role={user.roles?.[0]}
                interests={user.interests}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
