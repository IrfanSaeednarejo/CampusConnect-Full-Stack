import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserProfile } from "@/redux/slices/userSlice";
import { selectUpcomingEvents } from "@/redux/slices/eventSlice";
import { selectRegisteredSocieties } from "@/redux/slices/societySlice";
import { selectNotifications } from "@/redux/slices/notificationSlice";
import Button from "@/components/common/Button";
import EventCard from "@/components/dashboard/EventCard";
import NotificationWidget from "@/components/dashboard/NotificationWidget";
import SocietySummary from "@/components/dashboard/SocietySummary";
import TaskWidget from "@/components/dashboard/TaskWidget";
import useHomeTheme from "@/hooks/useHomeTheme";

const sidebarLinks = [
  { icon: "📊", label: "Dashboard", href: "/student/dashboard", active: true },
  { icon: "✅", label: "Tasks", href: "/student/tasks" },
  { icon: "📅", label: "Events", href: "/student/events" },
  { icon: "👥", label: "Societies", href: "/student/societies" },
  { icon: "🔗", label: "Network", href: "/student/academic-network" },
  { icon: "💬", label: "Messages", href: "/student/messages" },
  { icon: "🎓", label: "Mentoring", href: "/mentors" },
  { icon: "📝", label: "Notes", href: "/academics/notes" },
];

