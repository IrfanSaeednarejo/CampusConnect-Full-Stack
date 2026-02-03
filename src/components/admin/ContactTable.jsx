import React from "react";

export default function ContactTable({ submissions, getStatusBadge }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#161b22]">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 dark:bg-background-dark/50">
              <th className="px-4 py-3 text-gray-600 dark:text-[#8b949e] text-xs font-semibold uppercase tracking-wider w-[25%]">
                Sender
              </th>
              <th className="px-4 py-3 text-gray-600 dark:text-[#8b949e] text-xs font-semibold uppercase tracking-wider w-[25%]">
                Topic
              </th>
              <th className="px-4 py-3 text-gray-600 dark:text-[#8b949e] text-xs font-semibold uppercase tracking-wider w-[15%]">
                Date Received
              </th>
              <th className="px-4 py-3 text-gray-600 dark:text-[#8b949e] text-xs font-semibold uppercase tracking-wider w-[15%]">
                Status
              </th>
              <th className="px-4 py-3 text-gray-600 dark:text-[#8b949e] text-xs font-semibold uppercase tracking-wider w-[20%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#30363d]">
            {submissions.map((submission) => (
              <tr
                key={submission.id}
                className="hover:bg-gray-100/50 dark:hover:bg-background-dark/30 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      className="rounded-full size-10"
                      data-alt={`Avatar of ${submission.sender.name}`}
                      src={submission.sender.avatar}
                    />
                    <div>
                      <p className="text-gray-900 dark:text-[#e6edf3] text-sm font-medium">
                        {submission.sender.name}
                      </p>
                      <p className="text-gray-500 dark:text-[#8b949e] text-sm">
                        {submission.sender.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-[#8b949e] text-sm font-medium">
                  {submission.topic}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-[#8b949e] text-sm">
                  {submission.date}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(submission.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-sm font-medium text-gray-600 dark:text-[#8b949e] hover:text-[#238636] dark:hover:text-[#238636]">
                      View
                    </button>
                    <span className="text-gray-300 dark:text-[#30363d]">|</span>
                    {submission.status === "resolved" ? (
                      <button className="text-sm font-medium text-gray-600 dark:text-[#8b949e] hover:text-[#238636] dark:hover:text-[#238636]">
                        View Details
                      </button>
                    ) : (
                      <button className="text-sm font-medium text-gray-600 dark:text-[#8b949e] hover:text-[#238636] dark:hover:text-[#238636]">
                        {submission.status === "pending" ? "Resolve" : "Reply"}
                      </button>
                    )}
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
