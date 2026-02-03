import React from "react";

export default function RejectMentorApplicationModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden="true" className="absolute inset-0 bg-black/70"></div>
      <div className="relative flex min-h-screen items-center justify-center px-4 py-5">
        <div className="flex flex-col w-full max-w-140 bg-card-dark border border-border-dark rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-dark">
            <div className="flex flex-col gap-1">
              <p className="text-[#f0f6fc] tracking-tight text-xl font-bold leading-tight">
                Confirm Mentor Application Rejection
              </p>
              <p className="text-text-primary-dark text-sm font-normal leading-normal">
                This action cannot be undone. The applicant will be notified.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-primary-dark transition-colors hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
          <div className="flex flex-col gap-6 p-6">
            <label className="flex flex-col w-full">
              <p className="text-[#f0f6fc] text-sm font-medium leading-normal pb-2">
                Reason for Rejection
              </p>
              <select className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-text-primary-dark focus:outline-0 focus:ring-2 focus:ring-primary border border-border-dark bg-background-dark h-10 px-3 text-sm font-normal leading-normal appearance-none">
                <option value="" disabled>
                  Select a reason
                </option>
                <option value="incomplete-bio">Incomplete Bio</option>
                <option value="video-quality">Video Quality Issues</option>
                <option value="expertise-fit">Expertise Not a Fit</option>
                <option value="unclear-motivation">Unclear Motivation</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex flex-col w-full">
              <p className="text-[#f0f6fc] text-sm font-medium leading-normal pb-2">
                Constructive Feedback for Applicant (Optional)
              </p>
              <textarea
                className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-md text-text-primary-dark focus:outline-0 focus:ring-2 focus:ring-primary border border-border-dark bg-background-dark min-h-32 placeholder:text-text-secondary-dark p-3 text-sm font-normal leading-normal"
                placeholder="e.g., 'Please provide more specific examples of your experience in your bio.'"
              ></textarea>
            </label>
          </div>
          <div className="flex justify-stretch border-t border-border-dark">
            <div className="flex flex-1 gap-3 flex-wrap p-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex min-w-21 cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-transparent text-text-primary-dark hover:bg-white/10 border border-border-dark text-sm font-medium leading-normal tracking-wide transition-colors"
              >
                <span className="truncate">Cancel</span>
              </button>
              <button
                type="button"
                className="flex min-w-21 cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-[#da3633] text-white hover:bg-[#b92b28] text-sm font-medium leading-normal tracking-wide transition-colors"
              >
                <span className="truncate">Confirm & Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
