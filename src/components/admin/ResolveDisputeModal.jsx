import React from "react";

export default function ResolveDisputeModal({ caseItem, onClose }) {
  if (!caseItem) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="w-full max-w-lg bg-surface-dark border border-border-dark rounded-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border-dark">
          <h2 className="text-xl font-semibold text-white">
            Resolve Dispute Case:{" "}
            <span className="font-mono text-text-secondary-dark">
              {caseItem.caseId}
            </span>
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-full text-text-secondary-dark hover:bg-button-secondary-dark"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-text-primary-dark mb-2"
              htmlFor="resolution-outcome"
            >
              Resolution Outcome
            </label>
            <select
              id="resolution-outcome"
              name="resolution-outcome"
              className="form-select w-full bg-button-secondary-dark border-border-dark text-text-primary-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
              defaultValue="Refund Issued"
            >
              <option>Refund Issued</option>
              <option>Warning Issued to User</option>
              <option>No Action Taken</option>
              <option>Account Suspended</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-text-primary-dark mb-2"
              htmlFor="resolution-notes"
            >
              Final Resolution Notes <span className="text-red-400">*</span>
            </label>
            <textarea
              id="resolution-notes"
              name="resolution-notes"
              className="form-textarea w-full p-3 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark placeholder:text-text-secondary-dark focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="Summarize the investigation and the final decision. This will be logged for compliance."
              rows={5}
              required
            />
          </div>
          <div className="flex items-center">
            <input
              className="form-checkbox h-4 w-4 rounded bg-button-secondary-dark border-border-dark text-primary focus:ring-primary"
              id="notify-user"
              name="notify-user"
              type="checkbox"
              defaultChecked
            />
            <label
              className="ml-2 block text-sm text-text-primary-dark"
              htmlFor="notify-user"
            >
              Notify user(s) of this resolution
            </label>
          </div>
        </div>
        <div className="flex justify-end items-center gap-3 p-4 border-t border-border-dark bg-surface-dark">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-text-primary-dark bg-button-secondary-dark border border-border-dark hover:bg-border-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary border border-green-500 hover:bg-green-700 transition-colors"
          >
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
