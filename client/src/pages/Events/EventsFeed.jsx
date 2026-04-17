import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, selectAllEvents, selectEventLoading } from '../../redux/slices/eventSlice';
import PageHeader from '../../components/common/PageHeader';
import CircularProgress from '../../components/common/CircularProgress';
import Button from '../../components/common/Button';

/**
 * Visual Stream of Upcoming Events.
 * Displays a chronological feed of institutional workshops, hackathons, and gatherings.
 */
export default function EventsFeed() {
  const dispatch = useDispatch();
  const events = useSelector(selectAllEvents);
  const loading = useSelector(selectEventLoading);

  useEffect(() => {
    dispatch(fetchEvents({ status: 'published' }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-12">
        <PageHeader 
          title="Campus Intelligence Stream" 
          subtitle="Chronological feed of institutional events, workshops, and gatherings."
          icon="event_note"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            {(events.length > 0 ? events : [1, 2, 3]).map((event, idx) => (
              <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-3xl overflow-hidden hover:border-[#1f6feb] transition-all group cursor-pointer lg:flex h-64 shadow-2xl">
                 <div className="lg:w-1/3 bg-[#0d1117] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay group-hover:scale-110 transition-transform duration-500" />
                    <span className="material-symbols-outlined text-6xl text-blue-500/30">rocket_launch</span>
                 </div>
                 
                 <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="text-2xl font-black text-white group-hover:text-[#58a6ff] transition-colors truncate">Institutional Workshop {idx + 1}</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-blue-900/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">Global</span>
                       </div>
                       <p className="text-sm text-[#8b949e] line-clamp-2 max-w-sm">
                          Participate in an immersive {idx === 0 ? 'engineering' : 'design'} masterclass hosted by the technical council. 
                          Academic credits applicable upon completion.
                       </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#30363d] pt-6">
                       <div className="flex -space-x-3 overflow-hidden">
                          {[1, 2, 3, 4].map(avatar => (
                            <div key={avatar} className="inline-block h-8 w-8 rounded-full border-2 border-[#161b22] bg-[#0d1117] overflow-hidden">
                               <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatar + idx}`} alt="" />
                            </div>
                          ))}
                          <div className="h-8 w-8 rounded-full border-2 border-[#161b22] bg-[#30363d] flex items-center justify-center text-[10px] font-bold text-white">+42</div>
                       </div>
                       <Button variant="primary" className="bg-[#1f6feb] text-xs h-9 px-6 rounded-xl hover:scale-105 transition-transform">Reserve Seat</Button>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          {/* Sidebar / Recommendations */}
          <div className="space-y-6">
             <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 lg:p-8">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                   <span className="material-symbols-outlined text-[#58a6ff]">local_fire_department</span>
                   Trending Events
                </h3>
                <div className="space-y-6">
                   {[1, 2, 3].map(item => (
                     <div key={item} className="flex gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center group-hover:border-[#1f6feb] transition-all">
                           <span className="material-symbols-outlined text-gray-500">terminal</span>
                        </div>
                        <div className="flex-1">
                           <h4 className="text-sm font-bold text-white truncate group-hover:text-[#58a6ff]">ByteCode Hackathon v2</h4>
                           <p className="text-[10px] text-gray-500 font-mono italic">24 Dec • {42 * item} Attendees</p>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-8">
                   <Button variant="outline" className="w-full text-xs h-10 border-[#30363d]">Browse Calendar</Button>
                </div>
             </div>

             <div className="bg-gradient-to-br from-[#1f6feb20] to-[#23863620] border border-[#30363d] rounded-2xl p-6 lg:p-10 text-center">
                <div className="w-16 h-16 rounded-3xl bg-[#0d1117] border-2 border-[#1f6feb] flex items-center justify-center text-[#1f6feb] mx-auto mb-6 shadow-2xl animate-bounce duration-[2000ms]">
                   <span className="material-symbols-outlined text-3xl">emoji_events</span>
                 </div>
                <h3 className="text-xl font-black text-white mb-2">Host an Event</h3>
                <p className="text-xs text-gray-400 mb-6">Gain institutional reach and inspire your community. Start your hosting journey today.</p>
                <Button className="w-full bg-[#1f6feb] text-xs h-10 font-bold">Initialize Draft</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
