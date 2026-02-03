import React from "react";

export default function ResearchRecentActivity({ recentActivity }) {
  return (
    <div className="bg-[#1a2a20] rounded-xl p-4 md:p-5 flex flex-col flex-1 border border-[#2a3d32] shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4 pb-4 border-b border-[#2a3d32]">
        Recent Activity
      </h3>
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin" }}
      >
        <ul className="divide-y divide-[#2a3d32]">
          {recentActivity.map((activity, index) => (
            <li key={index} className="py-3 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">
                {activity.icon}
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  {activity.action} "
                  <span className="text-primary">{activity.item}</span>"
                </p>
                <p className="text-white/60 text-xs">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
