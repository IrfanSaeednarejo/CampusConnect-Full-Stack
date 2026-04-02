import { Outlet } from "react-router-dom";
import StudentSidebar from "./layout/StudentSidebar";

export default function StudentLayout() {
  return (
    <div className="w-full bg-background text-text-primary min-h-screen">
      <div className="flex h-full min-h-[calc(100vh-65px)]">
        {/* Shared Sidebar */}
        <StudentSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
