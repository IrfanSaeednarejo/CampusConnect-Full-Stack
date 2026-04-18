import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  selectAllMentors, 
  fetchMentors, 
  fetchMentorById,
  selectCurrentMentor,
  bookSessionThunk,
  selectMentoringActionLoading
} from "../../redux/slices/mentoringSlice";
import { toast } from "react-hot-toast";

export default function BookSession() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const urlMentorId = searchParams.get("mentorId") || useParams().mentorId;
  
  const allMentors = useSelector(selectAllMentors) || [];
  const currentMentor = useSelector(selectCurrentMentor);
  const isSubmitting = useSelector(selectMentoringActionLoading);

  const [selectedMentorId, setSelectedMentorId] = useState(urlMentorId || null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // If no specific mentor is selected, fetch the list so user can choose
    if (!selectedMentorId && allMentors.length === 0) {
      dispatch(fetchMentors({ limit: 50 }));
    }
  }, [dispatch, selectedMentorId, allMentors.length]);

  useEffect(() => {
    // If a specific mentor is selected (or passed via URL), fetch their details to get accurate availability slots
    if (selectedMentorId) {
      dispatch(fetchMentorById(selectedMentorId));
    }
  }, [dispatch, selectedMentorId]);

  const activeMentor = currentMentor?._id === selectedMentorId 
    ? currentMentor 
    : allMentors.find(m => m._id === selectedMentorId);

  const handleBookSession = async () => {
    if (!activeMentor || !selectedDate || !selectedTime || !topic) {
      toast.error("Please fill in all required fields!");
      return;
    }
    
    // Validate that the selected date is not in the past
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    if (selectedDateTime < new Date()) {
      toast.error("Cannot book a session in the past.");
      return;
    }

    const bookingData = {
      scheduledAt: selectedDateTime.toISOString(),
      topic,
      notes
    };

    try {
      await dispatch(bookSessionThunk({ mentorId: activeMentor._id, bookingData })).unwrap();
      toast.success("Session booked successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err || "Failed to book session");
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
          <p className="text-[#8b949e] text-base">Select a mentor and schedule your next session to receive personalized guidance.</p>
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
                     <p className="text-[#3fb950] font-bold">
                        {activeMentor.hourlyRate > 0 ? `${activeMentor.currency || 'PKR'} ${activeMentor.hourlyRate}/hr` : 'Free'}
                     </p>
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

          {/* Booking Form Column */}
          <div className="lg:col-span-2">
            {activeMentor ? (
              <div className="p-6 md:p-8 bg-[#161b22] border border-[#30363d] rounded-2xl flex flex-col gap-6 animate-fadeIn transition-all">
                
                <h3 className="text-xl font-bold text-white mb-2 pb-4 border-b border-[#30363d]">
                   Schedule with {activeMentor.userId?.profile?.firstName}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#e6edf3] text-sm font-medium">Select Date *</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="form-input w-full p-2.5 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#3fb950] focus:ring-1 focus:ring-[#3fb950] outline-none transition-colors"
                    />
                  </div>

                  {/* Time */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#e6edf3] text-sm font-medium">Select Time *</label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="form-input w-full p-2.5 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#3fb950] focus:ring-1 focus:ring-[#3fb950] outline-none transition-colors"
                    />
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
                   <div className="bg-[#3fb950]/10 px-3 py-1.5 rounded-lg border border-[#3fb950]/30">
                      <span className="text-[#3fb950] text-sm font-bold block">1 Hour Duration</span>
                   </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 mt-2">
                   <button
                    onClick={handleBookSession}
                    disabled={isSubmitting || !selectedDate || !selectedTime || !topic}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#238636] text-white font-semibold rounded-xl hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
