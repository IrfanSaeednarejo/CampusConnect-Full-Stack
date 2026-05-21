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
  selectMentorAvailability,
} from "../../redux/slices/mentoringSlice";
import { toast } from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";

const generateWeekDays = (anchorDate) => {
  const days = [];
  const start = new Date(anchorDate);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

const generateTimeSlots = (dateObj, dailyRules, bookedSlots, durationMinutes = 60) => {
  const slots = [];
  const now = new Date();

  if (!dailyRules || dailyRules.length === 0) return slots;

  dailyRules.forEach((rule) => {
    const [startH, startM] = rule.startTime.split(":").map(Number);
    const [endH, endM] = rule.endTime.split(":").map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + durationMinutes <= endMinutes) {
      const slotStart = new Date(dateObj);
      slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);

      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
      const isPast = slotStart < now;

      const isBooked = bookedSlots?.some((b) => {
        const bStart = new Date(b.startAt).getTime();
        const bEnd = new Date(b.endAt).getTime();
        return slotStart.getTime() < bEnd && slotEnd.getTime() > bStart;
      });

      slots.push({
        start: slotStart,
        end: slotEnd,
        label: slotStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        disabled: isPast || isBooked,
      });

      currentMinutes += 30;
    }
  });

  return slots.sort((a, b) => a.start - b.start);
};

