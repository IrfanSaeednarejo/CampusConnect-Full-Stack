/**
 * admin.routes.js
 *
 * Mount in app.js:
 *   import adminRouter from "./src/routes/admin.routes.js";
 *   app.use("/api/v1/admin", adminRouter);
 *
 * Every route here is behind verifyJWT + requireAnyAdmin minimum.
 * Individual endpoints apply stricter guards (requireSuperAdmin, requireCampusAdmin)
 * inline where the plan specifies.
 */

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    requireAnyAdmin,
    requireSuperAdmin,
    requireCampusAdmin,
    requireWriteAdmin,
} from "../middlewares/adminAuth.middleware.js";

// ── User admin ────────────────────────────────────────────────────────────────
import {
    listUsers,
    getUserDetail,
    getUserActivity,
    updateUserStatus,
    updateUserRole,
    forceLogout,
    bulkSuspend,
} from "../controllers/user.admin.controller.js";

// ── Mentor admin ──────────────────────────────────────────────────────────────
import {
    listMentors,
    listPendingMentors,
    verifyMentor,
    rejectMentor,
    suspendMentor as suspendMentorAdmin,
    overrideMentorTier,
    getMentorSessions,
} from "../controllers/mentor.admin.controller.js";

// ── Society admin ─────────────────────────────────────────────────────────────
import {
    listSocieties,
    listPendingSocieties,
    updateSocietyStatus,
    deleteSociety,
    reassignSocietyHead,
} from "../controllers/society.admin.controller.js";

// ── Event admin ───────────────────────────────────────────────────────────────
import {
    listEvents,
    forceCancelEvent,
    forceEventStatus,
    getEventRegistrations,
} from "../controllers/event.admin.controller.js";

// ── StudyGroup + Notification + AuditLog (combined file) ─────────────────────
import {
    listStudyGroups,
    adminDeleteStudyGroup,
    adminUpdateStudyGroupStatus,
    broadcastNotification,
    targetedNotification,
    getNotificationLogs,
    listAuditLogs,
    getAuditLogById,
} from "../controllers/combined.admin.controller.js";

// ── Analytics ─────────────────────────────────────────────────────────────────
import {
    getOverview,
    getUserGrowth,
    getMentorEngagement,
    getEventParticipation,
    getSocietyActivity,
    getSessionsAnalytics,
    getDashboardStats,
} from "../controllers/analytics.admin.controller.js";

// ── System ────────────────────────────────────────────────────────────────────
import {
    getSystemHealth,
    getFeatureFlags,
    toggleFeatureFlag,
    toggleMaintenance,
} from "../controllers/system.admin.controller.js";

const router = Router();

// All routes: JWT + minimum any-admin role
router.use(verifyJWT, requireAnyAdmin);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard/stats", getDashboardStats);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get("/users", listUsers);
router.post("/users/bulk-suspend", requireSuperAdmin, bulkSuspend);
router.get("/users/:userId", getUserDetail);
router.get("/users/:userId/activity", getUserActivity);
router.patch("/users/:userId/status", requireWriteAdmin, requireCampusAdmin(), updateUserStatus);
router.patch("/users/:userId/role", requireSuperAdmin, updateUserRole);
router.delete("/users/:userId/sessions", requireWriteAdmin, requireCampusAdmin(), forceLogout);

// ─── Mentors ──────────────────────────────────────────────────────────────────
router.get("/mentors", listMentors);
router.get("/mentors/pending", listPendingMentors);
router.get("/mentors/:mentorId/sessions", getMentorSessions);
router.patch("/mentors/:mentorId/verify", requireWriteAdmin, requireCampusAdmin("mentorId"), verifyMentor);
router.patch("/mentors/:mentorId/reject", requireWriteAdmin, requireCampusAdmin("mentorId"), rejectMentor);
router.patch("/mentors/:mentorId/suspend", requireWriteAdmin, requireCampusAdmin("mentorId"), suspendMentorAdmin);
router.patch("/mentors/:mentorId/tier", requireSuperAdmin, overrideMentorTier);

// ─── Societies ────────────────────────────────────────────────────────────────
router.get("/societies", listSocieties);
router.get("/societies/pending", listPendingSocieties);
router.patch("/societies/:id/status", requireWriteAdmin, requireCampusAdmin(), updateSocietyStatus);
router.patch("/societies/:id/head", requireWriteAdmin, requireCampusAdmin(), reassignSocietyHead);
router.delete("/societies/:id", requireSuperAdmin, deleteSociety);

// ─── Events ───────────────────────────────────────────────────────────────────
router.get("/events", listEvents);
router.get("/events/:eventId/registrations", getEventRegistrations);
router.patch("/events/:eventId/cancel", requireWriteAdmin, requireCampusAdmin(), forceCancelEvent);
router.patch("/events/:eventId/status", requireSuperAdmin, forceEventStatus);

// ─── Study Groups ─────────────────────────────────────────────────────────────
router.get("/study-groups", listStudyGroups);
router.patch("/study-groups/:id/status", requireWriteAdmin, requireCampusAdmin(), adminUpdateStudyGroupStatus);
router.delete("/study-groups/:id", requireWriteAdmin, requireCampusAdmin(), adminDeleteStudyGroup);

// ─── Notifications ────────────────────────────────────────────────────────────
router.post("/notifications/broadcast", requireSuperAdmin, broadcastNotification);
router.post("/notifications/targeted", requireWriteAdmin, requireCampusAdmin(), targetedNotification);
router.get("/notifications/logs", getNotificationLogs);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get("/analytics/overview", getOverview);
router.get("/analytics/users/growth", getUserGrowth);
router.get("/analytics/mentors/engagement", getMentorEngagement);
router.get("/analytics/events/participation", getEventParticipation);
router.get("/analytics/societies/activity", getSocietyActivity);
router.get("/analytics/sessions", getSessionsAnalytics);

// ─── Audit Logs ───────────────────────────────────────────────────────────────
router.get("/audit-logs", listAuditLogs);
router.get("/audit-logs/:logId", getAuditLogById);

// ─── System (super_admin only) ────────────────────────────────────────────────
router.get("/system/health", requireSuperAdmin, getSystemHealth);
router.get("/system/flags", requireSuperAdmin, getFeatureFlags);
router.patch("/system/flags", requireSuperAdmin, toggleFeatureFlag);
router.patch("/system/maintenance", requireSuperAdmin, toggleMaintenance);

export default router;
