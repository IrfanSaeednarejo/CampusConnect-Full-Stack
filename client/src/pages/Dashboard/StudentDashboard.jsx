import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserProfile } from "@/redux/slices/userSlice";
import { selectUpcomingEvents } from "@/redux/slices/eventSlice";
import { selectRegisteredSocieties } from "@/redux/slices/societySlice";
import { selectNotifications } from "@/redux/slices/notificationSlice";
import Button from "@/components/common/Button";
import EventCard from "@/components/dashboard/EventCard";
import NotificationWidget from "@/components/dashboard/NotificationWidget";
import SocietySummary from "@/components/dashboard/SocietySummary";
import TaskWidget from "@/components/dashboard/TaskWidget";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux selectors
  const userProfile = useSelector(selectUserProfile);
  const upcomingEvents = useSelector(selectUpcomingEvents);
  const registeredSocieties = useSelector(selectRegisteredSocieties);
  const notifications = useSelector(selectNotifications);
  
  // Local state for tasks
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Data fetched from API via thunks inside respective pages/components
  useEffect(() => {
    // Empty for now: global fetches happen in Root/Layout or specifically in Dashboard component if needed
  }, [dispatch]);

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask("");
    }
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      <div className="flex h-full">
        {/* Sidebar - Hidden on mobile, visible on lg */}
        <aside className="hidden lg:flex w-64 bg-[#0d1117] border-r border-[#30363d] flex-col justify-between p-4 fixed h-screen overflow-y-auto">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/student/profile")}
              className="flex gap-3 items-center hover:opacity-80 transition-opacity"
            >
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: userProfile.avatar
                    ? `url("${userProfile.avatar}")`
                    : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuArj_dwVEXu6vzmlT6afGmhH-P_vfNeMG0QArGPe7pCuhjPDjoqtXQWJ-6iHMe84K0ML3iDOk8vH8EEWMQSw1f-Gf0vMJ2yPXE8AQIoO29dA_ixx6rBuKafMgf7gnj2yYJgMhcG1XLWX-7NWRMmhz87akFE_mQreb0Td1-xI25paXpdQS9LWhUAqaxNzU_M6plyRH_sCbSsKApcdFa1_VeSSglcaAs_t7DDGJN3ryveQN_LqpmzIDRJ0S6HDo6kNwysBVwRtLqlQrw")',
                }}
              />
              <div className="flex flex-col">
                <h1 className="text-[#c9d1d9] text-base font-medium leading-normal">
                  {userProfile.name || "Alex Johnson"}
                </h1>
                <p className="text-[#8b949e] text-sm font-normal leading-normal">
                  {userProfile.department || "Computer Science"}
                </p>
              </div>
            </button>
            <nav className="flex flex-col gap-2 mt-4">
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#238636]/20 text-[#238636]"
                href="/student/dashboard"
              >
                <span className="text-[#238636] text-lg">📊</span>
                <p className="text-[#238636] text-sm font-medium leading-normal">
                  Dashboard
                </p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#161b22] text-[#c9d1d9]"
                href="/student/tasks"
              >
                <span className="text-lg">✅</span>
                <p className="text-sm font-medium leading-normal">Tasks</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#161b22] text-[#c9d1d9]"
                href="/student/events"
              >
                <span className="text-lg">📅</span>
                <p className="text-sm font-medium leading-normal">Events</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#161b22] text-[#c9d1d9]"
                href="/student/societies"
              >
                <span className="text-lg">👥</span>
                <p className="text-sm font-medium leading-normal">Societies</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#161b22] text-[#c9d1d9]"
                href="/student/academic-network"
              >
                <span className="text-lg">🔗</span>
                <p className="text-sm font-medium leading-normal">Network</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#161b22] text-[#c9d1d9]"
                href="/student/messages"
              >
                <span className="text-lg">💬</span>
                <p className="text-sm font-medium leading-normal">Messages</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#161b22] text-[#c9d1d9]"
                href="/mentors"
              >
                <span className="text-lg">🎓</span>
                <p className="text-sm font-medium leading-normal">Mentoring</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#161b22] text-[#c9d1d9]"
                href="/academics/notes"
              >
                <span className="text-lg">📝</span>
                <p className="text-sm font-medium leading-normal">Notes</p>
              </a>
            </nav>
          </div>
          <div className="flex flex-col gap-1">
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#161b22] text-[#c9d1d9]"
              href="#"
            >
              <span className="text-lg">⚙️</span>
              <p className="text-sm font-medium leading-normal">Settings</p>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#161b22] text-[#c9d1d9]"
              href="#"
            >
              <span className="text-lg">🚪</span>
              <p className="text-sm font-medium leading-normal">Log out</p>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <h1 className="text-[#c9d1d9] text-4xl font-bold leading-tight tracking-tight">
                  Welcome, Alex!
                </h1>
                <p className="text-[#8b949e] text-base font-normal leading-normal">
                  Your campus at a glance.
                </p>
              </div>
              <Button
                onClick={() => navigate("/study-groups")}
                variant="primary"
              >
                <span className="text-lg">👥</span>
                <span className="truncate">Find Study Group</span>
              </Button>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Upcoming Events */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[#c9d1d9] text-xl font-bold leading-tight tracking-tight">
                      Upcoming Events
                    </h2>
                    <a
                      href="/student/events"
                      className="text-[#238636] text-sm font-medium hover:underline"
                    >
                      View All Events
                    </a>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col gap-4">
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

                {/* My Tasks */}
                <TaskWidget
                  tasks={tasks}
                  newTask={newTask}
                  onTaskChange={setNewTask}
                  onAddTask={handleAddTask}
                  actionHref="/student/tasks"
                />

                {/* Registered Societies */}
                <SocietySummary
                  title="Registered Societies"
                  societies={registeredSocieties}
                  actionLabel="View All Societies"
                  actionHref="/student/societies"
                  onItemClick={() => navigate("/student/societies")}
                />
              </div>

              {/* Right Column - 1/3 width */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Mentoring Sessions */}
                <section>
                  <h2 className="text-[#c9d1d9] text-xl font-bold leading-tight tracking-tight mb-4">
                    Mentoring Sessions
                  </h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex flex-col items-center text-center gap-4">
                    <span className="text-5xl text-[#3d444d]">👨‍💼</span>
                    <p className="text-[#c9d1d9]">No upcoming sessions.</p>
                    <p className="text-[#8b949e] text-sm">
                      Connect with experienced peers and alumni to guide your
                      academic journey.
                    </p>
                    <Button
                      onClick={() => navigate("/student/sessions")}
                      variant="primary"
                      className="w-full"
                    >
                      <span>View My Sessions</span>
                    </Button>
                  </div>
                </section>

                {/* AI Agents */}
                <section>
                  <h2 className="text-[#c9d1d9] text-xl font-bold leading-tight tracking-tight mb-4">
                    AI Assistants
                  </h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-2">
                    <button
                      onClick={() => navigate("/student/agents/study")}
                      className="w-full p-3 rounded-lg bg-[#1f2937] hover:bg-[#238636]/10 border border-[#30363d] hover:border-[#238636] transition-all text-left"
                    >
                      <p className="text-[#c9d1d9] font-medium text-sm">
                        📚 Study Assistant
                      </p>
                      <p className="text-[#8b949e] text-xs mt-1">Learn & get study tips</p>
                    </button>
                    <button
                      onClick={() => navigate("/student/agents/mentor")}
                      className="w-full p-3 rounded-lg bg-[#1f2937] hover:bg-[#238636]/10 border border-[#30363d] hover:border-[#238636] transition-all text-left"
                    >
                      <p className="text-[#c9d1d9] font-medium text-sm">
                        👥 Find Mentor
                      </p>
                      <p className="text-[#8b949e] text-xs mt-1">Match with mentors</p>
                    </button>
                    <button
                      onClick={() => navigate("/student/agents/wellbeing")}
                      className="w-full p-3 rounded-lg bg-[#1f2937] hover:bg-[#238636]/10 border border-[#30363d] hover:border-[#238636] transition-all text-left"
                    >
                      <p className="text-[#c9d1d9] font-medium text-sm">
                        💚 Wellbeing Support
                      </p>
                      <p className="text-[#8b949e] text-xs mt-1">Mental health check-in</p>
                    </button>
                    <button
                      onClick={() => navigate("/student/agents/feedback")}
                      className="w-full p-3 rounded-lg bg-[#1f2937] hover:bg-[#238636]/10 border border-[#30363d] hover:border-[#238636] transition-all text-left"
                    >
                      <p className="text-[#c9d1d9] font-medium text-sm">
                        📝 Send Feedback
                      </p>
                      <p className="text-[#8b949e] text-xs mt-1">Help us improve</p>
                    </button>
                  </div>
                </section>

                {/* Notifications */}
                <NotificationWidget
                  notifications={notifications}
                  linkHref="/student/notifications"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