export default function BookSession() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const urlMentorId = searchParams.get("mentorId") || params.mentorId;

  const allMentors = useSelector(selectAllMentors) || [];
  const currentMentor = useSelector(selectCurrentMentor);
  const isSubmitting = useSelector(selectMentoringActionLoading);
  const availabilityData = useSelector(selectMentorAvailability);

  const [selectedMentorId, setSelectedMentorId] = useState(urlMentorId || null);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDayObj, setSelectedDayObj] = useState(() => new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  const activeMentor =
    currentMentor?._id === selectedMentorId
      ? currentMentor
      : allMentors.find((m) => m._id === selectedMentorId);

  useEffect(() => {
    if (!selectedMentorId && allMentors.length === 0) {
      dispatch(fetchMentors({ limit: 50 }));
    }
  }, [dispatch, selectedMentorId, allMentors.length]);

  useEffect(() => {
    if (selectedMentorId) {
      dispatch(fetchMentorById(selectedMentorId));
      dispatch(
        fetchMentorAvailability({
          id: selectedMentorId,
          params: { date: anchorDate.toISOString().split("T")[0] },
        })
      );
    }
  }, [dispatch, selectedMentorId, anchorDate]);

  const currentWeekDays = useMemo(() => generateWeekDays(anchorDate), [anchorDate]);
  const mentorHasAvailability = useMemo(
    () => (availabilityData?.availability || []).length > 0,
    [availabilityData]
  );

  const activeDaySlots = useMemo(() => {
    if (!activeMentor || !availabilityData) return [];
    const dayOfWeek = selectedDayObj.getDay();
    const rulesForDay = (availabilityData.availability || []).filter((r) => r.day === dayOfWeek);
    const booked = availabilityData.bookedSlots || [];
    return generateTimeSlots(selectedDayObj, rulesForDay, booked, 60);
  }, [selectedDayObj, activeMentor, availabilityData]);

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

    const duration = 60;
    const start = selectedSlot.start;
    const end = new Date(start.getTime() + duration * 60000);

    const bookingData = {
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      topic,
      notes,
      duration,
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
    if (prev < new Date(new Date().setHours(0, 0, 0, 0))) {
      setAnchorDate(new Date());
      setSelectedDayObj(new Date());
    } else {
      setAnchorDate(prev);
      setSelectedDayObj(prev);
    }
  };

  const pageClass = isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light";
  const panelClass = isDark
    ? "border-border-dark bg-surface-dark"
    : "bg-white border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)]";
  const nestedPanelClass = isDark ? "border-border-dark bg-background-dark" : "bg-slate-50 border-slate-200";
  const mutedText = isDark ? "text-text-secondary-dark" : "text-slate-500";
  const headingText = isDark ? "text-text-primary-dark" : "text-slate-900";
  const inputClass = isDark
    ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark"
    : "bg-white text-slate-900 border-slate-300 placeholder:text-slate-400";
  const bookingDisabledReason = !activeMentor
    ? "Select a mentor to continue."
    : !activeMentor.verified || !activeMentor.isActive
      ? "This mentor is not currently accepting bookings."
      : !mentorHasAvailability
        ? "This mentor has not added any availability yet."
        : !selectedSlot
          ? "Select an available 1-hour slot to enable booking."
          : !topic.trim()
            ? "Enter a topic or focus area to continue."
            : null;

  return (
    <div className={`flex flex-col px-4 lg:px-10 py-10 ${pageClass}`}>
      <div className="flex flex-col w-full max-w-6xl mx-auto gap-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 transition-colors ${isDark ? "text-text-secondary-dark hover:text-text-primary-dark" : "text-slate-500 hover:text-slate-900"}`}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className={`text-3xl font-bold tracking-tight ${headingText}`}>Book a Mentoring Session</p>
          <p className={`text-base ${mutedText}`}>
            Select a mentor and schedule your next session dynamically against their availability.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h2 className={`border-b pb-2 text-lg font-semibold ${isDark ? "border-border-dark text-text-primary-dark" : "border-slate-200 text-slate-900"}`}>
              {urlMentorId ? "Selected Mentor" : "Select Mentor"}
            </h2>

            {urlMentorId && activeMentor ? (
              <div className={`relative overflow-hidden rounded-xl border-2 border-primary/30 p-4 transition-all ${isDark ? "bg-primary/10" : "bg-primary/5"}`}>
                <div className="absolute top-0 right-0 rounded-bl-lg bg-primary p-2">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    {activeMentor.userId?.profile?.avatar ? (
                      <img
                        src={activeMentor.userId.profile.avatar}
                        alt="Mentor"
                        className={`h-12 w-12 rounded-full border object-cover ${isDark ? "border-border-dark" : "border-slate-200"}`}
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                        {activeMentor.userId?.profile?.firstName?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {activeMentor.userId?.profile?.displayName ||
                          `${activeMentor.userId?.profile?.firstName} ${activeMentor.userId?.profile?.lastName}`}
                      </h3>
                      <p className={`text-xs ${mutedText}`}>
                        {(activeMentor.categories && activeMentor.categories[0]) || "Mentor"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mt-2 font-bold text-primary">
                      {activeMentor.hourlyRate > 0
                        ? `${activeMentor.currency || "PKR"} ${activeMentor.hourlyRate}/Hr`
                        : "Free"}
                    </p>
                    {!activeMentor.verified && <p className="mt-1 text-xs font-bold text-danger">Mentor is unverified</p>}
                    {!activeMentor.isActive && activeMentor.verified && (
                      <p className="mt-1 text-xs font-bold text-warning">Mentor is inactive</p>
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
                        ? isDark
                          ? "bg-primary/5 border-primary"
                          : "border-primary/30 bg-primary/5"
                        : `${panelClass} ${isDark ? "hover:border-slate-500" : "hover:border-slate-300"}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {mentor.userId?.profile?.avatar ? (
                        <img
                          src={mentor.userId.profile.avatar}
                          alt="Mentor"
                          className={`h-10 w-10 rounded-full border object-cover ${isDark ? "border-border-dark" : "border-slate-200"}`}
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                          {mentor.userId?.profile?.firstName?.[0] || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                          {mentor.userId?.profile?.displayName ||
                            `${mentor.userId?.profile?.firstName} ${mentor.userId?.profile?.lastName}`}
                        </h3>
                        <p className={`text-xs ${mutedText}`}>
                          {mentor.hourlyRate > 0 ? `${mentor.currency || "PKR"} ${mentor.hourlyRate}/Hr` : "Free"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {activeMentor ? (
              <div className={`p-6 md:p-8 border rounded-2xl flex flex-col gap-6 animate-fadeIn transition-all ${panelClass} ${(!activeMentor.verified || !activeMentor.isActive) && "opacity-70 pointer-events-none"}`}>
                <div className={`mb-2 flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center ${isDark ? "border-border-dark" : "border-slate-200"}`}>
                  <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Schedule with {activeMentor.userId?.profile?.firstName}
                  </h3>

                  <div className={`flex items-center gap-3 rounded-lg p-1 border ${nestedPanelClass}`}>
                    <button
                      onClick={handlePrevWeek}
                      className={`rounded p-1 transition-colors ${isDark ? "text-text-secondary-dark hover:bg-container-dark hover:text-text-primary-dark" : "text-slate-500 hover:bg-slate-200 hover:text-slate-900"}`}
                      title="Previous Week"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <span className={`text-xs font-semibold uppercase w-24 text-center ${mutedText}`}>
                      {anchorDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <button
                      onClick={handleNextWeek}
                      className={`rounded p-1 transition-colors ${isDark ? "text-text-secondary-dark hover:bg-container-dark hover:text-text-primary-dark" : "text-slate-500 hover:bg-slate-200 hover:text-slate-900"}`}
                      title="Next Week"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>

                <div className={`flex flex-col gap-4 p-5 rounded-xl border ${nestedPanelClass}`}>
                  <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
                    {currentWeekDays.map((dateObj, idx) => {
                      const isSelected =
                        selectedDayObj.getDate() === dateObj.getDate() &&
                        selectedDayObj.getMonth() === dateObj.getMonth();
                      const dayName = dateObj.toLocaleDateString(undefined, { weekday: "short" });
                      const dayNum = dateObj.getDate();

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDayObj(dateObj)}
                          className={`flex flex-col items-center justify-center min-w-[64px] py-3 rounded-xl border transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : isDark
                                ? "border-border-dark bg-surface-dark text-text-secondary-dark hover:border-slate-500 hover:text-text-primary-dark"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-white/80" : ""}`}>{dayName}</span>
                          <span className="text-lg font-bold">{dayNum}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <p className={`text-xs font-bold uppercase mb-3 px-1 ${mutedText}`}>Available 1-Hr Slots</p>

                    {activeDaySlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {activeDaySlots.map((slot, idx) => (
                          <button
                            key={idx}
                            disabled={slot.disabled}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-1 rounded-lg text-sm font-semibold border transition-all text-center ${
                              slot.disabled
                                ? isDark
                                  ? "cursor-not-allowed border-border-dark/50 bg-background-dark text-text-secondary-dark/40 line-through"
                                  : "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed line-through"
                                : selectedSlot === slot
                                  ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                                  : isDark
                                    ? "border-border-dark bg-surface-dark text-text-primary-dark hover:border-primary/60 hover:text-primary"
                                    : "bg-white border-slate-200 text-slate-900 hover:border-primary/40 hover:text-primary"
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className={`py-8 border border-dashed rounded-xl flex flex-col items-center justify-center text-center ${panelClass}`}>
                        <span className={`material-symbols-outlined mb-2 text-3xl ${mutedText}`}>event_busy</span>
                        <p className={`font-medium ${mutedText}`}>
                          {mentorHasAvailability
                            ? "No availability scheduled for this day."
                            : "This mentor has not added any availability yet."}
                        </p>
                        {!mentorHasAvailability && (
                          <p className={`mt-2 max-w-md text-sm ${mutedText}`}>
                            Booking will open here as soon as the mentor publishes available time slots.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-medium ${headingText}`}>Topic or Focus Area *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Code Review, Resume Prep, Career Advice..."
                    className={`form-input w-full rounded-lg border p-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${inputClass}`}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-medium ${headingText}`}>Message for the Mentor (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific questions or context you want to provide beforehand?"
                    className={`form-input min-h-[100px] w-full resize-y rounded-lg border p-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${inputClass}`}
                  />
                </div>

                <div className={`p-4 rounded-xl border mt-2 flex justify-between items-center ${nestedPanelClass}`}>
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${mutedText}`}>Session Cost</span>
                    <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {activeMentor.hourlyRate > 0 ? `${activeMentor.currency || "PKR"} ${activeMentor.hourlyRate}` : "Free"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedSlot && (
                      <div className={`hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold sm:flex ${isDark ? "border-border-dark bg-surface-dark text-text-secondary-dark" : "border-slate-200 bg-white text-slate-500"}`}>
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {selectedDayObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at{" "}
                        {selectedSlot.label}
                      </div>
                    )}
                    <div className="rounded-lg border border-info/20 bg-info/5 px-3 py-1.5 dark:border-info/25 dark:bg-info/10">
                      <span className="block text-sm font-bold text-info">1 Hour Duration</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-2">
                  <button
                    onClick={handleBookSession}
                    disabled={
                      isSubmitting ||
                      !selectedSlot ||
                      !topic ||
                      !activeMentor.verified ||
                      !activeMentor.isActive
                    }
                    className="group relative flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined font-normal">calendar_add_on</span>
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>
                {bookingDisabledReason && (
                  <p className={`text-sm ${mutedText}`}>{bookingDisabledReason}</p>
                )}
              </div>
            ) : (
              <div className={`h-full min-h-[300px] flex flex-col items-center justify-center p-8 border rounded-2xl text-center ${panelClass}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${nestedPanelClass}`}>
                  <span className={`material-symbols-outlined text-[32px] ${mutedText}`}>person_add</span>
                </div>
                <h3 className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Select a Mentor</h3>
                <p className={mutedText}>Choose a mentor from the list to view their availability and book a session.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
