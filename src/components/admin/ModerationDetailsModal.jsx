import React from "react";

export default function ModerationDetailsModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Content Details
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Content Type
            </h3>
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${item.typeColor}`}
            >
              {item.contentType}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              User
            </h3>
            <p className="text-zinc-900 dark:text-white">{item.user}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Flag Reason
            </h3>
            <p className="text-zinc-900 dark:text-white">{item.flagReason}</p>
          </div>
          {item.content && (
            <div>
              <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Content
              </h3>
              <p className="text-zinc-900 dark:text-white">{item.content}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Date Flagged
            </h3>
            <p className="text-zinc-900 dark:text-white">{item.dateFlagged}</p>
          </div>
        </div>
        <div className="flex justify-end items-center p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600">
              Reject Content
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600">
              Approve Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