const aiAssistants = [
  {
    title: "📚 Study Assistant",
    description: "Learn and get study tips",
    path: "/student/agents/study",
  },
  {
    title: "👥 Find Mentor",
    description: "Match with mentors",
    path: "/student/agents/mentor",
  },
  {
    title: "💚 Wellbeing Support",
    description: "Mental health check-in",
    path: "/student/agents/wellbeing",
  },
  {
    title: "📝 Send Feedback",
    description: "Help us improve",
    path: "/student/agents/feedback",
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const userProfile = useSelector(selectUserProfile);
  const upcomingEvents = useSelector(selectUpcomingEvents);
  const registeredSocieties = useSelector(selectRegisteredSocieties);
  const notifications = useSelector(selectNotifications);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask("");
    }
  };

  const pageClassName = isDark
    ? "bg-[#0d1117] text-[#c9d1d9]"
    : "bg-[#f8fafc] text-[#0F172A]";
  const surfaceClassName = isDark
    ? "border-[#30363d] bg-[#161b22]"
    : "border-[#DCE4EE] bg-white";
  const mutedTextClassName = isDark ? "text-[#8b949e]" : "text-[#526277]";
  const titleClassName = isDark ? "text-[#e6edf3]" : "text-[#162033]";

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${pageClassName}`}>
      <div className="flex h-full">
        <aside
          className={`fixed hidden h-screen w-72 flex-col justify-between overflow-y-auto border-r p-5 lg:flex ${
            isDark ? "border-[#30363d] bg-[#0d1117]" : "border-[#DCE4EE] bg-[#f8fafc]"
          }`}
        >
          <div className="flex flex-col gap-5">
            <button
              onClick={() => navigate("/student/profile")}
              className={`flex items-center gap-3 rounded-[24px] border p-4 text-left transition-all duration-300 ${surfaceClassName}`}
            >
              <div
                className="h-10 w-10 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: userProfile?.avatar
                    ? `url("${userProfile.avatar}")`
                    : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuArj_dwVEXu6vzmlT6afGmhH-P_vfNeMG0QArGPe7pCuhjPDjoqtXQWJ-6iHMe84K0ML3iDOk8vH8EEWMQSw1f-Gf0vMJ2yPXE8AQIoO29dA_ixx6rBuKafMgf7gnj2yYJgMhcG1XLWX-7NWRMmhz87akFE_mQreb0Td1-xI25paXpdQS9LWhUAqaxNzU_M6plyRH_sCbSsKApcdFa1_VeSSglcaAs_t7DDGJN3ryveQN_LqpmzIDRJ0S6HDo6kNwysBVwRtLqlQrw")',
                }}
              />
              <div className="flex flex-col">
                <h1 className={`text-base font-medium ${titleClassName}`}>
                  {userProfile?.name || "Alex Johnson"}
                </h1>
                <p className={`text-sm ${mutedTextClassName}`}>
                  {userProfile?.department || "Computer Science"}
                </p>
              </div>
            </button>

            <nav className={`rounded-[24px] border p-3 ${surfaceClassName}`}>
              <div className="space-y-1">
                {sidebarLinks.map((link) => (
                  <a
                    key={link.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      link.active
                        ? isDark
                          ? "border border-[#2f5e3a] bg-[#238636]/20 text-[#3fb950]"
                          : "border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                        : isDark
                          ? "text-[#c9d1d9] hover:bg-[#161b22]"
                          : "text-[#334155] hover:bg-[#F8FAFC]"
                    }`}
                    href={link.href}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </nav>
          </div>

          <div className={`rounded-[24px] border p-3 ${surfaceClassName}`}>
            <a
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isDark ? "text-[#c9d1d9] hover:bg-[#161b22]" : "text-[#334155] hover:bg-[#F8FAFC]"
              }`}
              href="#"
            >
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </a>
            <a
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isDark ? "text-[#c9d1d9] hover:bg-[#161b22]" : "text-[#334155] hover:bg-[#F8FAFC]"
              }`}
              href="#"
            >
              <span className="text-lg">🚪</span>
              <span>Log out</span>
            </a>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:ml-72 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <section
              className={`mb-8 overflow-hidden rounded-[2rem] border px-6 py-7 transition-all duration-300 md:px-8 ${surfaceClassName}`}
              style={{
                boxShadow: isDark
                  ? "0 24px 70px rgba(0,0,0,0.24)"
                  : "0 24px 70px rgba(15,23,42,0.08)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span
                    className={`mb-2 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] ${
                      isDark
                        ? "border-[#30363d] bg-[#0d1117] text-[#58a6ff]"
                        : "border-[#C7D2FE] bg-white text-[#1D4ED8]"
                    }`}
                  >
                    STUDENT HUB
                  </span>
                  <h1 className={`text-3xl font-bold tracking-tight ${titleClassName}`}>Welcome, Alex!</h1>
                  <p className={`text-sm sm:text-base ${mutedTextClassName}`}>Your campus at a glance.</p>
                </div>
                <Button
                  onClick={() => navigate("/study-groups")}
                  variant="primary"
                  className={
                    !isDark
                      ? "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-[0_10px_24px_rgba(29,78,216,0.18)]"
                      : ""
                  }
                >
                  <span className="text-lg">👥</span>
                  <span className="truncate">Find Study Group</span>
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {["Smart task tracking", "Events and societies", "Mentor and AI support"].map((item) => (
                  <span
                    key={item}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-300 ${
                      isDark
                        ? "border-[#30363d] bg-[#0d1117] text-[#8b949e]"
                        : "border-[#D6DEE8] bg-white text-[#526277]"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className={`text-xl font-semibold ${titleClassName}`}>Upcoming Events</h2>
                    <a
                      href="/student/events"
                      className={isDark ? "text-sm font-medium text-[#3fb950] hover:underline" : "text-sm font-medium text-[#1D4ED8] hover:underline"}
                    >
                      View All Events
                    </a>
                  </div>
                  <div
                    className={`flex flex-col gap-4 rounded-[28px] border p-4 transition-all duration-300 ${surfaceClassName}`}
                    style={{
                      boxShadow: isDark
                        ? "0 20px 50px rgba(0,0,0,0.2)"
                        : "0 20px 50px rgba(15,23,42,0.06)",
                    }}
                  >
                    {upcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        variant="compact"
                        onPrimaryAction={() => navigate("/student/events")}
                      />
                    ))}
                  </div>
                </section>

                <TaskWidget
                  tasks={tasks}
                  newTask={newTask}
                  onTaskChange={setNewTask}
                  onAddTask={handleAddTask}
                  actionHref="/student/tasks"
                />

                <SocietySummary
                  title="Registered Societies"
                  societies={registeredSocieties}
                  actionLabel="View All Societies"
                  actionHref="/student/societies"
                  onItemClick={() => navigate("/student/societies")}
                />
              </div>

              <div className="flex flex-col gap-6 lg:col-span-1">
                <section
                  className={`rounded-[28px] border p-5 text-center transition-all duration-300 sm:p-6 ${surfaceClassName}`}
                  style={{
                    boxShadow: isDark
                      ? "0 20px 50px rgba(0,0,0,0.2)"
                      : "0 20px 50px rgba(15,23,42,0.06)",
                  }}
                >
                  <h2 className={`mb-4 text-xl font-semibold ${titleClassName}`}>Mentoring Sessions</h2>
                  <div className="flex flex-col items-center gap-4">
                    <span className={isDark ? "text-5xl text-[#3d444d]" : "text-5xl text-[#94A3B8]"}>👨‍💼</span>
                    <p className={titleClassName}>No upcoming sessions.</p>
                    <p className={`text-sm ${mutedTextClassName}`}>
                      Connect with experienced peers and alumni to guide your academic journey.
                    </p>
                    <Button
                      onClick={() => navigate("/student/sessions")}
                      variant="primary"
                      className={`w-full ${
                        !isDark
                          ? "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-[0_10px_24px_rgba(29,78,216,0.18)]"
                          : ""
                      }`}
                    >
                      <span>View My Sessions</span>
                    </Button>
                  </div>
                </section>

                <section
                  className={`rounded-[28px] border p-5 transition-all duration-300 sm:p-6 ${surfaceClassName}`}
                  style={{
                    boxShadow: isDark
                      ? "0 20px 50px rgba(0,0,0,0.2)"
                      : "0 20px 50px rgba(15,23,42,0.06)",
                  }}
                >
                  <h2 className={`mb-4 text-xl font-semibold ${titleClassName}`}>AI Assistants</h2>
                  <div className="space-y-2">
                    {aiAssistants.map((assistant) => (
                      <button
                        key={assistant.path}
                        onClick={() => navigate(assistant.path)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                          isDark
                            ? "border-[#30363d] bg-[#0d1117] hover:border-[#238636] hover:bg-[#238636]/10"
                            : "border-[#DCE4EE] bg-[#F8FAFC] hover:border-[#93C5FD] hover:bg-white"
                        }`}
                      >
                        <p className={`text-sm font-medium ${titleClassName}`}>{assistant.title}</p>
                        <p className={`mt-1 text-xs ${mutedTextClassName}`}>{assistant.description}</p>
                      </button>
                    ))}
                  </div>
                </section>

                <NotificationWidget notifications={notifications} linkHref="/student/notifications" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
