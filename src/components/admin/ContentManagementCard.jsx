import React from "react";
import Badge from "../../common/Badge";

export default function ContentManagementCard({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-[#1c2620] border border-[#30363d] rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">
        Content Management
      </h3>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-[#238636]">
              {item.icon}
            </span>
            <span className="text-white text-sm font-medium">{item.name}</span>
            <span className="text-xs text-[#8b949e] ml-auto">{item.sub}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
