import React from "react";

export default function DisputesTable({ cases, onResolve }) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-button-secondary-dark">
            <tr>
              <th
                className="px-6 py-3 font-medium text-text-secondary-dark uppercase tracking-wider"
                scope="col"
              >
                Case ID
              </th>
              <th
                className="px-6 py-3 font-medium text-text-secondary-dark uppercase tracking-wider"
                scope="col"
              >
                Submitted By
              </th>
              <th
                className="px-6 py-3 font-medium text-text-secondary-dark uppercase tracking-wider"
                scope="col"
              >
                Issue Type
              </th>
              <th
                className="px-6 py-3 font-medium text-text-secondary-dark uppercase tracking-wider"
                scope="col"
              >
                Date
              </th>
              <th
                className="px-6 py-3 font-medium text-text-secondary-dark uppercase tracking-wider"
                scope="col"
              >
                Status
              </th>
              <th
                className="px-6 py-3 font-medium text-text-secondary-dark uppercase tracking-wider text-right"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {cases.map((c) => (
              <tr key={c.caseId} className={c.muted ? "opacity-60" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-text-primary-dark font-mono">
                  {c.caseId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-text-primary-dark">
                  {c.submittedBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-text-primary-dark">
                  {c.issueType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-text-secondary-dark">
                  {c.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${c.statusClass}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      className="p-2 rounded-lg text-text-secondary-dark hover:bg-border-dark transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">
                        mail
                      </span>
                    </button>
                    <button
                      className="px-3 py-1.5 text-sm rounded-lg text-text-primary-dark bg-button-secondary-dark border border-border-dark hover:bg-border-dark transition-colors"
                      type="button"
                      disabled={c.status === "Resolved"}
                    >
                      Escalate
                    </button>
                    <button
                      type="button"
                      onClick={() => onResolve(c)}
                      className="px-3 py-1.5 text-sm rounded-lg text-white bg-primary border border-green-500 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={c.status === "Resolved"}
                    >
                      Resolve
                    </button>
                    <button
                      className="px-3 py-1.5 text-sm rounded-lg text-text-primary-dark bg-button-secondary-dark border border-border-dark hover:bg-border-dark transition-colors"
                      type="button"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
