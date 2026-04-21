import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedEvent, selectEventAnnouncements, fetchAnnouncementsThunk } from "../../../redux/slices/eventSlice";

export default function OverviewTab() {
  const dispatch = useDispatch();
  const event = useSelector(selectSelectedEvent);
  const announcements = useSelector(selectEventAnnouncements);

  useEffect(() => {
    if (event?._id) {
       dispatch(fetchAnnouncementsThunk(event._id));
    }
  }, [dispatch, event?._id]);

  if (!event) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in text-[#c9d1d9]">
      
      {/* Announcements Block */}
      {announcements && announcements.length > 0 && (
        <section>
          <div className="bg-[#1f6feb]/10 border border-[#1f6feb]/30 p-4 rounded-xl">
             <h2 className="text-lg font-bold text-[#58a6ff] mb-4 flex items-center gap-2">
               <span className="material-symbols-outlined">campaign</span> Live Updates
             </h2>
             <div className="space-y-3 max-h-40 overflow-y-auto">
               {announcements.map((ann, idx) => (
                 <div key={idx} className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg text-sm text-white">
                   <p>{ann.content || ann}</p>
                 </div>
               ))}
             </div>
          </div>
        </section>
      )}

      {/* Description Block */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 border-b border-[#30363d] pb-2">About This Event</h2>
        <div className="whitespace-pre-wrap leading-relaxed">
          {event.description || "No description provided."}
        </div>
      </section>

      {/* Rules / Guidelines Block */}
      {event.rules && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4 border-b border-[#30363d] pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e3b341]">gavel</span> 
            Rules & Guidelines
          </h2>
          <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg">
            <div className="whitespace-pre-wrap leading-relaxed text-[#8b949e]">
              {event.rules}
            </div>
          </div>
        </section>
      )}

      {/* Requirements / Tech Stack */}
      {event.requirements && event.requirements.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4 border-b border-[#30363d] pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1f6feb]">code</span>
            Technical Requirements
          </h2>
          <ul className="flex flex-wrap gap-2">
            {event.requirements.map((req, idx) => (
              <li key={idx} className="bg-[#1f6feb]/10 text-[#58a6ff] border border-[#1f6feb]/30 px-3 py-1 rounded text-sm">
                {req}
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {/* Prize Pool */}
      {event.prizePool && event.prizePool.length > 0 && event.prizePool.some(p => p.amount > 0 || p.description) && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4 border-b border-[#30363d] pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e3b341]">emoji_events</span>
            Prize Pool
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {event.prizePool.map((prize, idx) => (
              <div key={idx} className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl flex flex-col items-center text-center">
                <span className={`material-symbols-outlined text-4xl mb-2 ${idx === 0 ? 'text-[#e3b341]' : idx === 1 ? 'text-[#c0c0c0]' : idx === 2 ? 'text-[#cd7f32]' : 'text-[#8b949e]'}`}>
                  {idx === 0 ? 'military_tech' : 'workspace_premium'}
                </span>
                <h3 className="font-bold text-white">{prize.place || `${idx + 1} Place`}</h3>
                <p className="text-[#1dc964] font-black text-lg">{prize.amount ? `PKR ${prize.amount.toLocaleString()}` : ''}</p>
                {prize.description && <p className="text-xs text-[#8b949e] mt-1">{prize.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Date Map Timeline */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 border-b border-[#30363d] pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1dc964]">timeline</span>
          Schedule & Deadlines
        </h2>
        <div className="relative border-l-2 border-[#30363d] ml-3 space-y-6">
          {event.registrationDeadline && (
            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-[#e3b341] rounded-full -left-[7px] top-1.5 align-middle"></div>
              <h4 className="font-bold text-white">Registration Deadline</h4>
              <p className="text-sm text-[#8b949e]">{new Date(event.registrationDeadline).toLocaleString()}</p>
            </div>
          )}
          <div className="relative pl-6">
            <div className="absolute w-3 h-3 bg-[#1dc964] rounded-full -left-[7px] top-1.5 shadow-[0_0_10px_#1dc964]"></div>
            <h4 className="font-bold text-white">Event Starts</h4>
            <p className="text-sm text-[#8b949e]">{new Date(event.startAt).toLocaleString()}</p>
          </div>
          {event.submissionDeadline && (
            <div className="relative pl-6">
              <div className="absolute w-3 h-3 bg-[#58a6ff] rounded-full -left-[7px] top-1.5 align-middle"></div>
              <h4 className="font-bold text-white">Submission Deadline</h4>
              <p className="text-sm text-[#8b949e]">{new Date(event.submissionDeadline).toLocaleString()}</p>
            </div>
          )}
          <div className="relative pl-6">
            <div className="absolute w-3 h-3 bg-[#f85149] rounded-full -left-[7px] top-1.5 align-middle"></div>
            <h4 className="font-bold text-white">Event Ends</h4>
            <p className="text-sm text-[#8b949e]">{new Date(event.endAt).toLocaleString()}</p>
          </div>
        </div>
      </section>

    </div>
  );
}
