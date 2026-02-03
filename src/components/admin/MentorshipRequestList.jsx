import React from "react";

export default function MentorshipRequestList({
  requests,
  selectedRequest,
  setSelectedRequest,
}) {
  return (
    <ul className="divide-y divide-[#3c5345]">
      {requests.map((request, index) => (
        <li
          key={request.id}
          onClick={() => setSelectedRequest(index)}
          className={`p-4 cursor-pointer ${selectedRequest === index ? "bg-[#17cf60]/10 border-l-2 border-[#17cf60]" : "hover:bg-[#29382f]/50"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-semibold">{request.student}</h3>
              <p className="text-[#9db8a8] text-sm">
                Requesting {request.mentor}
              </p>
            </div>
            <span className="text-[#9db8a8] text-xs">
              {request.requestedDate}
            </span>
          </div>
          <p className="text-[#9db8a8] text-xs mt-1">
            Subject: {request.subject}
          </p>
        </li>
      ))}
    </ul>
  );
}
