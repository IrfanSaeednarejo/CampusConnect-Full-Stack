import React from "react";

export function ApplicationCard({ application, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-background-dark p-4 rounded-lg border border-[#30363d] cursor-grab hover:border-[#238636]"
    >
      <h3 className="font-semibold text-[#c9d1d9]">{application.name}</h3>
      <p className="text-sm text-[#8b949e] mt-1">{application.expertise}</p>
    </div>
  );
}

export function ApplicationColumn({
  title,
  count,
  color,
  applications,
  status,
  onView,
}) {
  return (
    <div className="flex flex-col bg-[#161b22] rounded-lg border border-[#30363d] h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
          <h2 className="font-semibold text-[#c9d1d9]">{title}</h2>
        </div>
        <span className="text-sm font-medium text-[#8b949e] bg-background-dark px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onClick={() => onView(app)}
          />
        ))}
      </div>
    </div>
  );
}
