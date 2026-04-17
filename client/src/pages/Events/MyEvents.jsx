import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, selectAllEvents, selectEventLoading } from '../../redux/slices/eventSlice';
import PageHeader from '../../components/common/PageHeader';
import CircularProgress from '../../components/common/CircularProgress';
import Button from '../../components/common/Button';

/**
 * Page displaying events the user has registered for or is hosting.
 */
export default function MyEvents() {
  const dispatch = useDispatch();
  const events = useSelector(selectAllEvents);
  const loading = useSelector(selectEventLoading);

  useEffect(() => {
    dispatch(fetchEvents({ filter: 'my' })); // Assuming thunk supports filtering
  }, [dispatch]);

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="My Registered Events" 
          subtitle="Manage your upcoming workshops, hackathons, and seminars."
          icon="event_available"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden hover:border-[#1f6feb] transition-all group">
                 <div className="h-32 bg-gradient-to-r from-[#1f6feb] to-[#238636] opacity-80 group-hover:opacity-100 transition-opacity" />
                 <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 truncate">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#8b949e] mb-4">
                       <span className="material-symbols-outlined text-sm">calendar_today</span>
                       {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <Button variant="outline" className="w-full text-xs">View Details</Button>
                 </div>
              </div>
            ))
          ) : (
            <div className="lg:col-span-3 py-20 bg-[#161b22] border border-[#30363d] border-dashed rounded-3xl text-center">
               <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">event_note</span>
               <h3 className="text-xl font-bold">No events joined yet</h3>
               <p className="text-gray-500 max-w-sm mx-auto mt-2">Discover and join exciting events from your campus marketplace.</p>
               <Button className="mt-6 bg-[#1f6feb] hover:bg-[#58a6ff]">Explore Marketplace</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
