import React from "react";

export default function DisputeDetailsModalV3({
  dispute,
  onClose,
  internalNotes,
  setInternalNotes,
}) {
  if (!dispute) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <h2 className="text-xl font-semibold text-white">
            Dispute Details:{" "}
            <span className="font-mono text-[#8b949e]">{dispute.caseId}</span>
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-full text-[#8b949e] hover:bg-[#21262d]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex gap-6 items-start">
            <div className="flex flex-col items-center gap-2">
              <img
                src={dispute.complainant?.avatar}
                alt={dispute.complainant?.name}
                className="rounded-full size-16"
              />
              <span className="text-[#c9d1d9] text-sm font-medium">
                {dispute.complainant?.name}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Complaint Details
              </h3>
              <p className="text-[#c9d1d9] whitespace-pre-line">
                {dispute.complaintDetails}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img
                src={dispute.involvedUser?.avatar}
                alt={dispute.involvedUser?.name}
                className="rounded-full size-16"
              />
              <span className="text-[#c9d1d9] text-sm font-medium">
                {dispute.involvedUser?.name}
              </span>
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-[#c9d1d9] mb-2"
              htmlFor="internal-notes"
            >
              Internal Notes
            </label>
            <textarea
              id="internal-notes"
              name="internal-notes"
              className="form-textarea w-full p-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder:text-[#8b949e] focus:ring-2 focus:ring-[#238636] focus:border-[#238636] transition"
              placeholder="Add any internal notes for this case."
              rows={4}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end items-center gap-3 p-4 border-t border-[#30363d] bg-[#161b22]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
