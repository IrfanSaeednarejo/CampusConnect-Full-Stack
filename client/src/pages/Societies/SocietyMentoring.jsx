import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMentors, getMentoringSessions } from "@/api/mentoringApi";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";
import SocietyTabs from "../../components/societies/SocietyTabs";

export default function SocietyMentoring() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mentors");
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch real mentors
        const mentorRes = await getAllMentors();
        const mentorData = mentorRes.data || mentorRes;
        const mentorList = mentorData?.docs || mentorData?.items || (Array.isArray(mentorData) ? mentorData : []);
        setMentors(mentorList);

        // Fetch real sessions
        try {
          const sessRes = await getMentoringSessions();
          const sessData = sessRes.data || sessRes;
          const sessList = Array.isArray(sessData) ? sessData : sessData?.bookings || sessData?.docs || [];
          setSessions(sessList);
        } catch {
          setSessions([]);
        }
      } catch (err) {
        console.error("Failed to fetch mentoring data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to extract display data from mentor objects
  const getMentorName = (m) =>
    m.userId?.profile?.displayName ||
    m.userId?.profile?.firstName ||
    m.name ||
    "Unnamed Mentor";

  const getMentorAvatar = (m) =>
    m.userId?.profile?.avatar || m.image || "";

  const getMentorInitial = (m) =>
    (getMentorName(m) || "M")[0].toUpperCase();

  const getMentorTitle = (m) =>
    m.title || m.expertise?.[0] || "Mentor";

  const getMentorSpecialty = (m) => {
    if (m.expertise?.length) return m.expertise.join(", ");
    return m.specialty || "General";
  };

  // Helper to extract session display data
  const getSessionMentor = (s) =>
    s.mentorId?.userId?.profile?.displayName ||
    s.mentorId?.name ||
    s.mentor ||
    "Mentor";

  const getSessionStudent = (s) =>
    s.studentId?.profile?.displayName ||
    s.studentId?.profile?.firstName ||
    s.student ||
    "Student";

  const getSessionDate = (s) => {
    const d = s.scheduledAt || s.date;
    if (!d) return "TBD";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSessionTime = (s) => {
    const d = s.scheduledAt || s.date;
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingSessions = sessions.filter(
    (s) => s.status === "pending" || s.status === "requested"
  );

  return (
    <div className="min-h-screen bg-background text-white">
      <SocietyPageHeader
        title="Mentoring Program"
        subtitle="Connect students with experienced mentors"
        icon="school"
        backPath="/society/dashboard"
      />

      <SocietyTabs
        tabs={[
          "mentors",
          "sessions",
          {
            value: "requests",
            label: "requests",
            badge: pendingSessions.length || null,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1dc964]"></div>
          </div>
        ) : (
          <>
            {/* Mentors Tab */}
            {activeTab === "mentors" && (
              <div>
                {mentors.length === 0 ? (
                  <div className="bg-surface border border-border rounded-lg p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-[#29382f] block mb-4">
                      school
                    </span>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No mentors found
                    </h3>
                    <p className="text-text-secondary">
                      There are currently no registered mentors on the platform.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map((mentor) => {
                      const avatar = getMentorAvatar(mentor);
                      const initial = getMentorInitial(mentor);
                      const colors = [
                        "from-green-400 to-blue-500",
                        "from-purple-500 to-indigo-500",
                        "from-pink-500 to-orange-400",
                        "from-blue-400 to-emerald-400",
                      ];
                      const colorClass =
                        colors[
                          (getMentorName(mentor) || "").length % colors.length
                        ];

                      return (
                        <div
                          key={mentor._id}
                          className="bg-surface border border-border rounded-lg p-6 hover:border-[#1dc964]/50 transition-colors"
                        >
                          <div className="flex flex-col items-center text-center">
                            {avatar ? (
                              <div
                                className="w-24 h-24 rounded-full bg-cover bg-center mb-4 ring-2 ring-[#29382f]"
                                style={{
                                  backgroundImage: `url("${avatar}")`,
                                }}
                              />
                            ) : (
                              <div
                                className={`w-24 h-24 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-3xl font-bold mb-4`}
                              >
                                {initial}
                              </div>
                            )}
                            <h3 className="text-white font-bold text-lg mb-1">
                              {getMentorName(mentor)}
                            </h3>
                            <p className="text-text-secondary text-sm mb-2">
                              {getMentorTitle(mentor)}
                            </p>
                            <span className="px-3 py-1 rounded-full bg-primary/20 text-[#1dc964] text-xs font-medium mb-4 truncate max-w-full">
                              {getMentorSpecialty(mentor)}
                            </span>
                            <div className="w-full space-y-2 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">
                                  Sessions:
                                </span>
                                <span className="text-white font-medium">
                                  {mentor.sessionsCompleted || mentor.sessions || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">Rating:</span>
                                <span className="text-white font-medium flex items-center gap-1">
                                  {(mentor.rating || 0).toFixed(1)}{" "}
                                  <span className="text-yellow-500">★</span>
                                </span>
                              </div>
                              {mentor.status && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-text-secondary">
                                    Status:
                                  </span>
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                      mentor.status === "approved"
                                        ? "bg-primary/20 text-[#1dc964]"
                                        : "bg-yellow-500/20 text-yellow-500"
                                    }`}
                                  >
                                    {mentor.status}
                                  </span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                navigate(
                                  `/mentor-profile/${mentor._id}`
                                )
                              }
                              className="w-full px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <div>
                {sessions.length === 0 ? (
                  <div className="bg-surface border border-border rounded-lg p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-[#29382f] block mb-4">
                      event_note
                    </span>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No sessions yet
                    </h3>
                    <p className="text-text-secondary">
                      Mentoring sessions will appear here once booked.
                    </p>
                  </div>
                ) : (
                  <div className="bg-surface border border-border rounded-lg p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">
                              Mentor
                            </th>
                            <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">
                              Student
                            </th>
                            <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">
                              Topic
                            </th>
                            <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">
                              Date
                            </th>
                            <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">
                              Time
                            </th>
                            <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map((session) => (
                            <tr
                              key={session._id}
                              className="border-b border-border hover:bg-white/5"
                            >
                              <td className="py-3 px-4 text-white">
                                {getSessionMentor(session)}
                              </td>
                              <td className="py-3 px-4 text-text-secondary">
                                {getSessionStudent(session)}
                              </td>
                              <td className="py-3 px-4 text-text-secondary">
                                {session.topic || "General"}
                              </td>
                              <td className="py-3 px-4 text-text-secondary">
                                {getSessionDate(session)}
                              </td>
                              <td className="py-3 px-4 text-text-secondary">
                                {getSessionTime(session)}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    session.status === "confirmed" ||
                                    session.status === "scheduled"
                                      ? "bg-primary/20 text-[#1dc964]"
                                      : session.status === "completed"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : session.status === "cancelled"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                                >
                                  {session.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" && (
              <div className="space-y-4">
                {pendingSessions.length === 0 ? (
                  <div className="bg-surface border border-border rounded-lg p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-[#29382f] block mb-4">
                      inbox
                    </span>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No pending requests
                    </h3>
                    <p className="text-text-secondary">
                      All mentoring requests have been processed.
                    </p>
                  </div>
                ) : (
                  pendingSessions.map((request) => (
                    <div
                      key={request._id}
                      className="bg-surface border border-border rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold">
                              {getSessionStudent(request)}
                            </h3>
                            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-medium">
                              {request.status}
                            </span>
                          </div>
                          <p className="text-text-secondary text-sm mb-2">
                            Wants to connect with:{" "}
                            <span className="text-white">
                              {getSessionMentor(request)}
                            </span>
                          </p>
                          <p className="text-text-secondary text-sm mb-2">
                            Topic:{" "}
                            <span className="text-white">
                              {request.topic || "General mentoring"}
                            </span>
                          </p>
                          <p className="text-text-secondary text-xs">
                            Requested on {getSessionDate(request)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface border border-border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-[#1dc964]">
                  {mentors.length}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  Active Mentors
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-[#1dc964]">
                  {sessions.length}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  Total Sessions
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-[#1dc964]">
                  {pendingSessions.length}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  Pending Requests
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
