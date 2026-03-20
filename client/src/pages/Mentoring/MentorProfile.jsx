import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function MentorProfile() {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({
    monday: [{ start: "10:00", end: "12:00", available: true }],
    tuesday: [{ start: "14:00", end: "16:00", available: true }],
    wednesday: [{ start: "10:00", end: "12:00", available: true }],
    thursday: [{ start: "14:00", end: "16:00", available: true }],
    friday: [{ start: "10:00", end: "17:00", available: true }],
    saturday: [],
    sunday: [],
  });

  const handleAddSlot = (day) => {
    const dayKey = day.toLowerCase();
    setAvailability({
      ...availability,
      [dayKey]: [
        ...(availability[dayKey] || []),
        { start: "10:00", end: "11:00", available: true },
      ],
    });
  };

  const handleSave = () => {
    alert("Availability updated successfully!");
    navigate("/mentor/dashboard");
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                Set Your Availability
              </h1>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                Define your mentoring time slots to let students know when
                you're available
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl mb-8">
              <p className="text-[#9eb7a9] text-sm">
                💡 Tip: Add time slots for each day when you're available.
                Students will only be able to book sessions during these times.
              </p>
            </div>

            {/* Availability Schedule */}
            <div className="space-y-6">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg">{day}</h3>
                    <button
                      onClick={() => handleAddSlot(day)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#30363d] text-white text-sm rounded hover:bg-[#404851] transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">
                        add
                      </span>
                      Add Slot
                    </button>
                  </div>

                  {(availability[day.toLowerCase()] || []).length > 0 ? (
                    <div className="space-y-2">
                      {availability[day.toLowerCase()].map((slot, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-[#0d1117] rounded"
                        >
                          <input
                            type="time"
                            value={slot.start}
                            className="px-3 py-2 bg-[#30363d] text-white rounded border border-[#404851] focus:outline-none focus:border-[#1dc964]"
                          />
                          <span className="text-[#9eb7a9]">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            className="px-3 py-2 bg-[#30363d] text-white rounded border border-[#404851] focus:outline-none focus:border-[#1dc964]"
                          />
                          <button className="ml-auto text-[#9eb7a9] hover:text-red-400 transition-colors">
                            <span className="material-symbols-outlined">
                              close
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#9eb7a9] text-sm italic">
                      No slots added for {day}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-[#1dc964] text-[#112118] font-bold rounded-lg hover:opacity-90 transition-opacity flex-1"
              >
                <span className="material-symbols-outlined">check</span>
                Save Availability
              </button>
              <button
                onClick={() => navigate("/mentor/dashboard")}
                className="flex items-center gap-2 px-6 py-3 bg-[#30363d] text-white font-bold rounded-lg hover:bg-[#404851] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
