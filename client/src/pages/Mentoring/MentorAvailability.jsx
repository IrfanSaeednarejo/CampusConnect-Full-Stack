import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyMentorProfile,
  getMentorAvailability,
  setMentorAvailability
} from "../../api/mentoringApi";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import SharedFooter from "../../components/common/SharedFooter";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function MentorAvailability() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [availability, setAvailability] = useState({
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        const mentorRes = await getMyMentorProfile();
        const mentorData = mentorRes.data;
        setMentor(mentorData);

        if (mentorData?._id) {
          const availRes = await getMentorAvailability(mentorData._id);
          const backendAvail = availRes.data.availability || [];

          // Transform backend format to local state
          const newAvail = {
            sunday: [], monday: [], tuesday: [], wednesday: [],
            thursday: [], friday: [], saturday: []
          };

          backendAvail.forEach(slot => {
            const dayName = WEEKDAYS[slot.day].toLowerCase();
            newAvail[dayName].push({
              start: slot.startTime,
              end: slot.endTime,
            });
          });

          setAvailability(newAvail);
        }
      } catch (err) {
        console.error("Load availability error:", err);
        // If profile not found, redirect to registration
        if (err?.message?.toLowerCase().includes("not found") || err?.statusCode === 404) {
          navigate("/mentor-registration");
          return;
        }
        setError(err?.message || "Failed to load availability");
      } finally {
        setLoading(false);
      }
    };
    loadAvailability();
  }, []);

  const handleAddSlot = (day) => {
    const dayKey = day.toLowerCase();
    setAvailability({
      ...availability,
      [dayKey]: [
        ...(availability[dayKey] || []),
        { start: "09:00", end: "10:00" },
      ],
    });
  };

  const handleRemoveSlot = (day, index) => {
    const dayKey = day.toLowerCase();
    const newSlots = [...availability[dayKey]];
    newSlots.splice(index, 1);
    setAvailability({
      ...availability,
      [dayKey]: newSlots,
    });
  };

  const handleTimeChange = (day, index, field, value) => {
    const dayKey = day.toLowerCase();
    const newSlots = [...availability[dayKey]];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setAvailability({
      ...availability,
      [dayKey]: newSlots,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Transform local state to backend format
      const slots = [];
      WEEKDAYS.forEach((day, index) => {
        const dayKey = day.toLowerCase();
        availability[dayKey].forEach(slot => {
          slots.push({
            day: index,
            startTime: slot.start,
            endTime: slot.end,
          });
        });
      });

      await setMentorAvailability({ availability: slots });
      alert("Availability updated successfully!");
      navigate("/mentor/dashboard");
    } catch (err) {
      setError(err?.message || "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex h-screen w-full flex-col bg-background items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-secondary">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-text-primary group/design-root overflow-x-hidden bg-background">
      <div className="layout-container flex h-full grow flex-col">
        <MentorTopBar backPath="/mentor/dashboard" />

        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            <div className="mb-8">
              <h1 className="text-text-primary text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                Set Your Availability
              </h1>
              <p className="text-text-secondary text-base font-normal leading-normal">
                Define your mentoring time slots to let students know when you're available.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="p-4 bg-surface border border-border rounded-xl mb-8">
              <p className="text-text-secondary text-sm">
                💡 Tip: Add time slots for each day. Ensure start time is before end time.
              </p>
            </div>

            <div className="space-y-6">
              {WEEKDAYS.map((day) => (
                <div key={day} className="p-5 bg-surface border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-text-primary font-semibold text-lg">{day}</h3>
                    <button
                      onClick={() => handleAddSlot(day)}
                      className="flex items-center gap-2 px-3 py-2 bg-surface text-text-primary text-sm rounded border border-border hover:bg-surface-hover transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      Add Slot
                    </button>
                  </div>

                  {(availability[day.toLowerCase()] || []).length > 0 ? (
                    <div className="space-y-2">
                      {availability[day.toLowerCase()].map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-background rounded group">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleTimeChange(day, idx, 'start', e.target.value)}
                            className="px-3 py-2 bg-surface text-text-primary rounded border border-border focus:outline-none focus:border-primary"
                          />
                          <span className="text-text-secondary">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleTimeChange(day, idx, 'end', e.target.value)}
                            className="px-3 py-2 bg-surface text-text-primary rounded border border-border focus:outline-none focus:border-primary"
                          />
                          <button
                            onClick={() => handleRemoveSlot(day, idx)}
                            className="ml-auto text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm italic">No slots added for {day}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8 pb-10">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg transition-opacity flex-1 ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined">check</span>
                )}
                {saving ? 'Saving...' : 'Save Availability'}
              </button>
              <button
                onClick={() => navigate("/mentor/dashboard")}
                className="flex items-center gap-2 px-6 py-3 bg-surface text-text-primary font-bold border border-border rounded-lg hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </main>
        <SharedFooter />
      </div>
    </div>
  );
}
