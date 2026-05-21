import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import useHomeTheme from '../../hooks/useHomeTheme';

export default function NetworkInsightsPanel() {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
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

  if (loading) return <div className={`h-64 animate-pulse rounded-lg ${isDark ? 'bg-surface-dark' : 'bg-slate-100'}`}></div>;

  return (
    <div className="flex flex-col gap-6">
      <Card title="New Members" className="p-0 overflow-hidden">
        <div className={`flex flex-col ${isDark ? 'divide-y divide-border-dark' : 'divide-y divide-border-light'}`}>
          {stats.newMembers.map(user => (
            <div key={user._id} className={`flex cursor-pointer items-center gap-3 p-3 transition-colors ${isDark ? 'hover:bg-surface-muted-dark' : 'hover:bg-slate-50'}`}
                 onClick={() => navigate(`/profile/${user._id}`)}>
              <Avatar src={user.profile?.avatar} size="8" />
              <div className="flex-1 min-w-0">
                <p className={`truncate text-sm font-semibold ${isDark ? 'text-text-primary-dark' : 'text-slate-900'}`}>{user.profile?.displayName}</p>
                <p className={`text-xs ${isDark ? 'text-text-secondary-dark' : 'text-slate-500'}`}>Joined recently</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Active Mentors" className="p-0 overflow-hidden">
        <div className={`flex flex-col ${isDark ? 'divide-y divide-border-dark' : 'divide-y divide-border-light'}`}>
          {stats.activeMentors.map(user => (
            <div key={user._id} className={`flex cursor-pointer items-center gap-3 p-3 transition-colors ${isDark ? 'hover:bg-surface-muted-dark' : 'hover:bg-slate-50'}`}
                 onClick={() => navigate(`/profile/${user._id}`)}>
              <Avatar src={user.profile?.avatar} size="8" />
              <div className="flex-1 min-w-0">
                <p className={`truncate text-sm font-semibold ${isDark ? 'text-text-primary-dark' : 'text-slate-900'}`}>{user.profile?.displayName}</p>
                <p className="text-xs font-medium text-primary">Available for sessions</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
