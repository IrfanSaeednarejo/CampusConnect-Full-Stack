import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  selectAllMentors, 
  fetchMentors, 
  fetchMentorById,
  selectCurrentMentor,
  bookSessionThunk,
  selectMentoringActionLoading,
  fetchMentorAvailability,
  selectMentorAvailability
} from "../../redux/slices/mentoringSlice";
import { toast } from "react-hot-toast";

// Helper to generate the next 7 days starting from a given anchor date
const generateWeekDays = (anchorDate) => {
  const days = [];
  const start = new Date(anchorDate);
  start.setHours(0,0,0,0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

// Helper: Calculate conflict-free slots
const generateTimeSlots = (dateObj, dailyRules, bookedSlots, durationMinutes = 60) => {
  const slots = [];
  const now = new Date();
  
  if (!dailyRules || dailyRules.length === 0) return slots;
  
  dailyRules.forEach(rule => {
      const [startH, startM] = rule.startTime.split(':').map(Number);
      const [endH, endM] = rule.endTime.split(':').map(Number);
      
      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      
      while (currentMinutes + durationMinutes <= endMinutes) {
          const slotStart = new Date(dateObj);
          slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);
          
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
          
          // Check if slot is in the past
          const isPast = slotStart < now;
          
          // Check for overlap against booked slots
          const isBooked = bookedSlots?.some(b => {
             const bStart = new Date(b.startAt).getTime();
             const bEnd = new Date(b.endAt).getTime();
             // Overlap occurs if one starts before the other ends, and ends after the other starts
             return (slotStart.getTime() < bEnd && slotEnd.getTime() > bStart);
          });
          
          slots.push({
             start: slotStart,
             end: slotEnd,
             label: slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             disabled: isPast || isBooked
          });
          
          // advance by 30 mins to allow staggered intervals
          currentMinutes += 30; 
      }
  });
  
  return slots.sort((a,b) => a.start - b.start);
};

export default function BookSession() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const urlMentorId = searchParams.get("mentorId") || params.mentorId;
  
  const allMentors = useSelector(selectAllMentors) || [];
  const currentMentor = useSelector(selectCurrentMentor);
  const isSubmitting = useSelector(selectMentoringActionLoading);
  const availabilityData = useSelector(selectMentorAvailability);

  const [selectedMentorId, setSelectedMentorId] = useState(urlMentorId || null);
  
  // Slot Picker State
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDayObj, setSelectedDayObj] = useState(() => new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Form State
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  const activeMentor = currentMentor?._id === selectedMentorId 
    ? currentMentor 
    : allMentors.find(m => m._id === selectedMentorId);

  useEffect(() => {
    // If no specific mentor is selected, fetch the list so user can choose
    if (!selectedMentorId && allMentors.length === 0) {
      dispatch(fetchMentors({ limit: 50 }));
    }
  }, [dispatch, selectedMentorId, allMentors.length]);

  useEffect(() => {
    // If a specific mentor is selected, fetch their details AND their runtime availability (for bookedSlots)
    if (selectedMentorId) {
      dispatch(fetchMentorById(selectedMentorId));
      dispatch(fetchMentorAvailability({ 
        id: selectedMentorId, 
        params: { date: anchorDate.toISOString().split('T')[0] } 
      }));
    }
  }, [dispatch, selectedMentorId, anchorDate]);

  // Generate 7 day tabs based on anchor string
  const currentWeekDays = useMemo(() => generateWeekDays(anchorDate), [anchorDate]);

  // Compute calculated slots for the currently selected Day Tab
  const activeDaySlots = useMemo(() => {
    if (!activeMentor || !availabilityData) return [];
    
    // DB saves days 0 (Sun) to 6 (Sat)
    const dayOfWeek = selectedDayObj.getDay(); 
    const rulesForDay = (availabilityData.availability || []).filter(r => r.day === dayOfWeek);
    const booked = availabilityData.bookedSlots || [];
    
    return generateTimeSlots(selectedDayObj, rulesForDay, booked, 60); // Hardcode 1hr logic per MVP UI
  }, [selectedDayObj, activeMentor, availabilityData]);

  // Reset slot when day changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDayObj, activeMentor?._id]);

  const handleBookSession = async () => {
    if (!activeMentor || !selectedSlot || !topic) {
      toast.error("Please select a time slot and provide a topic!");
      return;
    }
    
    if (!activeMentor.verified || !activeMentor.isActive) {
      toast.error("This mentor is currently unavailable for bookings.");
      return;
    }

    const duration = 60; // 1 hour session
    const start = selectedSlot.start;
    const end = new Date(start.getTime() + duration * 60000);

    const bookingData = {
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      topic,
      notes,
      duration
    };

    try {
      await dispatch(bookSessionThunk({ mentorId: activeMentor._id, bookingData })).unwrap();
      toast.success("Session booked successfully!");
      navigate("/my-sessions");
    } catch (err) {
      toast.error(err || "Failed to book session");
    }
  };

  const handleNextWeek = () => {
    const next = new Date(anchorDate);
    next.setDate(next.getDate() + 7);
    setAnchorDate(next);
    setSelectedDayObj(next);
  };
  
  const handlePrevWeek = () => {
    const prev = new Date(anchorDate);
    prev.setDate(prev.getDate() - 7);
    if (prev < new Date(new Date().setHours(0,0,0,0))) {
        setAnchorDate(new Date());
        setSelectedDayObj(new Date());
    } else {
        setAnchorDate(prev);
        setSelectedDayObj(prev);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 lg:px-10 py-10">
      <div className="flex flex-col w-full max-w-6xl mx-auto gap-8">
        
        {/* Navigation Action */}
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
        </div>

        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <p className="text-[#e6edf3] text-3xl font-bold tracking-tight">Book a Mentoring Session</p>
          <p className="text-[#8b949e] text-base">Select a mentor and schedule your next session dynamically against their availability.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Mentor Selection Column */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h2 className="text-white font-semibold text-lg border-b border-[#30363d] pb-2">
              {urlMentorId ? "Selected Mentor" : "Select Mentor"}
            </h2>
            
            {urlMentorId && activeMentor ? (
              <div className="p-4 rounded-xl border-2 border-[#3fb950] bg-[#3fb950]/5 relative overflow-hidden transition-all">
                <div className="absolute top-0 right-0 p-2 bg-[#3fb950] rounded-bl-lg">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    {activeMentor.userId?.profile?.avatar ? (
                      <img src={activeMentor.userId.profile.avatar} alt="Mentor" className="w-12 h-12 rounded-full object-cover border border-[#30363d]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#3fb950] flex items-center justify-center text-xl font-bold text-white shrink-0">
                        {activeMentor.userId?.profile?.firstName?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-bold">{activeMentor.userId?.profile?.displayName || `${activeMentor.userId?.profile?.firstName} ${activeMentor.userId?.profile?.lastName}`}</h3>
                      <p className="text-[#8b949e] text-xs">{(activeMentor.categories && activeMentor.categories[0]) || "Mentor"}</p>
                    </div>
                  </div>
                  <div>
                     <p className="text-[#3fb950] font-bold mt-2">
                        {activeMentor.hourlyRate > 0 ? `${activeMentor.currency || 'PKR'} ${activeMentor.hourlyRate}/Hr` : 'Free'}
                     </p>
                     {!activeMentor.verified && (
                        <p className="text-red-400 text-xs mt-1 font-bold">⚠️ Mentor is unverified</p>
                     )}
                     {!activeMentor.isActive && activeMentor.verified && (
                        <p className="text-yellow-400 text-xs mt-1 font-bold">⚠️ Mentor is inactive</p>
                     )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {allMentors.map((mentor) => (
                  <div
                    key={mentor._id}
                    onClick={() => setSelectedMentorId(mentor._id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedMentorId === mentor._id
                        ? "bg-[#3fb950]/5 border-[#3fb950]"
                        : "bg-[#161b22] border-[#30363d] hover:border-[#8b949e]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {mentor.userId?.profile?.avatar ? (
                        <img src={mentor.userId.profile.avatar} alt="Mentor" className="w-10 h-10 rounded-full object-cover border border-[#30363d]" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2ea043] flex items-center justify-center text-lg font-bold text-white shrink-0">
                          {mentor.userId?.profile?.firstName?.[0] || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{mentor.userId?.profile?.displayName || `${mentor.userId?.profile?.firstName} ${mentor.userId?.profile?.lastName}`}</h3>
                        <p className="text-[#8b949e] text-xs">{mentor.hourlyRate > 0 ? `${mentor.currency || 'PKR'} ${mentor.hourlyRate}/Hr` : 'Free'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Form + Slot Engine Column */}
          <div className="lg:col-span-2">
            {activeMentor ? (
              <div className={`p-6 md:p-8 bg-[#161b22] border border-[#30363d] rounded-2xl flex flex-col gap-6 animate-fadeIn transition-all ${(!activeMentor.verified || !activeMentor.isActive) && 'opacity-70 pointer-events-none'}`}>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#30363d] pb-4 mb-2 gap-4">
                  <h3 className="text-xl font-bold text-white">
                    Schedule with {activeMentor.userId?.profile?.firstName}
                  </h3>
                  
                  {/* Week Navigation */}
                  <div className="flex items-center gap-3 bg-[#0d1117] rounded-lg p-1 border border-[#30363d]">
                     <button onClick={handlePrevWeek} className="p-1 rounded hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors" title="Previous Week">
                         <span className="material-symbols-outlined text-sm">chevron_left</span>
                     </button>
                     <span className="text-xs font-semibold text-[#8b949e] uppercase w-24 text-center">
                        {anchorDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </span>
                     <button onClick={handleNextWeek} className="p-1 rounded hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors" title="Next Week">
                         <span className="material-symbols-outlined text-sm">chevron_right</span>
                     </button>
                  </div>
                </div>

                {/* --- THE SLOT ENGINE UI (OPTION A) --- */}
                <div className="flex flex-col gap-4 bg-[#0d1117] p-5 rounded-xl border border-[#30363d]">
                  
                  {/* Day Tabs */}
                  <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
                     {currentWeekDays.map((dateObj, idx) => {
                       const isSelected = selectedDayObj.getDate() === dateObj.getDate() && selectedDayObj.getMonth() === dateObj.getMonth();
                       const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                       const dayNum = dateObj.getDate();
                       
                       return (
                         <button 
                           key={idx}
                           onClick={() => setSelectedDayObj(dateObj)}
                           className={`flex flex-col items-center justify-center min-w-[64px] py-3 rounded-xl border transition-all ${
                             isSelected 
                               ? 'bg-[#3fb950] border-[#3fb950] text-[#0d1117]' 
                               : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-white'
                           }`}
                         >
                           <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-[#0d1117]/80' : ''}`}>{dayName}</span>
                           <span className="text-lg font-bold">{dayNum}</span>
                         </button>
                       )
                     })}
                  </div>
                  
                  {/* Slots Grid */}
                  <div className="mt-4">
                     <p className="text-[#8b949e] text-xs font-bold uppercase mb-3 px-1">Available 1-Hr Slots</p>
                     
                     {activeDaySlots.length > 0 ? (
                       <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                         {activeDaySlots.map((slot, idx) => (
                           <button
                             key={idx}
                             disabled={slot.disabled}
                             onClick={() => setSelectedSlot(slot)}
                             className={`py-2 px-1 rounded-lg text-sm font-semibold border transition-all text-center ${
                               slot.disabled
                                 ? 'bg-[#0d1117] border-[#30363d]/50 text-[#8b949e]/30 cursor-not-allowed line-through'
                                 : selectedSlot === slot
                                   ? 'bg-[#3fb950] border-[#3fb950] text-[#0d1117] shadow-lg shadow-[#3fb950]/20'
                                   : 'bg-[#161b22] border-[#30363d] text-white hover:border-[#3fb950] hover:text-[#3fb950]'
                             }`}
                           >
                             {slot.label}
                           </button>
                         ))}
                       </div>
                     ) : (
                       <div className="py-8 bg-[#161b22] border border-dashed border-[#30363d] rounded-xl flex flex-col items-center justify-center text-center">
                          <span className="material-symbols-outlined text-[#8b949e] mb-2 text-3xl">event_busy</span>
                          <p className="text-[#8b949e] font-medium">No availability scheduled for this day.</p>
                       </div>
                     )}
                  </div>

                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#e6edf3] text-sm font-medium">Topic or Focus Area *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Code Review, Resume Prep, Career Advice..."
                    className="form-input w-full p-2.5 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#3fb950] focus:ring-1 focus:ring-[#3fb950] outline-none placeholder:text-[#8b949e] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#e6edf3] text-sm font-medium">Message for the Mentor (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific questions or context you want to provide beforehand?"
                    className="form-input w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#3fb950] focus:ring-1 focus:ring-[#3fb950] outline-none placeholder:text-[#8b949e] resize-y min-h-[100px] transition-colors"
                  />
                </div>

                {/* Session Cost View */}
                <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d] mt-2 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[#8b949e] text-sm font-medium">Session Cost</span>
                      <span className="text-white text-lg font-bold">
                         {activeMentor.hourlyRate > 0 ? `${activeMentor.currency || 'PKR'} ${activeMentor.hourlyRate}` : 'Free'}
                      </span>
                   </div>
                   <div className="flex items-center gap-3">
                      {selectedSlot && (
                         <div className="hidden sm:flex items-center gap-2 text-xs font-bold bg-[#161b22] px-3 py-1.5 rounded-lg border border-[#30363d] text-[#8b949e]">
                           <span className="material-symbols-outlined text-sm">schedule</span>
                           {selectedDayObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {selectedSlot.label}
                         </div>
                      )}
                      <div className="bg-[#3fb950]/10 px-3 py-1.5 rounded-lg border border-[#3fb950]/30">
                         <span className="text-[#3fb950] text-sm font-bold block">1 Hour Duration</span>
                      </div>
                   </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 mt-2">
                   <button
                    onClick={handleBookSession}
                    disabled={isSubmitting || !selectedSlot || !topic || !activeMentor.verified || !activeMentor.isActive}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#238636] text-white font-semibold rounded-xl hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
                   >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                           <span className="material-symbols-outlined font-normal">calendar_add_on</span>
                           Confirm Booking
                        </>
                    )}
                   </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-[#161b22] border border-[#30363d] rounded-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-[#0d1117] flex items-center justify-center mb-4 border border-[#30363d]">
                   <span className="material-symbols-outlined text-[32px] text-[#8b949e]">person_add</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Select a Mentor</h3>
                <p className="text-[#8b949e]">Choose a mentor from the list to view their availability and book a session.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
