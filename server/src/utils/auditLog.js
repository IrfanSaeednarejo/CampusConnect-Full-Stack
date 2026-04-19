import { AdminAuditLog } from "../models/adminAuditLog.model.js";

/**
 * Write an admin action to the audit log.
 *
 * Non-blocking by design: a failed write must never fail the admin action.
 * Call this after the primary operation succeeds.
 *
 * @param {Object} options
 * @param {import("express").Request} options.req        - Express request (pulls adminId, ip, userAgent)
 * @param {string}  options.action                       - from ADMIN_ACTIONS
 * @param {string}  [options.targetModel]                - "User" | "Society" | etc.
 * @param {string|import("mongoose").Types.ObjectId} [options.targetId]
 * @param {Object}  [options.payload]                    - before/after snapshots, reason, etc.
 */
export const writeAuditLog = async ({
    req,
    action,
    targetModel,
    targetId,
    payload = {},
}) => {
    try {
        if (!req?.user) return;

        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket?.remoteAddress ||
            "unknown";

        const userAgent = req.headers["user-agent"] || "unknown";

        // Determine the admin's effective role (highest-privilege role wins)
        const roles = req.user.roles || [];
        let adminRole = "admin";
        if (roles.includes("super_admin")) adminRole = "super_admin";
        else if (roles.includes("campus_admin")) adminRole = "campus_admin";
        else if (roles.includes("read_only_admin")) adminRole = "read_only_admin";

        await AdminAuditLog.create({
            adminId: req.user._id,
            adminRole,
            action,
            targetModel: targetModel || undefined,
            targetId: targetId || undefined,
            payload,
            ipAddress: ip,
            userAgent,
            campusId: req.user.campusId || undefined,
        });
    } catch (err) {
        // Intentionally silent — audit failure must not break admin actions
        console.error("[AuditLog] Write failed:", err.message);
    }
};
