import React from "react";

export default function MentorApplicationModal({ open, onClose, onReject }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative flex w-full max-w-3xl flex-col rounded-lg bg-card-dark border border-border-dark shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border-dark">
          <p className="text-text-headings tracking-light text-2xl font-bold leading-tight">
            Review Mentor Application
          </p>
          <button
            onClick={onClose}
            type="button"
            className="text-text-secondary-dark hover:text-text-headings transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Applicant Information, Expertise, Bio, Video, etc. - To be filled by parent */}
          <div className="text-text-secondary-dark text-center py-8">
            Applicant details go here.
          </div>
        </div>
        <div className="flex justify-end items-center gap-3 p-6 border-t border-border-dark">
          <button
            type="button"
            onClick={onReject}
            className="flex h-10 items-center justify-center rounded-lg bg-[#da3633]/90 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#da3633]"
          >
            Reject Application
          </button>
          <button
            type="button"
            className="flex h-10 items-center justify-center rounded-lg bg-primary/90 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary"
          >
            Approve Application
          </button>
        </div>
      </div>
    </div>
  );
}
