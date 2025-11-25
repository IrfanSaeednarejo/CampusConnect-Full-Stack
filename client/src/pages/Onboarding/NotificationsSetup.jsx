import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationsSetup() {
  const navigate = useNavigate();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);

  return (
    <div className="bg-background-dark font-display min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] rounded-lg border border-[#30363d] bg-[#161b22] p-6 sm:p-8 flex flex-col gap-8">
        {/* Progress Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <p className="text-[#8b949e] text-sm font-medium">Step 3 of 4</p>
          </div>
          <div className="h-2 w-full rounded-full bg-[#30363d]">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>

        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <p className="text-[#e6edf3] text-3xl font-black tracking-[-0.03em]">
            Enable Notifications
          </p>
          <p className="text-[#8b949e] text-base">
            Get handy alerts for deadlines, events, and updates.
          </p>
        </div>

        {/* Notification List */}
        <div className="flex flex-col gap-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#21262d] text-[#8b949e] flex items-center justify-center rounded-lg h-10 w-10">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <p className="text-[#e6edf3] font-medium flex-1">
                Allow Email Notifications
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 cursor-pointer"
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
            />
          </div>

          {/* SMS Reminders */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#21262d] text-[#8b949e] flex items-center justify-center rounded-lg h-10 w-10">
                <span className="material-symbols-outlined">sms</span>
              </div>
              <p className="text-[#e6edf3] font-medium flex-1">
                Allow SMS Reminders
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 cursor-pointer"
              checked={smsReminders}
              onChange={() => setSmsReminders(!smsReminders)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <button
            onClick={() => navigate("/onboarding/OnboardingWizardComplete")}
            className="w-full flex items-center justify-center h-12 rounded-lg bg-primary text-white font-bold hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
          >
            Finish Setup
          </button>
          <button
            onClick={() => navigate("/onboarding/finish")}
            className="text-[#8b949e] text-sm font-medium hover:text-[#e6edf3]"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
