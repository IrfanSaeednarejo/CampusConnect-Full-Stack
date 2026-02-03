import React from "react";

export default function MentorshipRequestDetails({ request }) {
  if (!request) return null;
  return (
    <div className="flex flex-col p-8 gap-6 flex-1">
      <div>
        <h2 className="text-white text-2xl font-bold mb-4">
          Mentorship Request Details
        </h2>
        <div className="space-y-4">
          <div>
            <h4 className="text-[#9db8a8] text-sm font-semibold uppercase tracking-wider mb-2">
              Student
            </h4>
            <div className="flex items-center gap-3">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 bg-gray-700"></div>
              <div>
                <p className="text-white font-medium">{request.student}</p>
                {request.studentEmail && (
                  <p className="text-[#9db8a8] text-sm">
                    {request.studentEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[#9db8a8] text-sm font-semibold uppercase tracking-wider mb-2">
              Requested Mentor
            </h4>
            <div className="flex items-center gap-3">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 bg-gray-700"></div>
              <div>
                <p className="text-white font-medium">{request.mentor}</p>
                {request.mentorEmail && (
                  <p className="text-[#9db8a8] text-sm">
                    {request.mentorEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[#9db8a8] text-sm font-semibold uppercase tracking-wider mb-2">
              Subject Area
            </h4>
            <p className="text-white">{request.subject}</p>
          </div>
          {request.message && (
            <div>
              <h4 className="text-[#9db8a8] text-sm font-semibold uppercase tracking-wider mb-2">
                Student Message
              </h4>
              <p className="text-white/90 leading-relaxed">{request.message}</p>
            </div>
          )}
          <div>
            <h4 className="text-[#9db8a8] text-sm font-semibold uppercase tracking-wider mb-2">
              Requested Date
            </h4>
            <p className="text-white">{request.requestedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
