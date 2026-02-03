import React from "react";
import Button from "../common/Button";
import Select from "../common/Select";

export default function RejectEventModal({
  open,
  onClose,
  onConfirm,
  reason,
  setReason,
  feedback,
  setFeedback,
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#111814] border border-[#3c5345] rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-[#3c5345]">
          <h2 className="text-xl font-bold text-white">
            Confirm Event Rejection
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-[#9db8a8]"
              htmlFor="rejection-reason"
            >
              Reason for Rejection
            </label>
            <Select
              id="rejection-reason"
              options={[
                { value: "", label: "Select a reason" },
                { value: "incomplete", label: "Incomplete Details" },
                { value: "conflict", label: "Scheduling Conflict" },
                { value: "violates", label: "Violates Guidelines" },
                { value: "duplicate", label: "Duplicate Event" },
                { value: "other", label: "Other" },
              ]}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#1c2620] border border-[#3c5345] text-white rounded-lg focus:ring-[#17cf60] focus:border-[#17cf60]"
            />
          </div>
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-[#9db8a8]"
              htmlFor="feedback"
            >
              Feedback for Organizer (Optional)
            </label>
            <textarea
              className="w-full bg-[#1c2620] border border-[#3c5345] text-white rounded-lg focus:ring-[#17cf60] focus:border-[#17cf60] placeholder:text-[#6a8b79]"
              id="feedback"
              placeholder="Provide specific, constructive comments..."
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end items-center gap-4 p-6 border-t border-[#3c5345] bg-[#1c2620]/50 rounded-b-xl">
          <Button
            onClick={onClose}
            variant="secondary"
            className="bg-[#29382f] hover:bg-[#3c5345] text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="danger"
            className="bg-[#DA3633] hover:bg-[#b82c2a] text-white"
          >
            Confirm & Reject Event
          </Button>
        </div>
      </div>
    </div>
  );
}
