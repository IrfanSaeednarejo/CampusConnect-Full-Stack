import React from "react";
import Badge from "../../common/Badge";

export default function RoleHistoryCard({ history }) {
  if (!history || history.length === 0) return null;
  return (
    <div className="bg-[#1c2620] border border-[#30363d] rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Role History</h3>
      <ul className="space-y-3">
        {history.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <Badge color={item.color || "primary"} />
            <span className="text-white text-sm">{item.text}</span>
            <span className="text-xs text-[#8b949e] ml-auto">{item.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
