import React from "react";

export default function LogsTable({ logs }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-200 text-left text-sm">
        <thead className="bg-gray-50 dark:bg-surface-dark text-gray-600 dark:text-text-secondary-dark">
          <tr className="border-b border-gray-200 dark:border-border-dark">
            <th className="px-6 py-4 font-medium min-w-200" scope="col">
              <div className="flex items-center gap-2 cursor-pointer">
                Timestamp{" "}
                <span className="material-symbols-outlined text-base">
                  arrow_downward
                </span>
              </div>
            </th>
            <th className="px-6 py-4 font-medium" scope="col">
              <div className="flex items-center gap-2 cursor-pointer">
                Admin
              </div>
            </th>
            <th className="px-6 py-4 font-medium" scope="col">
              <div className="flex items-center gap-2 cursor-pointer">
                Action
              </div>
            </th>
            <th className="px-6 py-4 font-medium" scope="col">
              <div className="flex items-center gap-2 cursor-pointer">
                Target
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-800 dark:text-text-primary-dark">
          {logs.map((log, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-surface-dark/60 transition-colors"
            >
              <td className="px-6 py-4 text-gray-600 dark:text-text-secondary-dark">
                {log.timestamp}
              </td>
              <td className="px-6 py-4 font-medium">{log.admin}</td>
              <td className="px-6 py-4">{log.action}</td>
              <td className="px-6 py-4">{log.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
