import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

export default function NetworkInsightsPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    newMembers: [],
    activeMentors: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // We'll use a specific endpoint or just general search with filters
        const [newRes, mentorRes] = await Promise.all([
          axios.get('/users/search?limit=3'), // Latest
          axios.get('/users/search?limit=3&role=mentor'), // Active mentors
        ]);
        
        setStats({
          newMembers: newRes.data.data.users || [],
          activeMentors: mentorRes.data.data.users || [],
        });
      } catch (err) {
        console.error("Failed to fetch network insights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-[#161b22] rounded-lg"></div>;

  return (
    <div className="flex flex-col gap-6">
      <Card title="New Members" className="p-0 overflow-hidden">
        <div className="flex flex-col divide-y divide-[#30363d]">
          {stats.newMembers.map(user => (
            <div key={user._id} className="p-3 flex items-center gap-3 hover:bg-[#21262d] transition-colors cursor-pointer"
                 onClick={() => navigate(`/profile/${user._id}`)}>
              <Avatar src={user.profile?.avatar} size="8" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-[#e6edf3]">{user.profile?.displayName}</p>
                <p className="text-xs text-[#8b949e]">Joined recently</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Active Mentors" className="p-0 overflow-hidden">
        <div className="flex flex-col divide-y divide-[#30363d]">
          {stats.activeMentors.map(user => (
            <div key={user._id} className="p-3 flex items-center gap-3 hover:bg-[#21262d] transition-colors cursor-pointer"
                 onClick={() => navigate(`/profile/${user._id}`)}>
              <Avatar src={user.profile?.avatar} size="8" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-[#e6edf3]">{user.profile?.displayName}</p>
                <p className="text-xs text-[#3fb950] font-medium">Available for sessions</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
