import React from "react";
import { useNavigate } from "react-router-dom";

const EventSubmissionNotification = () => {
  const navigate = useNavigate();

  const handleEditResubmit = () => {
    // TODO: Navigate to edit event page
    navigate("/events/create");
  };

  const handleContactSupport = () => {
    // TODO: Navigate to contact support
    navigate("/contact");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark font-display">
      <div className="w-full max-w-2xl">
        {/* Notification Card */}
        <div className="flex flex-col gap-4 rounded-lg border border-[#30363d] bg-[#161b22] p-6 shadow-lg">
          <div className="flex items-start gap-4">
            {/* Unread Indicator */}
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"></div>
            {/* Main Content */}
            <div className="flex-grow">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#d29922]">info</span>
                  <h1 className="text-base font-semibold text-[#c9d1d9]">Update on Your Event Submission</h1>
                </div>
                <span className="text-xs text-[#8b949e]">5 hours ago</span>
              </div>
              {/* Body */}
              <div className="mt-4 flex flex-col gap-3 pl-7">
                <p className="text-sm text-[#c9d1d9]">
                  Your submission for the event "Annual Tech Fair" could not be approved at this time.
                </p>
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-[#8b949e]">
                    <strong className="font-semibold text-[#8b949e]">Reason:</strong> Incomplete Details
                  </p>
                  <p className="text-sm text-[#8b949e]">
                    <strong className="font-semibold text-[#8b949e]">Admin Feedback:</strong> Please provide a detailed
                    schedule and a list of speakers for the event.
                  </p>
                </div>
                {/* Button Group */}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleEditResubmit}
                    className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-[#238636] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#2ea043]"
                  >
                    <span className="truncate">Edit & Resubmit Event</span>
                  </button>
                  <button
                    onClick={handleContactSupport}
                    className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-md px-4 text-sm font-medium text-[#8b949e] hover:text-[#c9d1d9]"
                  >
                    <span className="truncate">Contact Support</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSubmissionNotification;
