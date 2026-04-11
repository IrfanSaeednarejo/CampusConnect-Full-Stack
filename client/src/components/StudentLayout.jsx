import { Outlet, useLocation, useNavigate } from "react-router-dom";
import StudentSidebar from "./layout/StudentSidebar";
import DashboardTopBar from "./common/DashboardTopBar";

// Map route paths to page titles
const TITLE_MAP = {
  "/student/dashboard": "Dashboard",
  "/student/events": "Events",
  "/student/societies": "Societies",
  "/student/book-mentor": "Find a Mentor",
  "/student/sessions": "My Sessions",
  "/student/messages": "Messages",
  "/student/tasks": "My Tasks",
  "/student/notifications": "Notifications",
  "/student/profile": "Profile",
  "/student/personal-notes": "Personal Notes",
  "/student/my-notes": "My Notes",
  "/student/academic-network": "Academic Network",
  "/student/notes": "Notes & Documents",
  "/student/research": "Research",
};

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle =
    TITLE_MAP[location.pathname] ||
    (location.pathname.startsWith("/student/agents") ? "AI Assistants" : "Student");

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text-primary">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar
          title={pageTitle}
          notificationsPath="/student/notifications"
          profilePath="/student/profile"
          roleBadge="Student"
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
