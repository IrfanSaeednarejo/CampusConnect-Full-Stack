import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ADMIN_ROLES = ["super_admin", "admin", "campus_admin"];

export const checkAdminRole = (roles = [], required = "any_admin") => {
    if (required === "super_admin") return roles.includes("super_admin");
    return roles.some((r) => ADMIN_ROLES.includes(r));
};

/**
 * AdminRoute
 *
 * Wraps admin sub-routes. Redirects non-admins to /dashboard.
 *
 * Props:
 *   requiredRole: "any_admin" | "campus_admin" | "super_admin"
 */
const AdminRoute = ({ requiredRole = "any_admin" }) => {
    const { user } = useSelector((state) => state.auth);
    const hasAccess = user && checkAdminRole(user?.roles || [], requiredRole);

    if (!user) return <Navigate to="/login" replace />;
    if (!hasAccess) return <Navigate to="/dashboard" replace />;

    return <Outlet />;
};

export default AdminRoute;
