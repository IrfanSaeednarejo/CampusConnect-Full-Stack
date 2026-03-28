import React, { useState } from 'react';
import { useModal, MODAL_TYPES } from '../../contexts/ModalContext';
import BaseModal from '../shared/BaseModal';
import { useDispatch } from 'react-redux';
import MentorAvailabilityModal from './MentorAvailabilityModal';
import EditProfileModal from './EditProfileModal';
import CreateSocietyModal from './CreateSocietyModal';

export default function GlobalModalsRender() {
  const { modal, closeModal } = useModal();
  const dispatch = useDispatch();

  if (!modal.type) return null;

  switch (modal.type) {
    case MODAL_TYPES.REGISTER_EVENT:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Register for Event</h2>
          <p className="text-[#c9d1d9] mb-6">Are you sure you want to register for this event?</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors font-bold">Confirm Registration</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.CANCEL_EVENT_REGISTRATION:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Cancel Registration</h2>
          <p className="text-[#c9d1d9] mb-6">Are you sure you want to cancel your registration? You might lose your spot.</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Keep Spot</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#f85149] text-white rounded-lg hover:bg-[#ff7b72] transition-colors font-bold">Cancel Registration</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.JOIN_SOCIETY:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Join Society</h2>
          <p className="text-[#c9d1d9] mb-6">Would you like to become a member of <strong>{modal.props.societyName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors font-bold">Join Society</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.LEAVE_SOCIETY:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Leave Society</h2>
          <p className="text-[#c9d1d9] mb-6">Are you sure you want to leave <strong>{modal.props.societyName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#f85149] text-white rounded-lg hover:bg-[#ff7b72] transition-colors font-bold">Leave Society</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.CANCEL_SESSION:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Cancel Session</h2>
          <p className="text-[#c9d1d9] mb-6">Are you sure you want to cancel your mentoring session with <strong>{modal.props.mentorName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Go Back</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#f85149] text-white rounded-lg hover:bg-[#ff7b72] transition-colors font-bold">Cancel Session</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.SESSION_FEEDBACK:
      return <SessionFeedbackModal modalProps={modal.props} closeModal={closeModal} dispatch={dispatch} />;

    case MODAL_TYPES.BOOK_MENTOR:
      return <BookMentorModal modalProps={modal.props} closeModal={closeModal} dispatch={dispatch} />;

    case MODAL_TYPES.SET_AVAILABILITY:
      return <MentorAvailabilityModal closeModal={closeModal} />;

    case MODAL_TYPES.EDIT_PROFILE:
      return <EditProfileModal closeModal={closeModal} />;

    case MODAL_TYPES.CREATE_SOCIETY:
      return <CreateSocietyModal closeModal={closeModal} />;

    default:
      return null;
  }
}

function SessionFeedbackModal({ modalProps, closeModal, dispatch }) {
  const [feedback, setFeedback] = useState("");
  // using dynamic import fallback just in case, but assume submitSessionFeedback is known in context where used
  // to avoid circular dep, we can just dispatch an action type string if needed, but best practice is import:
  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    try {
      // Dynamic import to prevent circular loops if they occur, otherwise direct import works
      const { submitSessionFeedback } = await import('../../redux/slices/sessionsSlice');
      dispatch(submitSessionFeedback({ sessionId: modalProps.sessionId, feedbackText: feedback }));
      closeModal();
    } catch (e) { console.error(e); }
  };

  return (
    <BaseModal size="md">
      <h2 className="text-xl font-bold text-white mb-4">Session Feedback</h2>
      <p className="text-[#8b949e] text-sm mb-4">How was your session with {modalProps.mentorName}?</p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#238636] focus:ring-1 focus:ring-[#238636] rounded-lg p-3 text-white h-32 mb-6 outline-none resize-none"
        placeholder="Share your thoughts..."
      />
      <div className="flex justify-end gap-3">
        <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
        <button onClick={handleSubmit} disabled={!feedback.trim()} className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed">Submit Feedback</button>
      </div>
    </BaseModal>
  );
}

function BookMentorModal({ modalProps, closeModal, dispatch }) {
  const [topic, setTopic] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const mentor = modalProps.mentor;
  // Fallback if slots missing
  const slots = mentor.availableSlots || ["10:00 AM", "2:00 PM", "4:00 PM"];
  
  const handleConfirm = async () => {
    if (!topic.trim() || !selectedSlot) return;
    try {
      const { bookMentorSession } = await import('../../redux/slices/sessionsSlice');
      dispatch(bookMentorSession({
        mentorId: mentor._id,
        mentorName: mentor.name,
        mentorTitle: mentor.title,
        mentorCompany: mentor.company,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now mock
        time: selectedSlot,
        duration: "1",
        topic: topic
      }));
      closeModal();
    } catch (e) { console.error(e); }
  };

  return (
    <BaseModal size="md">
      <h2 className="text-xl font-bold text-white mb-1">Book a Session</h2>
      <p className="text-[#8b949e] mb-6">with <strong className="text-white">{mentor.name}</strong> • {mentor.title}</p>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Topic (Required)</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#238636] focus:ring-1 focus:ring-[#238636] rounded-lg p-2.5 text-white outline-none"
            placeholder="What do you want to discuss?"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Available Slots (Next 7 Days)</label>
           <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {slots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-2 text-sm font-medium rounded border transition-colors ${
                    selectedSlot === slot 
                      ? "border-[#238636] bg-[#238636]/20 text-white" 
                      : "border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#8b949e]"
                  }`}
                >
                  {slot}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-[#30363d]">
        <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
        <button 
          onClick={handleConfirm} 
          disabled={!topic.trim() || !selectedSlot} 
          className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Booking
        </button>
      </div>
    </BaseModal>
  );
}

import React, { useState } from 'react';
import { useModal, MODAL_TYPES } from '../../contexts/ModalContext';
import BaseModal from '../shared/BaseModal';
import { useDispatch } from 'react-redux';
import MentorAvailabilityModal from './MentorAvailabilityModal';
import EditProfileModal from './EditProfileModal';
import CreateSocietyModal from './CreateSocietyModal';

export default function GlobalModalsRender() {
  const { modal, closeModal } = useModal();
  const dispatch = useDispatch();

  if (!modal.type) return null;

  switch (modal.type) {
    case MODAL_TYPES.REGISTER_EVENT:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Register for Event</h2>
          <p className="text-[#c9d1d9] mb-6">Are you sure you want to register for this event?</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors font-bold">Confirm Registration</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.CANCEL_EVENT_REGISTRATION:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Cancel Registration</h2>
          <p className="text-[#c9d1d9] mb-6">Are you sure you want to cancel your registration? You might lose your spot.</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Keep Spot</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#f85149] text-white rounded-lg hover:bg-[#ff7b72] transition-colors font-bold">Cancel Registration</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.JOIN_SOCIETY:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Join Society</h2>
          <p className="text-[#c9d1d9] mb-6">Would you like to become a member of <strong>{modal.props.societyName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors font-bold">Join Society</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.LEAVE_SOCIETY:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Leave Society</h2>
          <p className="text-[#c9d1d9] mb-6">Are you sure you want to leave <strong>{modal.props.societyName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#f85149] text-white rounded-lg hover:bg-[#ff7b72] transition-colors font-bold">Leave Society</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.CANCEL_SESSION:
      return (
        <BaseModal size="md">
          <h2 className="text-xl font-bold text-white mb-4">Cancel Session</h2>
          <p className="text-[#c9d1d9] mb-6">Are you sure you want to cancel your mentoring session with <strong>{modal.props.mentorName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Go Back</button>
            <button onClick={() => { modal.props.onConfirm(); closeModal(); }} className="px-4 py-2 bg-[#f85149] text-white rounded-lg hover:bg-[#ff7b72] transition-colors font-bold">Cancel Session</button>
          </div>
        </BaseModal>
      );

    case MODAL_TYPES.SESSION_FEEDBACK:
      return <SessionFeedbackModal modalProps={modal.props} closeModal={closeModal} dispatch={dispatch} />;

    case MODAL_TYPES.BOOK_MENTOR:
      return <BookMentorModal modalProps={modal.props} closeModal={closeModal} dispatch={dispatch} />;

    case MODAL_TYPES.SET_AVAILABILITY:
      return <MentorAvailabilityModal closeModal={closeModal} />;

    case MODAL_TYPES.EDIT_PROFILE:
      return <EditProfileModal closeModal={closeModal} />;

    case MODAL_TYPES.CREATE_SOCIETY:
      return <CreateSocietyModal closeModal={closeModal} />;

    default:
      return null;
  }
}

function SessionFeedbackModal({ modalProps, closeModal, dispatch }) {
  const [feedback, setFeedback] = useState("");
  // using dynamic import fallback just in case, but assume submitSessionFeedback is known in context where used
  // to avoid circular dep, we can just dispatch an action type string if needed, but best practice is import:
  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    try {
      // Dynamic import to prevent circular loops if they occur, otherwise direct import works
      const { submitSessionFeedback } = await import('../../redux/slices/sessionsSlice');
      dispatch(submitSessionFeedback({ sessionId: modalProps.sessionId, feedbackText: feedback }));
      closeModal();
    } catch (e) { console.error(e); }
  };

  return (
    <BaseModal size="md">
      <h2 className="text-xl font-bold text-white mb-4">Session Feedback</h2>
      <p className="text-[#8b949e] text-sm mb-4">How was your session with {modalProps.mentorName}?</p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#238636] focus:ring-1 focus:ring-[#238636] rounded-lg p-3 text-white h-32 mb-6 outline-none resize-none"
        placeholder="Share your thoughts..."
      />
      <div className="flex justify-end gap-3">
        <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
        <button onClick={handleSubmit} disabled={!feedback.trim()} className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed">Submit Feedback</button>
      </div>
    </BaseModal>
  );
}

function BookMentorModal({ modalProps, closeModal }) {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const mentor = modalProps.mentor;
  const availability = mentor.availability || [];

  // Generate next 7 dates that match the mentor's available days
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const availableDays = [...new Set(availability.map(s => s.day))];

  const upcomingDates = React.useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = 1; i <= 14 && dates.length < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      if (availableDays.includes(d.getDay())) {
        dates.push(d);
      }
    }
    return dates;
  }, [availableDays]);

  // Generate 1-hour slots for the selected date based on mentor's availability
  const timeSlots = React.useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const daySlots = availability.filter(s => s.day === dayOfWeek);
    const slots = [];
    daySlots.forEach(slot => {
      const [sh, sm] = slot.startTime.split(":").map(Number);
      const [eh, em] = slot.endTime.split(":").map(Number);
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;
      // Generate 1-hour blocks
      for (let m = startMins; m + 60 <= endMins; m += 60) {
        const hStart = Math.floor(m / 60);
        const mStart = m % 60;
        const hEnd = Math.floor((m + 60) / 60);
        const mEnd = (m + 60) % 60;
        const fmtTime = (h, mi) => {
          const ampm = h >= 12 ? "PM" : "AM";
          const h12 = h % 12 || 12;
          return `${h12}:${String(mi).padStart(2, "0")} ${ampm}`;
        };
        slots.push({
          label: `${fmtTime(hStart, mStart)} – ${fmtTime(hEnd, mEnd)}`,
          startTime: `${String(hStart).padStart(2, "0")}:${String(mStart).padStart(2, "0")}`,
          endTime: `${String(hEnd).padStart(2, "0")}:${String(mEnd).padStart(2, "0")}`,
        });
      }
    });
    return slots;
  }, [selectedDate, availability]);

  const handleConfirm = async () => {
    if (!topic.trim() || !selectedSlot || !selectedDate) return;
    setSubmitting(true);
    setError(null);
    try {
      const { bookSession } = await import("../../api/mentoringApi");
      // Build ISO date strings in UTC (backend checks availability with getUTCHours)
      // Use local date parts to avoid timezone shift (midnight UTC+5 → previous day in UTC)
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      const startAt = `${dateStr}T${selectedSlot.startTime}:00.000Z`;
      const endAt = `${dateStr}T${selectedSlot.endTime}:00.000Z`;

      await bookSession(mentor._id, { startAt, endAt, topic: topic.trim(), notes: notes.trim() });
      setSuccess(true);
      setTimeout(() => closeModal(), 2000);
    } catch (e) {
      console.error("[BookMentor] Error:", e);
      setError(e?.message || e?.response?.data?.message || "Booking failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <BaseModal size="md">
        <div className="flex flex-col items-center py-8 gap-4">
          <span className="material-symbols-outlined text-[#238636] text-6xl">check_circle</span>
          <h2 className="text-xl font-bold text-white">Session Booked!</h2>
          <p className="text-[#8b949e] text-center">Your request has been sent to <strong className="text-white">{mentor.name}</strong>. They'll confirm shortly.</p>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal size="lg">
      <h2 className="text-xl font-bold text-white mb-1">Book a Session</h2>
      <p className="text-[#8b949e] mb-5">with <strong className="text-white capitalize">{mentor.name}</strong> {mentor.hourlyRate > 0 ? `• ${mentor.currency} ${mentor.hourlyRate}/hr` : "• Free"}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <div className="space-y-5 mb-6">
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Topic <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#238636] focus:ring-1 focus:ring-[#238636] rounded-lg p-2.5 text-white outline-none"
            placeholder="What do you want to discuss?"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Notes <span className="text-[#8b949e]">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#238636] focus:ring-1 focus:ring-[#238636] rounded-lg p-2.5 text-white outline-none h-20 resize-none"
            placeholder="Any extra details for the mentor..."
          />
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Select Date <span className="text-red-400">*</span></label>
          {upcomingDates.length === 0 ? (
            <p className="text-[#8b949e] text-sm">This mentor hasn't set their availability yet.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {upcomingDates.map((d, idx) => {
                const isSelected = selectedDate?.toDateString() === d.toDateString();
                return (
                  <button
                    key={idx}
                    onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                    className={`flex flex-col items-center min-w-[72px] px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${isSelected
                      ? "border-[#238636] bg-[#238636]/20 text-white"
                      : "border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#8b949e]"
                      }`}
                  >
                    <span className="font-bold text-sm">{WEEKDAYS[d.getDay()].slice(0, 3)}</span>
                    <span>{d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Select Time <span className="text-red-400">*</span></label>
            {timeSlots.length === 0 ? (
              <p className="text-[#8b949e] text-sm">No time slots for this day.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {timeSlots.map((slot, idx) => {
                  const isSelected = selectedSlot?.label === slot.label;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${isSelected
                        ? "border-[#238636] bg-[#238636]/20 text-white"
                        : "border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#8b949e]"
                        }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-[#30363d]">
        <button onClick={closeModal} className="px-4 py-2 border border-[#30363d] text-[#c9d1d9] rounded-lg hover:bg-[#30363d] transition-colors font-medium">Cancel</button>
        <button
          onClick={handleConfirm}
          disabled={!topic.trim() || !selectedSlot || submitting}
          className="px-5 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Booking...</>
          ) : (
            <><span className="material-symbols-outlined text-[16px]">calendar_month</span> Confirm Booking</>
          )}
        </button>
      </div>
    </BaseModal>
  );
}
