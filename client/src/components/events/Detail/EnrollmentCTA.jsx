import React from "react";
import Button from "../../common/Button";
import { useSelector } from "react-redux";
import { selectRole, selectUser } from "../../../redux/slices/authSlice";
import useHomeTheme from "@/hooks/useHomeTheme";

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
  onEnroll,
}) {
  const isDark = useHomeTheme();
  const role = useSelector(selectRole);
  const user = useSelector(selectUser);

  if (!user || role !== "student") {
    return (
      <div className={`p-6 rounded-xl flex flex-col gap-4 text-center border ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"}`}>
        <span className={`material-symbols-outlined text-4xl ${isDark ? "text-[#8b949e]" : "text-slate-400"}`}>lock</span>
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Students Only</h3>
        <p className={`text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>You must be logged in as a student to participate in events.</p>
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
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Already Registered</h3>
            <p className={`text-sm mt-1 ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
              Status:{" "}
              <span className={`font-bold uppercase ${
                registrationStatus === "approved"
                  ? "text-[#1dc964]"
                  : registrationStatus === "pending"
                    ? "text-[#e3b341]"
                    : "text-[#f85149]"
              }`}>
                {registrationStatus}
              </span>
            </p>
          </div>
          {registrationStatus === "approved" && <p className={`text-xs ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>You are confirmed for this event!</p>}
          {registrationStatus === "pending" && <p className={`text-xs ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Waiting for organizer approval.</p>}
        </div>
      );
    }

    if (status === "draft" || status === "published") {
      return (
        <div className="text-center space-y-2">
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Coming Soon</h3>
          <p className={`text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Registration is not yet open.</p>
        </div>
      );
    }

    if (status === "registration" && !registrationOpen) {
      return (
        <div className="text-center space-y-2">
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Registration Closed</h3>
          <p className={`text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>The deadline to register has passed.</p>
        </div>
      );
    }

    if (isFull) {
      return (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-bold text-[#f85149]">Event Full</h3>
          <p className={`text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Capacity reached. You may join the waitlist.</p>
          <Button variant="outline" className="w-full justify-center" onClick={onEnroll} disabled={loading}>
            Join Waitlist
          </Button>
        </div>
      );
    }

    if (registrationOpen) {
      return (
        <div className="text-center space-y-4">
          <h3 className={`text-xl font-bold border-b pb-2 ${isDark ? "text-white border-[#30363d]" : "text-slate-900 border-slate-200"}`}>Register Now</h3>
          {spotsRemaining !== null && <p className="text-sm font-semibold text-[#1dc964]">Only {spotsRemaining} spots left!</p>}
          <Button variant="primary" className="w-full justify-center text-base py-3" onClick={onEnroll} disabled={loading}>
            {loading ? "Processing..." : isOnlineCompetition ? "Form Team / Join" : "Register"}
          </Button>
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className={isDark ? "text-[#8b949e]" : "text-slate-500"}>Registration is not available.</p>
      </div>
    );
  };

  return (
    <div className={`p-6 rounded-xl border ${isDark ? "bg-[#161b22] border-[#30363d] shadow-xl shadow-black/50" : "bg-white border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"}`}>
      {renderContent()}
    </div>
  );
}
