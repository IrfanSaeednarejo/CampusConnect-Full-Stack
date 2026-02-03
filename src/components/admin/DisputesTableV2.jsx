import React from "react";

export default function DisputesTableV2({ disputes, getStatusBadge }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#21262d]">
            <tr>
              <th
                className="px-6 py-3 font-medium text-[#8b949e] uppercase tracking-wider"
                scope="col"
              >
                Case ID
              </th>
              <th
                className="px-6 py-3 font-medium text-[#8b949e] uppercase tracking-wider"
                scope="col"
              >
                Submitted By
              </th>
              <th
                className="px-6 py-3 font-medium text-[#8b949e] uppercase tracking-wider"
                scope="col"
              >
                Issue Type
              </th>
              <th
                className="px-6 py-3 font-medium text-[#8b949e] uppercase tracking-wider"
                scope="col"
              >
                Date
              </th>
              <th
                className="px-6 py-3 font-medium text-[#8b949e] uppercase tracking-wider"
                scope="col"
              >
                Status
              </th>
              <th
                className="px-6 py-3 font-medium text-[#8b949e] uppercase tracking-wider text-right"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {disputes.map((dispute) => (
              <tr
                key={dispute.id}
                className={dispute.status === "resolved" ? "opacity-60" : ""}
              >
                <td className="px-6 py-4 whitespace-nowrap text-[#c9d1d9] font-mono">
                  {dispute.caseId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#c9d1d9]">
                  {dispute.submittedBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#c9d1d9]">
                  {dispute.issueType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#8b949e]">
                  {dispute.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(dispute.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button className="p-2 rounded-lg text-[#8b949e] hover:bg-[#30363d] transition-colors">
                      <span className="material-symbols-outlined text-lg">
                        mail
                      </span>
                    </button>
                    <button
                      className="px-3 py-1.5 text-sm rounded-lg text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] transition-colors"
                      disabled={dispute.status === "resolved"}
                    >
                      Escalate
                    </button>
                    <div className="relative group">
                      <button
                        className="px-3 py-1.5 text-sm rounded-lg text-white bg-[#238636] border border-green-500 hover:bg-green-700 transition-colors"
                        disabled={dispute.status === "resolved"}
                      >
                        Resolve
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Document your resolution for compliance.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-sm rounded-lg text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] transition-colors">
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
