import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserProfile } from "@/redux/slices/userSlice";
// FIX [C3/S2]: Use async thunks that read from mockStorage instead of hardcoded data
import {
  fetchEvents,
  selectUpcomingEvents,
  selectOngoingEvents,
} from "@/redux/slices/eventsSlice";
import {
  fetchSocieties,
  selectMySocieties,
} from "@/redux/slices/societiesSlice";
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
  updateTaskStatus,
  selectAllTasks,
} from "@/redux/slices/tasksSlice";

import Button from "@/components/common/Button";
import EventCard from "@/components/dashboard/EventCard";
import NotificationWidget from "@/components/dashboard/NotificationWidget";
import SocietySummary from "@/components/dashboard/SocietySummary";
import TaskWidget from "@/components/dashboard/TaskWidget";
import StudentSidebar from "@/components/layout/StudentSidebar";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user profile and auth state
  const userProfile = useSelector(selectUserProfile);
  const authUser = useSelector((state) => state.auth?.user);
  const campusId = authUser?.campusId || userProfile?.campusId;

  const upcomingEvents = useSelector(selectUpcomingEvents) || [];
  const ongoingEvents = useSelector(selectOngoingEvents) || [];
  const registeredSocieties = useSelector(selectMySocieties) || [];
  const notifications = useSelector(selectAllNotifications) || [];
  const upcomingSessions = useSelector(selectUpcomingSessions) || [];

  // Tasks from Redux
  const tasks = useSelector(selectAllTasks) || [];
  const [newTask, setNewTask] = useState("");

  // Fetch data - removed strict campusId filtering to ensure all content is visible as requested
  useEffect(() => {
    // We can still pass campusId if we want to prioritize it, 
    // but the backend will now return more results.
    // For "All societies or events", we'll just fetch without strict filter if the user wants.
    const filters = {};
    dispatch(fetchEvents(filters));
    dispatch(fetchSocieties(filters));
    dispatch(fetchNotifications());
    dispatch(fetchSessions());
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleAddTask = () => {
    if (newTask.trim()) {
      dispatch(createTask({ title: newTask, status: "pending", dueDate: new Date().toISOString() }));
      setNewTask("");
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-text-primary text-4xl font-bold leading-tight tracking-tight">
              Welcome, {userProfile.name || "Student"}!
            </h1>
            <p className="text-text-secondary text-base font-normal leading-normal">
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
                <h2 className="text-text-primary text-xl font-bold leading-tight tracking-tight">
                  Upcoming Events
                </h2>
                <a
                  href="/student/events"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View All Events
                </a>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id || event._id}
                    event={{
                      ...event,
                      society: event.organizer || event.society,
                      date: event.startTime ? new Date(event.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : event.date || "TBD",
                      image: event.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuD9RA_fMuSaLKstjcMP5ozR-vSaxtqQ_kzINRu0QEbitLaiaOGSvhHQ0t3zi1Py769dste1tAWujcMGzeKsHP3LIDU8GpBrAtxlzAEKMTgoN2PCuAMYnxMVStac_6sgv9hNluDqsTZg4B7sFD-1sE6Uqn7KpdMC_eKzapyTUfan20XYGE2tBdjBB1D9B7MnCMh1-NNhn67QqbuDD5OKhys_-_9nTeollnRzd23QBgopcA4rmFIaSDdXU_42pp-765L5mTwpjWlySM8"
                    }}
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
              <h2 className="text-text-primary text-xl font-bold leading-tight tracking-tight mb-4">
                Mentoring Sessions
              </h2>
              <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-4">
                {upcomingSessions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {upcomingSessions.slice(0, 2).map((session) => (
                      <div key={session._id} className="p-3 bg-background border border-border rounded-lg flex items-center justify-between group hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs capitalize">
                            {session.mentorName?.charAt(0) || "M"}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{session.mentorName || "Mentor"}</p>
                            <p className="text-text-secondary text-[10px]">{session.date} • {session.time}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${session.status === 'confirmed' ? 'bg-primary/20 text-primary' : 'bg-[#e3b341]/20 text-[#e3b341]'}`}>
                          {session.status}
                        </span>
                      </div>
                    ))}
                    <Button
                      onClick={() => navigate("/student/sessions")}
                      variant="secondary"
                      className="w-full text-xs py-2"
                    >
                      View All ({upcomingSessions.length})
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-3 py-4">
                    <span className="text-4xl text-[#3d444d]">👨‍💼</span>
                    <p className="text-text-primary text-sm">No upcoming sessions.</p>
                    <p className="text-text-secondary text-xs">
                      Connect with experienced peers and alumni.
                    </p>
                    <Button
                      onClick={() => navigate("/student/book-mentor")}
                      variant="primary"
                      className="w-full py-2 text-sm"
                    >
                      <span>Book Now</span>
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* AI Agents */}
            <section>
              <h2 className="text-text-primary text-xl font-bold leading-tight tracking-tight mb-4">
                AI Assistants
              </h2>
              <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
                <button
                  onClick={() => navigate("/student/agents/study")}
                  className="w-full p-3 rounded-lg bg-[#1f2937] hover:bg-primary/10 border border-border hover:border-primary transition-all text-left"
                >
                  <p className="text-text-primary font-medium text-sm">
                    📚 Study Assistant
                  </p>
                  <p className="text-text-secondary text-xs mt-1">Learn & get study tips</p>
                </button>
                <button
                  onClick={() => navigate("/student/agents/mentor")}
                  className="w-full p-3 rounded-lg bg-[#1f2937] hover:bg-primary/10 border border-border hover:border-primary transition-all text-left"
                >
                  <p className="text-text-primary font-medium text-sm">
                    👥 Find Mentor
                  </p>
                  <p className="text-text-secondary text-xs mt-1">Match with mentors</p>
                </button>
                <button
                  onClick={() => navigate("/student/agents/wellbeing")}
                  className="w-full p-3 rounded-lg bg-[#1f2937] hover:bg-primary/10 border border-border hover:border-primary transition-all text-left"
                >
                  <p className="text-text-primary font-medium text-sm">
                    💚 Wellbeing Support
                  </p>
                  <p className="text-text-secondary text-xs mt-1">Mental health check-in</p>
                </button>
                <button
                  onClick={() => navigate("/student/agents/feedback")}
                  className="w-full p-3 rounded-lg bg-[#1f2937] hover:bg-primary/10 border border-border hover:border-primary transition-all text-left"
                >
                  <p className="text-text-primary font-medium text-sm">
                    📝 Send Feedback
                  </p>
                  <p className="text-text-secondary text-xs mt-1">Help us improve</p>
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
    </div>
  );
}
