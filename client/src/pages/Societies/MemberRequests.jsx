import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectMemberRequests,
  setMemberRequests,
  approveMemberRequest,
  rejectMemberRequest,
} from "../../redux/slices/societySlice";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";

export default function MemberRequests() {
  const dispatch = useDispatch();
  const requests = useSelector(selectMemberRequests);

  useEffect(() => {
    if (requests.length === 0) {
      dispatch(
        setMemberRequests([
          {
            id: 1,
            name: "Jordan Smith",
            email: "jordan@example.com",
            society: "Tech Innovators Club",
            reason:
              "I'm passionate about technology and want to contribute to the community",
            requestDate: "Nov 28, 2024",
            status: "Pending",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuArj_dwVEXu6vzmlT6afGmhH-P_vfNeMG0QArGPe7pCuhjPDjoqtXQWJ-6iHMe84K0ML3iDOk8vH8EEWMQSw1f-Gf0vMJ2yPXE8AQIoO29dA_ixx6rBuKafMgf7gnj2yYJgMhcG1XLWX-7NWRMmhz87akFE_mQreb0Td1-xI25paXpdQS9LWhUAqaxNzU_M6plyRH_sCbSsKApcdFa1_VeSSglcaAs_t7DDGJN3ryveQN_LqpmzIDRJ0S6HDo6kNwysBVwRtLqlQrw",
          },
          {
            id: 2,
            name: "Alex Turner",
            email: "alex@example.com",
            society: "Tech Innovators Club",
            reason: "Looking to expand my network and learn from experienced members",
            requestDate: "Nov 27, 2024",
            status: "Pending",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuA5tRFcE_pFi824MNGNisea0s5XZIR-b-IBAuIchECnJ8ET_u-MZqJKAyC1Cd23hxZ-D0-3ffLxaYR2zyFNLQmsHcU3Iruq3o4_vdBPWs1U7i8yk5F34fm_X6kO9H3r8GanzhHM0DrnO_jKDwK2Ab9Xg-H6Tn7lEQKQnLKqhIGiJK9_1BI7njNayzMDHBkmlbjVHXmYsdsbfWllwCUJLUJx0x3aCnvMx8K49KhPKH4lhFB9yeHgKSJb8pin4eAoUF2y0YxIY0qw4GI",
          },
          {
            id: 3,
            name: "Casey Morgan",
            email: "casey@example.com",
            society: "Entrepreneurs of Tomorrow",
            reason:
              "Aspiring entrepreneur seeking mentorship and collaboration opportunities",
            requestDate: "Nov 26, 2024",
            status: "Pending",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDoQNTWTBvvjCWzGT4LSr1h0qdUOa09wVzKeBx1TX53dyRxgmKHYTDS1TN_XJ-VLe34SDS9ynUpvRNZSRm9Ye3nIOTGeARiF7VoBHRUOoJngE52BBV8TselfYt8GNnQI7A7KevlQzgglbGZlfLMMrKCIFTH_dcWm8clNTFCXKbZchH9FtsE5gMqjY5bl9q-XSz00KbL43PLMbTkQKskFEdjkkYVQLBXyt7kcQRB0O_KhbQDbbDkd0EZRslHm881dAppEobIhYUK95E",
          },
        ])
      );
    }
  }, [dispatch, requests.length]);

  const handleApprove = (id) => {
    dispatch(approveMemberRequest(id));
    alert("Member request approved!");
  };

  const handleReject = (id) => {
    dispatch(rejectMemberRequest(id));
    alert("Member request rejected.");
  };

  return (
    <div className="min-h-screen bg-[#111714] text-white">
      {/* Header */}
      <SocietyPageHeader
        title="Member Requests"
        subtitle="Review and approve new members"
        icon="person_add"
        backPath="/society/dashboard"
        action={
          requests.length > 0 ? (
            <span className="px-4 py-2 rounded-full bg-[#1dc964]/20 text-[#1dc964] font-bold">
              {requests.length} Pending
            </span>
          ) : null
        }
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {requests.length === 0 ? (
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-[#29382f] block mb-4">
              inbox
            </span>
            <h3 className="text-xl font-semibold text-white mb-2">
              No pending requests
            </h3>
            <p className="text-[#9eb7a9]">
              All member requests have been reviewed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6 hover:border-[#1dc964]/50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  {/* Profile Image */}
                  <div
                    className="w-20 h-20 rounded-full bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url("${request.image}")` }}
                  />

                  {/* Request Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">
                          {request.name}
                        </h3>
                        <p className="text-[#9eb7a9] text-sm mb-1">
                          {request.email}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#9eb7a9]">
                          <span className="material-symbols-outlined text-sm">
                            badge
                          </span>
                          <span>{request.society}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-medium">
                        {request.status}
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="bg-[#111714] border border-[#29382f] rounded-lg p-4 mb-4">
                      <p className="text-[#9eb7a9] text-sm font-medium mb-2">
                        Reason for Joining:
                      </p>
                      <p className="text-white text-sm">{request.reason}</p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-[#9eb7a9] mb-4">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        Requested on {request.requestDate}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 px-6 py-2 rounded-lg bg-[#1dc964] text-[#111714] font-bold hover:bg-[#1dc964]/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">
                          check_circle
                        </span>
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex-1 px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">
                          cancel
                        </span>
                        Reject
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-[#29382f] text-white font-medium hover:bg-[#29382f]/80 transition-colors">
                        <span className="material-symbols-outlined">
                          more_vert
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {requests.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-[#1dc964]">
                {requests.length}
              </div>
              <div className="text-sm text-[#9eb7a9] mt-1">
                Pending Requests
              </div>
            </div>
            <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-[#1dc964]">12</div>
              <div className="text-sm text-[#9eb7a9] mt-1">Approved Today</div>
            </div>
            <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-[#1dc964]">245</div>
              <div className="text-sm text-[#9eb7a9] mt-1">Total Members</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
