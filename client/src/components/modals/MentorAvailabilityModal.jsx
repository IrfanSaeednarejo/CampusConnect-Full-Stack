import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseModal from "../shared/BaseModal";
import {
  getMyMentorProfile,
  setMentorAvailability
} from "../../api/mentoringApi";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function MentorAvailabilityModal({ closeModal }) {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({
    sunday: [], monday: [], tuesday: [], wednesday: [],
    thursday: [], friday: [], saturday: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        const mentorRes = await getMyMentorProfile();
        const mentorData = mentorRes.data;

        if (mentorData?._id) {
          // Use availability directly from the mentor profile response
          // (the public getMentorAvailability endpoint requires verified:true,
          //  which new mentors don't have yet)
          const backendAvail = mentorData.availability || [];

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
        console.error("[MentorAvailability] Load error:", err);
        // Detect "mentor profile not found" across all error shapes
        const status = err?.statusCode || err?.response?.status || err?.status;
        const msg = (err?.message || err?.response?.data?.message || err?.data?.message || "").toLowerCase();
        const isNotRegistered = status === 404 || msg.includes("register as a mentor") || msg.includes("not found");

        if (isNotRegistered) {
          setNeedsRegistration(true);
        } else {
          setError(err?.message || err?.response?.data?.message || "Failed to load availability");
        }
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
      [dayKey]: [...(availability[dayKey] || []), { start: "09:00", end: "10:00" }],
    });
  };

  const handleRemoveSlot = (day, index) => {
    const dayKey = day.toLowerCase();
    const newSlots = [...availability[dayKey]];
    newSlots.splice(index, 1);
    setAvailability({ ...availability, [dayKey]: newSlots });
  };

  const handleTimeChange = (day, index, field, value) => {
    const dayKey = day.toLowerCase();
    const newSlots = [...availability[dayKey]];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setAvailability({ ...availability, [dayKey]: newSlots });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

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
      closeModal();
    } catch (err) {
      setError(err?.message || "Failed to save availability. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal size="xl">
      <div className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#30363d] shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Set Availability</h2>
            <p className="text-[#8b949e] text-sm mt-1">Define your mentoring time slots</p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 text-[#8b949e] hover:text-white rounded-full hover:bg-[#30363d] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm shrink-0">
            {error}
          </div>
        )}

        {needsRegistration ? (
          /* Registration Prompt */
          <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
            <div className="text-[#e3b341]">
              <span className="material-symbols-outlined" style={{ fontSize: "64px" }}>
                person_add
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 max-w-md">
              <p className="text-white text-lg font-bold">Complete Your Mentor Profile</p>
              <p className="text-[#8b949e] text-sm">
                You have the mentor role, but you haven't created your mentor profile yet.
                Register as a mentor to set your expertise, hourly rate, and availability.
              </p>
            </div>
            <button
              onClick={() => { closeModal(); navigate("/mentor-registration"); }}
              className="flex items-center gap-2 px-6 py-3 bg-[#1dc964] text-[#112118] rounded-lg hover:opacity-90 transition-opacity font-bold"
            >
              <span className="material-symbols-outlined text-sm">how_to_reg</span>
              Complete Mentor Registration
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#1dc964] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-[#8b949e] text-sm">Loading schedule...</p>
                </div>
              ) : (
                WEEKDAYS.map((day) => (
                  <div key={day} className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1dc964] text-lg">calendar_month</span>
                        {day}
                      </h3>
                      <button
                        onClick={() => handleAddSlot(day)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] text-white text-xs font-medium rounded hover:bg-[#30363d] transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Slot
                      </button>
                    </div>

                    {(availability[day.toLowerCase()] || []).length > 0 ? (
                      <div className="space-y-2">
                        {availability[day.toLowerCase()].map((slot, idx) => (
                          <div key={idx} className="flex flex-wrap items-center gap-3 p-2.5 bg-[#161b22] border border-[#21262d] rounded-lg group">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => handleTimeChange(day, idx, 'start', e.target.value)}
                              className="px-2 py-1.5 bg-[#21262d] text-sm text-white rounded outline-none focus:ring-1 focus:ring-[#1dc964]"
                            />
                            <span className="text-[#8b949e] text-sm font-medium">to</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => handleTimeChange(day, idx, 'end', e.target.value)}
                              className="px-2 py-1.5 bg-[#21262d] text-sm text-white rounded outline-none focus:ring-1 focus:ring-[#1dc964]"
                            />
                            <button
                              onClick={() => handleRemoveSlot(day, idx)}
                              className="ml-auto text-[#8b949e] hover:text-red-400 opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#21262d]"
                              title="Remove time slot"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#8b949e] text-xs font-medium italic pl-1">Unavailable</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-[#30363d] shrink-0">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 font-medium text-[#c9d1d9] hover:text-white rounded-lg hover:bg-[#30363d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1dc964] text-[#112118] rounded-lg hover:opacity-90 transition-opacity font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-[#112118] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                {saving ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
}
