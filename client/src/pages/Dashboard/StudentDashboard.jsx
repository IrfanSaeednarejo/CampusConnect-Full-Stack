import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserProfile } from "@/redux/slices/userSlice";
import {
  fetchEvents,
  selectUpcomingEvents,
} from "@/redux/slices/eventsSlice";
import { getUserSocieties } from "@/api/societyApi";
import {
  fetchNotifications,
  selectAllNotifications,
} from "@/redux/slices/notificationsSlice";
import {
  fetchSessions,
  selectUpcomingSessions,
} from "@/redux/slices/sessionsSlice";
import {
  fetchTasks,
  createTask,
  selectAllTasks,
} from "@/redux/slices/tasksSlice";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userProfile = useSelector(selectUserProfile);
  const authUser = useSelector((state) => state.auth?.user);

  const upcomingEvents = useSelector(selectUpcomingEvents) || [];
  const [registeredSocieties, setRegisteredSocieties] = useState([]);
  const notifications = useSelector(selectAllNotifications) || [];
  const upcomingSessions = useSelector(selectUpcomingSessions) || [];
  const tasks = useSelector(selectAllTasks) || [];
  const [newTask, setNewTask] = useState("");

  // ─── Fetch all data ───
  useEffect(() => {
    dispatch(fetchEvents({}));
    dispatch(fetchNotifications());
    dispatch(fetchSessions());
    dispatch(fetchTasks());

    const userId = authUser?._id || authUser?.id;
    if (userId) {
      getUserSocieties(userId)
        .then((res) => {
          const data = res?.data?.societies || res?.data?.docs || res?.data || [];
          setRegisteredSocieties(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Failed to fetch user societies:", err));
    }
  }, [dispatch, authUser]);

  const handleAddTask = () => {
    if (newTask.trim()) {
      dispatch(createTask({ title: newTask, status: "pending", dueDate: new Date().toISOString() }));
      setNewTask("");
    }
  };

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Stat cards from real data
  const statCards = [
    { label: "Upcoming Events", value: upcomingEvents.length, icon: "event", gradient: "from-primary to-indigo-800" },
    { label: "My Societies", value: registeredSocieties.length, icon: "groups", gradient: "from-cyan-600 to-cyan-800" },
    { label: "Pending Tasks", value: tasks.filter((t) => t.status !== "completed" && !t.completed).length, icon: "task_alt", gradient: "from-amber-600 to-amber-800" },
    { label: "Mentor Sessions", value: upcomingSessions.length, icon: "school", gradient: "from-emerald-600 to-emerald-800" },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ─── Welcome Header ─── */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-text-primary text-2xl md:text-3xl font-bold">
              {greeting}, {userProfile?.name || authUser?.name || "Student"}! 👋
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Here&apos;s your campus activity at a glance.
            </p>
          </div>
          <button
            onClick={() => navigate("/study-groups")}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">groups</span>
            Find Study Group
          </button>
        </div>

        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4 bg-surface border border-border hover:border-primary/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3`}>
                <span className="material-symbols-outlined text-white text-[20px]">{card.icon}</span>
              </div>
              <p className="text-text-primary text-2xl font-bold">{card.value}</p>
              <p className="text-text-secondary text-xs mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Events */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-text-primary text-lg font-bold">Upcoming Events</h2>
                <button
                  onClick={() => navigate("/student/events")}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id || event._id}
                      onClick={() => navigate("/student/events")}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[18px]">event</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary text-sm font-semibold truncate">
                          {event.title || event.name}
                        </p>
                        <p className="text-text-secondary text-[11px] mt-0.5">
                          {event.startTime
                            ? new Date(event.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                            : event.date || "Date TBD"}
                          {event.location && ` • ${event.location}`}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-4xl mb-2">event_busy</span>
                  <p className="text-text-primary text-sm font-medium">No upcoming events</p>
                  <p className="text-text-secondary text-xs mt-1">Check back soon for new events!</p>
                </div>
              )}
            </div>

            {/* My Tasks */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-text-primary text-lg font-bold">My Tasks</h2>
                <button
                  onClick={() => navigate("/student/tasks")}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View All Tasks
                </button>
              </div>
              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.slice(0, 4).map((task) => {
                    const isDone = task.status === "completed" || task.completed;
                    return (
                      <button
                        key={task.id || task._id}
                        onClick={() => navigate("/student/tasks")}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors text-left"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] shrink-0 ${isDone
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-border"
                          }`}>
                          {isDone && "✓"}
                        </div>
                        <p className={`flex-1 text-sm truncate ${isDone ? "text-text-secondary line-through" : "text-text-primary"}`}>
                          {task.title || task.text}
                        </p>
                        {task.dueDate && (
                          <span className="text-text-secondary text-[10px] whitespace-nowrap">
                            {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="text-4xl mb-2">✅</span>
                  <p className="text-text-primary text-sm font-medium">All caught up!</p>
                  <p className="text-text-secondary text-xs mt-1">Add a new task below.</p>
                </div>
              )}
              {/* Add task input */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  placeholder="Add a new task..."
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm placeholder:text-text-secondary focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Registered Societies */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-text-primary text-lg font-bold">My Societies</h2>
                <button
                  onClick={() => navigate("/student/societies")}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              {registeredSocieties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {registeredSocieties.slice(0, 4).map((society) => {
                    const initial = (society.name || "S")[0].toUpperCase();
                    const imgUrl = society.logo || society.image || society.media?.logo;
                    return (
                      <button
                        key={society._id || society.id}
                        onClick={() => navigate(`/student/societies/${society._id || society.id}`)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors text-left"
                      >
                        {imgUrl && imgUrl.length > 5 ? (
                          <div
                            className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 border border-border"
                            style={{ backgroundImage: `url("${imgUrl}")` }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {initial}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary text-sm font-semibold truncate">{society.name}</p>
                          <p className="text-text-secondary text-[10px]">
                            {society.members?.length || society.memberCount || 0} members
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="material-symbols-outlined text-text-secondary text-4xl mb-2">group_off</span>
                  <p className="text-text-primary text-sm font-medium">No societies joined yet</p>
                  <button
                    onClick={() => navigate("/student/societies")}
                    className="mt-2 text-primary text-sm font-medium hover:underline"
                  >
                    Browse Societies →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Mentoring Sessions */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="text-text-primary text-lg font-bold mb-4">Mentoring Sessions</h2>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 2).map((session) => (
                    <button
                      key={session._id}
                      onClick={() => navigate("/student/sessions")}
                      className="w-full p-3 bg-background border border-border rounded-lg flex items-center justify-between hover:border-primary/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs capitalize">
                          {session.mentorName?.charAt(0) || "M"}
                        </div>
                        <div>
                          <p className="text-text-primary text-sm font-semibold">{session.mentorName || "Mentor"}</p>
                          <p className="text-text-secondary text-[10px]">{session.date} • {session.time}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${session.status === "confirmed"
                          ? "bg-primary/15 text-primary"
                          : "bg-amber-500/15 text-amber-500"
                        }`}>
                        {session.status}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => navigate("/student/sessions")}
                    className="w-full py-2.5 text-primary text-sm font-semibold rounded-lg border border-border hover:bg-surface-hover transition-colors"
                  >
                    View All ({upcomingSessions.length})
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="text-4xl mb-2">👨‍💼</span>
                  <p className="text-text-primary text-sm font-medium">No upcoming sessions</p>
                  <p className="text-text-secondary text-xs mt-1">Connect with experienced peers!</p>
                  <button
                    onClick={() => navigate("/student/book-mentor")}
                    className="mt-3 w-full py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Book a Mentor
                  </button>
                </div>
              )}
            </div>

            {/* AI Assistants */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="text-text-primary text-lg font-bold mb-4">AI Assistants</h2>
              <div className="space-y-2">
                {[
                  { label: "Study Assistant", desc: "Learn & get study tips", icon: "auto_stories", path: "/student/agents/study" },
                  { label: "Find Mentor", desc: "Match with mentors", icon: "people", path: "/student/agents/mentor" },
                  { label: "Wellbeing Support", desc: "Mental health check-in", icon: "favorite", path: "/student/agents/wellbeing" },
                  { label: "Send Feedback", desc: "Help us improve", icon: "rate_review", path: "/student/agents/feedback" },
                ].map((agent) => (
                  <button
                    key={agent.path}
                    onClick={() => navigate(agent.path)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-[18px]">{agent.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-medium text-sm">{agent.label}</p>
                      <p className="text-text-secondary text-[11px]">{agent.desc}</p>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-text-primary text-lg font-bold">Notifications</h2>
                <button
                  onClick={() => navigate("/student/notifications")}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.slice(0, 4).map((notif, i) => (
                    <div key={notif.id || notif._id || i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border bg-background">
                      <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">
                        {notif.type === "event" ? "event" : notif.type === "session" ? "school" : "notifications"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary text-xs truncate">{notif.title || notif.message}</p>
                        {notif.createdAt && (
                          <p className="text-text-secondary text-[10px] mt-0.5">
                            {formatTimeAgo(notif.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-sm text-center py-4">No new notifications.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper */
function formatTimeAgo(isoStr) {
  if (!isoStr) return "";
  const mins = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
