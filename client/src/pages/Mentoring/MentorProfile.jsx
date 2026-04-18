import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  fetchMyMentorProfile, 
  setMentorAvailability, 
  selectMyMentorProfile, 
  selectMentoringActionLoading 
} from "../../redux/slices/mentoringSlice";
import { toast } from "react-hot-toast";

const WEEKDAYS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

export default function MentorProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mentorProfile = useSelector(selectMyMentorProfile);
  const actionLoading = useSelector(selectMentoringActionLoading);

  // Local state structure: map of day integer -> array of { startTime, endTime }
  const [availability, setAvailabilityState] = useState({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  });

  useEffect(() => {
    dispatch(fetchMyMentorProfile());
  }, [dispatch]);

  // Sync profile data to local state
  useEffect(() => {
    if (mentorProfile?.availability) {
      const newAvailability = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
      mentorProfile.availability.forEach((slot) => {
        newAvailability[slot.day].push({
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      });
      setAvailabilityState(newAvailability);
    }
  }, [mentorProfile]);

  const handleAddSlot = (dayValue) => {
    setAvailabilityState((prev) => ({
      ...prev,
      [dayValue]: [
        ...prev[dayValue],
        { startTime: "10:00", endTime: "11:00" },
      ],
    }));
  };

  const updateSlot = (dayValue, index, field, value) => {
    setAvailabilityState((prev) => {
      const updatedSlots = [...prev[dayValue]];
      updatedSlots[index] = { ...updatedSlots[index], [field]: value };
      return { ...prev, [dayValue]: updatedSlots };
    });
  };

  const removeSlot = (dayValue, index) => {
    setAvailabilityState((prev) => {
      const updatedSlots = prev[dayValue].filter((_, idx) => idx !== index);
      return { ...prev, [dayValue]: updatedSlots };
    });
  };

  const handleSave = async () => {
    // Flatten back into array
    const scheduleArray = [];
    Object.keys(availability).forEach((dayKey) => {
      const dayValue = parseInt(dayKey);
      availability[dayValue].forEach((slot) => {
        scheduleArray.push({
          day: dayValue,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      });
    });

    try {
      await dispatch(setMentorAvailability({ availability: scheduleArray })).unwrap();
      toast.success("Availability updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err || "Failed to save availability");
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-4 lg:p-10 overflow-y-auto">
      <div className="flex w-full max-w-4xl mx-auto flex-col gap-6">
        
        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#c9d1d9] tracking-tight">
            Manage Availability
          </h1>
          <p className="text-[#8b949e]">Define your mentoring time slots to let students know when you're available.</p>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-xl mt-2">
          <p className="text-[#3fb950] text-sm font-medium">
            💡 Tip: Add time slots for each day when you're available. Students will only be able to book sessions during these times. Ensure your slots do not overlap!
          </p>
        </div>

        {/* Availability Schedule */}
        <div className="space-y-6 mt-2">
          {WEEKDAYS.map((dayObj) => {
            const dayValue = dayObj.value;
            const slots = availability[dayValue] || [];
            
            return (
              <div
                key={dayValue}
                className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-lg">{dayObj.label}</h3>
                  <button
                    onClick={() => handleAddSlot(dayValue)}
                    className="flex items-center gap-2 px-3 py-1 bg-[#30363d] text-white text-sm rounded hover:bg-[#404851] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Slot
                  </button>
                </div>

                {slots.length > 0 ? (
                  <div className="space-y-3">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[#0d1117] rounded-xl border border-[#30363d]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(dayValue, idx, "startTime", e.target.value)}
                            className="px-3 py-2 flex-1 bg-[#30363d] text-white rounded-lg border border-[#404851] focus:outline-none focus:border-[#3fb950] transition-colors"
                          />
                          <span className="text-[#8b949e] font-medium text-sm">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(dayValue, idx, "endTime", e.target.value)}
                            className="px-3 py-2 flex-1 bg-[#30363d] text-white rounded-lg border border-[#404851] focus:outline-none focus:border-[#3fb950] transition-colors"
                          />
                        </div>
                        <button 
                          onClick={() => removeSlot(dayValue, idx)}
                          className="sm:ml-auto p-2 text-[#8b949e] bg-[#30363d] sm:bg-transparent rounded-lg hover:text-[#ff7b72] hover:bg-[#da3633]/10 transition-colors flex justify-center"
                          title="Remove slot"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#8b949e] text-sm italic">
                    No slots added for {dayObj.label}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleSave}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#238636] text-white font-bold rounded-xl hover:bg-[#2ea043] transition-colors disabled:opacity-50"
          >
            {actionLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined">check</span>
                Save Availability
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            disabled={actionLoading}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-[#30363d] text-white font-bold rounded-xl hover:bg-[#404851] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
