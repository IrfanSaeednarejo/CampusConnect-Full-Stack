import React from "react";
import { useSelector } from "react-redux";
import { selectSelectedEvent } from "../../../../redux/slices/eventSlice";

export default function OverviewTab() {
  const event = useSelector(selectSelectedEvent);

  if (!event) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in text-[#c9d1d9]">
      
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
      
      {/* Date Map Timeline Placeholder */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 border-b border-[#30363d] pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1dc964]">timeline</span>
          Schedule
        </h2>
        <div className="relative border-l-2 border-[#30363d] ml-3 space-y-6">
          <div className="relative pl-6">
            <div className="absolute w-3 h-3 bg-[#1dc964] rounded-full -left-[7px] top-1.5 shadow-[0_0_10px_#1dc964]"></div>
            <h4 className="font-bold text-white">Event Starts</h4>
            <p className="text-sm text-[#8b949e]">{new Date(event.startAt).toLocaleString()}</p>
          </div>
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
