import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useHomeTheme from "../../hooks/useHomeTheme";
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
import IconButton from "../../components/common/IconButton";
import { getButtonClassName } from "../../components/common/Button";
import { cn, getSocietyTheme } from "./societyTheme";

function SurfaceCard({ children, theme, className = "" }) {
  return <div className={cn("rounded-3xl border", theme.card, className)}>{children}</div>;
}

export default function SocietyMentoring() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);
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
    <div className={cn("min-h-screen", theme.page)}>
      <SocietyPageHeader
        title="Mentoring Program"
        subtitle="Connect students with experienced mentors."
        icon="school"
        backPath="/society/dashboard"
        action={
          <button className={getButtonClassName({ variant: "primary", size: "md", isDark })}>
            <span className="material-symbols-outlined">add</span>
            Add Mentor
          </button>
        }
      />

      <SocietyTabs
        tabs={[
          "mentors",
          "sessions",
          { value: "requests", label: "requests", badge: requests.length || null },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "mentors" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mentors.map((mentor) => (
              <SurfaceCard key={mentor.id} theme={theme} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="mb-5 h-24 w-24 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${mentor.image}")` }}
                  />
                  <h3 className={cn("text-lg font-medium", theme.text)}>{mentor.name}</h3>
                  <p className={cn("mt-1 text-sm", theme.muted)}>{mentor.title}</p>
                  <span className={cn("mt-4 rounded-full border px-3 py-1 text-xs font-semibold", theme.badge)}>
                    {mentor.specialty}
                  </span>

                  <div className="mt-5 w-full space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className={theme.muted}>Sessions</span>
                      <span className={cn("font-medium", theme.text)}>{mentor.sessions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={theme.muted}>Rating</span>
                      <span className={cn("font-medium", theme.text)}>{mentor.rating} ★</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className={theme.muted}>Society</span>
                      <span className={cn("truncate font-medium", theme.text)}>{mentor.society}</span>
                    </div>
                  </div>

                  <button className={getButtonClassName({ variant: "secondary", size: "md", isDark, className: "mt-6 w-full" })}>
                    View Profile
                  </button>
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}

        {activeTab === "sessions" && (
          <SurfaceCard theme={theme} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={cn("border-b", theme.divider)}>
                  <tr>
                    {["Mentor", "Student", "Topic", "Date", "Time", "Status", "Actions"].map((heading) => (
                      <th key={heading} className={cn("px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]", theme.muted)}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className={cn("border-b last:border-b-0", theme.divider)}>
                      <td className={cn("px-4 py-4 text-sm font-medium", theme.text)}>{session.mentor}</td>
                      <td className={cn("px-4 py-4 text-sm", theme.muted)}>{session.student}</td>
                      <td className={cn("px-4 py-4 text-sm", theme.muted)}>{session.topic}</td>
                      <td className={cn("px-4 py-4 text-sm", theme.muted)}>{session.date}</td>
                      <td className={cn("px-4 py-4 text-sm", theme.muted)}>{session.time}</td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                            session.status === "Scheduled" ? theme.badge : theme.badgeMuted
                          )}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <IconButton
                          icon="more_vert"
                          title="Session actions"
                          variant="ghost"
                          size="icon-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        )}

        {activeTab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <SurfaceCard theme={theme} className="p-12 text-center">
                <span className={cn("material-symbols-outlined mb-4 block text-6xl", theme.muted)}>inbox</span>
                <h3 className={cn("text-xl font-semibold", theme.text)}>No pending requests</h3>
                <p className={cn("mt-2 text-sm", theme.muted)}>All mentoring requests have been processed.</p>
              </SurfaceCard>
            ) : (
              requests.map((request) => (
                <SurfaceCard key={request.id} theme={theme} className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={cn("text-lg font-medium", theme.text)}>{request.student}</h3>
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400">
                          {request.status}
                        </span>
                      </div>
                      <p className={cn("text-sm", theme.muted)}>
                        Wants to connect with <span className={theme.text}>{request.mentor}</span>
                      </p>
                      <p className={cn("text-sm", theme.muted)}>
                        Topic: <span className={theme.text}>{request.topic}</span>
                      </p>
                      <p className={cn("text-xs", theme.muted)}>Requested on {request.requestedDate}</p>
                    </div>

                    <div className="flex gap-3">
                      <button className={getButtonClassName({ variant: "success", size: "md", isDark })}>
                        Approve
                      </button>
                      <button className={getButtonClassName({ variant: "secondary", size: "md", isDark })}>
                        Decline
                      </button>
                    </div>
                  </div>
                </SurfaceCard>
              ))
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { value: mentors.length, label: "Active Mentors" },
            { value: sessions.length, label: "Total Sessions" },
            { value: requests.length, label: "Pending Requests" },
          ].map((stat) => (
            <SurfaceCard key={stat.label} theme={theme} className="p-5 text-center">
              <div className={cn("text-3xl font-bold", isDark ? "text-emerald-400" : "text-slate-900")}>{stat.value}</div>
              <div className={cn("mt-2 text-sm", theme.muted)}>{stat.label}</div>
            </SurfaceCard>
          ))}
        </div>
      </main>
    </div>
  );
}
