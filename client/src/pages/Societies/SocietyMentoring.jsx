import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllMentors,
  selectAllSessions,
  selectAllRequests,
  setMentors,
  setSessions,
  setRequests,
} from "../../redux/slices/mentoringSlice";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";
import SocietyTabs from "../../components/societies/SocietyTabs";

export default function SocietyMentoring() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("mentors");
  const mentors = useSelector(selectAllMentors);
  const sessions = useSelector(selectAllSessions);
  const requests = useSelector(selectAllRequests);

  useEffect(() => {
    if (mentors.length === 0) {
      dispatch(
        setMentors([
          {
            id: 1,
            name: "Dr. Sarah Mitchell",
            title: "Senior Software Engineer",
            specialty: "Full Stack Development",
            society: "Tech Innovators Club",
            sessions: 24,
            rating: 4.9,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuArj_dwVEXu6vzmlT6afGmhH-P_vfNeMG0QArGPe7pCuhjPDjoqtXQWJ-6iHMe84K0ML3iDOk8vH8EEWMQSw1f-Gf0vMJ2yPXE8AQIoO29dA_ixx6rBuKafMgf7gnj2yYJgMhcG1XLWX-7NWRMmhz87akFE_mQreb0Td1-xI25paXpdQS9LWhUAqaxNzU_M6plyRH_sCbSsKApcdFa1_VeSSglcaAs_t7DDGJN3ryveQN_LqpmzIDRJ0S6HDo6kNwysBVwRtLqlQrw",
          },
          {
            id: 2,
            name: "Michael Chen",
            title: "Entrepreneur & Investor",
            specialty: "Startup Strategy",
            society: "Entrepreneurs of Tomorrow",
            sessions: 18,
            rating: 5.0,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuA5tRFcE_pFi824MNGNisea0s5XZIR-b-IBAuIchECnJ8ET_u-MZqJKAyC1Cd23hxZ-D0-3ffLxaYR2zyFNLQmsHcU3Iruq3o4_vdBPWs1U7i8yk5F34fm_X6kO9H3r8GanzhHM0DrnO_jKDwK2Ab9Xg-H6Tn7lEQKQnLKqhIGiJK9_1BI7njNayzMDHBkmlbjVHXmYsdsbfWllwCUJLUJx0x3aCnvMx8K49KhPKH4lhFB9yeHgKSJb8pin4eAoUF2y0YxIY0qw4GI",
          },
          {
            id: 3,
            name: "Prof. Emily Rodriguez",
            title: "Communication Coach",
            specialty: "Public Speaking & Debate",
            society: "Debate Society",
            sessions: 31,
            rating: 4.8,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDoQNTWTBvvjCWzGT4LSr1h0qdUOa09wVzKeBx1TX53dyRxgmKHYTDS1TN_XJ-VLe34SDS9ynUpvRNZSRm9Ye3nIOTGeARiF7VoBHRUOoJngE52BBV8TselfYt8GNnQI7A7KevlQzgglbGZlfLMMrKCIFTH_dcWm8clNTFCXKbZchH9FtsE5gMqjY5bl9q-XSz00KbL43PLMbTkQKskFEdjkkYVQLBXyt7kcQRB0O_KhbQDbbDkd0EZRslHm881dAppEobIhYUK95E",
          },
        ])
      );
    }
  }, [dispatch, mentors.length]);

  useEffect(() => {
    if (sessions.length === 0) {
      dispatch(
        setSessions([
          {
            id: 1,
            mentor: "Dr. Sarah Mitchell",
            student: "Alex Johnson",
            date: "Nov 30, 2024",
            time: "2:00 PM",
            topic: "React Best Practices",
            status: "Scheduled",
          },
          {
            id: 2,
            mentor: "Michael Chen",
            student: "Jordan Lee",
            date: "Dec 1, 2024",
            time: "4:00 PM",
            topic: "Startup Funding Strategies",
            status: "Scheduled",
          },
          {
            id: 3,
            mentor: "Prof. Emily Rodriguez",
            student: "Taylor Smith",
            date: "Nov 28, 2024",
            time: "10:00 AM",
            topic: "Debate Preparation",
            status: "Completed",
          },
        ])
      );
    }
  }, [dispatch, sessions.length]);

  useEffect(() => {
    if (requests.length === 0) {
      dispatch(
        setRequests([
          {
            id: 1,
            student: "Chris Wilson",
            mentor: "Dr. Sarah Mitchell",
            topic: "Career guidance in software engineering",
            requestedDate: "Nov 25, 2024",
            status: "Pending",
          },
          {
            id: 2,
            student: "Sam Parker",
            mentor: "Michael Chen",
            topic: "Business plan review",
            requestedDate: "Nov 26, 2024",
            status: "Pending",
          },
        ])
      );
    }
  }, [dispatch, requests.length]);

  return (
    <div className="min-h-screen bg-[#111714] text-white">
      {/* Header */}
      <SocietyPageHeader
        title="Mentoring Program"
        subtitle="Connect students with experienced mentors"
        icon="school"
        backPath="/society/dashboard"
        action={
          <button className="px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-bold hover:bg-[#1dc964]/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">add</span>
            Add Mentor
          </button>
        }
      />

      {/* Tabs */}
      <SocietyTabs
        tabs={[
          "mentors",
          "sessions",
          { value: "requests", label: "requests", badge: requests.length || null },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mentors Tab */}
        {activeTab === "mentors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6 hover:border-[#1dc964]/50 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-24 h-24 rounded-full bg-cover bg-center mb-4"
                    style={{ backgroundImage: `url("${mentor.image}")` }}
                  />
                  <h3 className="text-white font-bold text-lg mb-1">
                    {mentor.name}
                  </h3>
                  <p className="text-[#9eb7a9] text-sm mb-2">
                    {mentor.title}
                  </p>
                  <span className="px-3 py-1 rounded-full bg-[#1dc964]/20 text-[#1dc964] text-xs font-medium mb-4">
                    {mentor.specialty}
                  </span>
                  <div className="w-full space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#9eb7a9]">Sessions:</span>
                      <span className="text-white font-medium">
                        {mentor.sessions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#9eb7a9]">Rating:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        {mentor.rating} <span className="text-yellow-500">★</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#9eb7a9]">Society:</span>
                      <span className="text-white font-medium text-xs">
                        {mentor.society.split(" ")[0]}...
                      </span>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-medium hover:bg-[#1dc964]/90 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#29382f]">
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Mentor
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Topic
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-[#29382f] hover:bg-white/5"
                    >
                      <td className="py-3 px-4 text-white">{session.mentor}</td>
                      <td className="py-3 px-4 text-[#9eb7a9]">
                        {session.student}
                      </td>
                      <td className="py-3 px-4 text-[#9eb7a9]">
                        {session.topic}
                      </td>
                      <td className="py-3 px-4 text-[#9eb7a9]">
                        {session.date}
                      </td>
                      <td className="py-3 px-4 text-[#9eb7a9]">
                        {session.time}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === "Scheduled"
                              ? "bg-[#1dc964]/20 text-[#1dc964]"
                              : "bg-[#9eb7a9]/20 text-[#9eb7a9]"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-[#9eb7a9] hover:text-white">
                          <span className="material-symbols-outlined text-lg">
                            more_vert
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-[#29382f] block mb-4">
                  inbox
                </span>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No pending requests
                </h3>
                <p className="text-[#9eb7a9]">
                  All mentoring requests have been processed.
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">
                          {request.student}
                        </h3>
                        <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-medium">
                          {request.status}
                        </span>
                      </div>
                      <p className="text-[#9eb7a9] text-sm mb-2">
                        Wants to connect with:{" "}
                        <span className="text-white">{request.mentor}</span>
                      </p>
                      <p className="text-[#9eb7a9] text-sm mb-2">
                        Topic: <span className="text-white">{request.topic}</span>
                      </p>
                      <p className="text-[#9eb7a9] text-xs">
                        Requested on {request.requestedDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-medium hover:bg-[#1dc964]/90 transition-colors">
                        Approve
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-[#29382f] text-white text-sm font-medium hover:bg-[#29382f]/80 transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-[#1dc964]">
              {mentors.length}
            </div>
            <div className="text-sm text-[#9eb7a9] mt-1">Active Mentors</div>
          </div>
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-[#1dc964]">
              {sessions.length}
            </div>
            <div className="text-sm text-[#9eb7a9] mt-1">Total Sessions</div>
          </div>
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-[#1dc964]">
              {requests.length}
            </div>
            <div className="text-sm text-[#9eb7a9] mt-1">Pending Requests</div>
          </div>
        </div>
      </main>
    </div>
  );
}
