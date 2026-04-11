import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import DashboardTopBar from "../common/DashboardTopBar";
import { getAdminStats } from "../../api/adminApi";

// Map route paths to page titles
const TITLE_MAP = {
    "/admin/dashboard": "Dashboard",
    "/admin/users": "User Management",
    "/admin/events": "Events",
    "/admin/mentor-approvals": "Mentor Approvals",
    "/admin/societies": "Society Oversight",
    "/admin/analytics": "Analytics",
    "/admin/announcements": "Announcements",
    "/admin/society-head-approvals": "Approval Queue",
};

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);

    // Derive page title from current route
    const pageTitle = TITLE_MAP[location.pathname] || "Admin";

    // Fetch pending counts for the sidebar badge
    useEffect(() => {
        getAdminStats()
            .then((res) => {
                const s = res.data;
                setPendingCount((s?.pendingMentors || 0) + (s?.pendingSocietyHeads || 0));
            })
            .catch(() => { });
    }, [location.pathname]); // Re-fetch when navigating

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <AdminSidebar pendingCount={pendingCount} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardTopBar
                    title={pageTitle}
                    searchPlaceholder="Search users..."
                    onSearch={(q) => navigate(`/admin/users?search=${encodeURIComponent(q)}`)}
                    notificationsPath={null}
                    profilePath="/profile/view"
                    roleBadge="Admin"
                />

                {/* Page content — scrollable */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
