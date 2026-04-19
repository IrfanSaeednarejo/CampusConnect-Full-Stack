/**
 * maintenance.middleware.js
 *
 * Module-level flag toggled by the system admin controller.
 * Returns 503 for all non-admin, non-login routes when active.
 *
 * Registration in app.js (immediately after body parsers):
 *   import { checkMaintenance } from "./src/middlewares/maintenance.middleware.js";
 *   app.use(checkMaintenance);
 */

let maintenanceMode = false;

/** Toggle maintenance mode (called by system admin controller). */
export const setMaintenanceMode = (val) => {
    maintenanceMode = !!val;
    console.info(`[Maintenance] Mode ${maintenanceMode ? "ENABLED" : "DISABLED"}`);
};

/** Read current mode (exposed to health check endpoint). */
export const getMaintenanceMode = () => maintenanceMode;

/**
 * Express middleware.
 *
 * Bypassed for:
 *   - /api/v1/admin/*      — admins can always work
 *   - /api/v1/users/login  — so admins can log in
 *   - /api/v1/users/refresh-token — so admin sessions stay alive
 *   - / and /api/v1        — basic health pings
 */
export const checkMaintenance = (req, res, next) => {
    if (!maintenanceMode) return next();

    const path = req.path;

    if (
        path.startsWith("/api/v1/admin") ||
        path === "/api/v1/users/login" ||
        path === "/api/v1/users/refresh-token" ||
        path === "/" ||
        path === "/api/v1"
    ) {
        return next();
    }

    return res.status(503).json({
        success: false,
        message: "System maintenance in progress. Please try again shortly.",
        maintenanceMode: true,
    });
};
