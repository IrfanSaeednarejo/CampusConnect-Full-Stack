import React from "react";
import Button from "../../common/Button";
import { useDispatch, useSelector } from "react-redux";
import { selectRole, selectUser } from "../../../redux/slices/authSlice";

export default function EnrollmentCTA({
  eventId,
  status,
  isOnlineCompetition,
  registrationOpen,
  spotsRemaining,
  isFull,
  loading = false,
  isRegistered = false,
  registrationStatus = null,
  onEnroll
}) {
  const role = useSelector(selectRole);
  const user = useSelector(selectUser);

  // Conditions for rendering
  if (!user || role !== "student") {
    return (
      <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl flex flex-col gap-4 text-center">
        <span className="material-symbols-outlined text-4xl text-[#8b949e]">lock</span>
        <h3 className="text-lg font-bold text-white">Students Only</h3>
        <p className="text-sm text-[#8b949e]">You must be logged in as a student to participate in events.</p>
      </div>
    );
  }

  const renderContent = () => {
    if (isRegistered) {
      return (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-[#1dc964]/10 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[#1dc964]">how_to_reg</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Already Registered</h3>
            <p className="text-sm text-[#8b949e] mt-1">Status: <span className={`font-bold uppercase ${registrationStatus === 'approved' ? 'text-[#1dc964]' : registrationStatus === 'pending' ? 'text-[#e3b341]' : 'text-[#f85149]'}`}>{registrationStatus}</span></p>
          </div>
          {registrationStatus === 'approved' && (
            <p className="text-xs text-[#8b949e]">You are confirmed for this event!</p>
          )}
          {registrationStatus === 'pending' && (
            <p className="text-xs text-[#8b949e]">Waiting for organizer approval.</p>
          )}
        </div>
      );
    }

    if (status === "draft" || status === "published") {
      return (
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-white">Coming Soon</h3>
          <p className="text-sm text-[#8b949e]">Registration is not yet open.</p>
        </div>
      );
    }

    if (status === "registration" && !registrationOpen) {
      return (
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-white">Registration Closed</h3>
          <p className="text-sm text-[#8b949e]">The deadline to register has passed.</p>
        </div>
      );
    }

    if (isFull) {
      return (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-bold text-[#f85149]">Event Full</h3>
          <p className="text-sm text-[#8b949e]">Capacity reached. You may join the waitlist.</p>
          <Button variant="outline" className="w-full justify-center" onClick={onEnroll} disabled={loading}>
            Join Waitlist
          </Button>
        </div>
      );
    }

    if (registrationOpen) {
      return (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white border-b border-[#30363d] pb-2">Register Now</h3>
          {spotsRemaining !== null && (
            <p className="text-sm font-semibold text-[#1dc964]">🔥 Only {spotsRemaining} spots left!</p>
          )}
          <Button variant="primary" className="w-full justify-center text-base py-3" onClick={onEnroll} disabled={loading}>
            {loading ? "Processing..." : (isOnlineCompetition ? "Form Team / Join" : "Register")}
          </Button>
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="text-[#8b949e]">Registration is not available.</p>
      </div>
    );
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl shadow-xl shadow-black/50">
      {renderContent()}
    </div>
  );
}
