import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMyMentorProfile,
  setMentorAvailability,
  selectMyMentorProfile,
  selectMentoringActionLoading,
} from "../../redux/slices/mentoringSlice";
import { toast } from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";
import Button from "../../components/common/Button";

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
  const isDark = useHomeTheme();
  const mentorProfile = useSelector(selectMyMentorProfile);
  const actionLoading = useSelector(selectMentoringActionLoading);

  const [availability, setAvailabilityState] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  });

  useEffect(() => {
    dispatch(fetchMyMentorProfile());
  }, [dispatch]);

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
      [dayValue]: [...prev[dayValue], { startTime: "10:00", endTime: "11:00" }],
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

  const pageClass = isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light";
  const cardClass = isDark
    ? "border-border-dark bg-surface-dark"
    : "border-border-light bg-surface-light shadow-[0_18px_40px_rgba(15,23,42,0.08)]";
  const slotClass = isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-slate-50";
  const inputClass = isDark
    ? "border-border-dark bg-container-dark text-text-primary-dark"
    : "border-border-light bg-surface-light text-text-primary-light";
  const mutedClass = isDark ? "text-text-secondary-dark" : "text-text-secondary-light";
  const headingClass = isDark ? "text-text-primary-dark" : "text-text-primary-light";

  if (mentorProfile !== null && !mentorProfile?.verified) {
    return (
      <div className={`flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center ${pageClass}`}>
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 text-warning">
          <span className="material-symbols-outlined text-4xl">lock_clock</span>
        </div>
        <h2 className={`mb-2 text-xl font-bold ${headingClass}`}>Pending Verification</h2>
        <p className={`max-w-sm text-sm leading-relaxed ${mutedClass}`}>
          Your mentor profile is under review. Availability management will be unlocked once an admin approves your application.
        </p>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="primary"
          size="md"
          className="mt-6"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full h-full p-4 lg:p-10 overflow-y-auto ${pageClass}`}>
      <div className="flex w-full max-w-4xl mx-auto flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className={`text-3xl font-bold tracking-tight ${headingClass}`}>
            Manage Availability
          </h1>
          <p className={mutedClass}>
            Define your mentoring time slots to let students know when you're available.
          </p>
        </div>

        <div className={`mt-2 rounded-xl border p-4 ${isDark ? "border-info/25 bg-info/10" : "border-info/20 bg-info/5"}`}>
          <p className="text-sm font-medium text-info">
            Tip: Add time slots for each day when you're available. Students will only be able to book sessions during these times. Ensure your slots do not overlap.
          </p>
        </div>

        <div className="space-y-6 mt-2">
          {WEEKDAYS.map((dayObj) => {
            const dayValue = dayObj.value;
            const slots = availability[dayValue] || [];

            return (
              <div key={dayValue} className={`p-5 border rounded-2xl ${cardClass}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${headingClass}`}>{dayObj.label}</h3>
                  <Button
                    onClick={() => handleAddSlot(dayValue)}
                    variant="secondary"
                    size="sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Slot
                  </Button>
                </div>

                {slots.length > 0 ? (
                  <div className="space-y-3">
                    {slots.map((slot, idx) => (
                      <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border ${slotClass}`}>
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(dayValue, idx, "startTime", e.target.value)}
                            className={`flex-1 rounded-lg border px-3 py-2 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${inputClass}`}
                          />
                          <span className={`text-sm font-medium ${mutedClass}`}>to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(dayValue, idx, "endTime", e.target.value)}
                            className={`flex-1 rounded-lg border px-3 py-2 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${inputClass}`}
                          />
                        </div>
                        <button
                          onClick={() => removeSlot(dayValue, idx)}
                          className={`flex justify-center rounded-lg p-2 transition-colors sm:ml-auto ${
                            isDark
                              ? "bg-container-dark text-text-secondary-dark hover:bg-danger/10 hover:text-danger sm:bg-transparent"
                              : "bg-slate-100 text-slate-500 hover:bg-danger/5 hover:text-danger sm:bg-transparent"
                          }`}
                          title="Remove slot"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm italic ${mutedClass}`}>
                    No slots added for {dayObj.label}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4">
          <Button
            onClick={handleSave}
            disabled={actionLoading}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            {actionLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined">check</span>
                Save Availability
              </>
            )}
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            disabled={actionLoading}
            variant="secondary"
            size="lg"
            className="max-w-[200px] flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
