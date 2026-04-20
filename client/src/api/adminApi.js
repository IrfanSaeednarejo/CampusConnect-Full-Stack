/**
 * adminApi.js
 *
 * All admin HTTP calls.
 */

import axiosInstance from "./axios";

// ── User Management ──────────────────────────────────────────────────────────
export const getAdminUsers = (params) => axiosInstance.get("/admin/users", { params });
export const getAdminUserDetail = (userId) => axiosInstance.get(`/admin/users/${userId}`);
export const getAdminUserActivity = (userId) => axiosInstance.get(`/admin/users/${userId}/activity`);
export const updateUserStatus = (userId, data) => axiosInstance.patch(`/admin/users/${userId}/status`, data);
export const updateUserRole = (userId, data) => axiosInstance.patch(`/admin/users/${userId}/role`, data);
export const forceLogoutUser = (userId) => axiosInstance.delete(`/admin/users/${userId}/sessions`);
export const bulkSuspendUsers = (data) => axiosInstance.post("/admin/users/bulk-suspend", data);

// ── Mentor Management ────────────────────────────────────────────────────────
export const getAdminMentors = (params) => axiosInstance.get("/admin/mentors", { params });
export const getPendingMentors = () => axiosInstance.get("/admin/mentors/pending");
export const getMentorSessions = (mentorId, p) => axiosInstance.get(`/admin/mentors/${mentorId}/sessions`, { params: p });
export const verifyMentor = (mentorId) => axiosInstance.patch(`/admin/mentors/${mentorId}/verify`);
export const rejectMentor = (mentorId, data) => axiosInstance.patch(`/admin/mentors/${mentorId}/reject`, data);
export const suspendMentor = (mentorId, data) => axiosInstance.patch(`/admin/mentors/${mentorId}/suspend`, data);
export const overrideMentorTier = (mentorId, data) => axiosInstance.patch(`/admin/mentors/${mentorId}/tier`, data);

// ── Society Management ───────────────────────────────────────────────────────
export const getAdminSocieties = (params) => axiosInstance.get("/admin/societies", { params });
export const getAdminSocietyDetail = (id) => axiosInstance.get(`/admin/societies/${id}`);
export const getPendingSocieties = () => axiosInstance.get("/admin/societies/pending");
export const adminCreateSociety = (data) => axiosInstance.post("/admin/societies", data);
export const updateSocietyStatus = (id, data) => axiosInstance.patch(`/admin/societies/${id}/status`, data);
export const reassignSocietyHead = (id, data) => axiosInstance.patch(`/admin/societies/${id}/head`, data);
export const adminDeleteSociety = (id) => axiosInstance.delete(`/admin/societies/${id}`);
export const adminAddSocietyMember = (id, data) => axiosInstance.post(`/admin/societies/${id}/members`, data);
export const adminUpdateSocietyMember = (id, userId, data) => axiosInstance.patch(`/admin/societies/${id}/members/${userId}`, data);
export const adminRemoveSocietyMember = (id, userId) => axiosInstance.delete(`/admin/societies/${id}/members/${userId}`);

// ── Event Management ─────────────────────────────────────────────────────────
export const getAdminEvents = (params) => axiosInstance.get("/admin/events", { params });
export const getEventRegistrations = (id, params) => axiosInstance.get(`/admin/events/${id}/registrations`, { params });
export const forceCancelEvent = (id, data) => axiosInstance.patch(`/admin/events/${id}/cancel`, data);
export const forceEventStatus = (id, data) => axiosInstance.patch(`/admin/events/${id}/status`, data);

// ── Study Group Management ───────────────────────────────────────────────────
export const getAdminStudyGroups = (params) => axiosInstance.get("/admin/study-groups", { params });
export const getAdminStudyGroupDetail = (id) => axiosInstance.get(`/admin/study-groups/${id}`);
export const adminCreateStudyGroup = (data) => axiosInstance.post("/admin/study-groups", data);
export const adminDeleteGroup = (id) => axiosInstance.delete(`/admin/study-groups/${id}`);
export const adminUpdateGroupStatus = (id, data) => axiosInstance.patch(`/admin/study-groups/${id}/status`, data);

// ── Notifications ────────────────────────────────────────────────────────────
export const broadcastNotification = (data) => axiosInstance.post("/admin/notifications/broadcast", data);
export const targetedNotification = (data) => axiosInstance.post("/admin/notifications/targeted", data);
export const getNotificationLogs = (params) => axiosInstance.get("/admin/notifications/logs", { params });

// ── Analytics ────────────────────────────────────────────────────────────────
export const getAnalyticsOverview = (params) => axiosInstance.get("/admin/analytics/overview", { params });
export const getUserGrowth = (params) => axiosInstance.get("/admin/analytics/users/growth", { params });
export const getMentorEngagement = (params) => axiosInstance.get("/admin/analytics/mentors/engagement", { params });
export const getEventParticipation = (params) => axiosInstance.get("/admin/analytics/events/participation", { params });
export const getSocietyActivity = (params) => axiosInstance.get("/admin/analytics/societies/activity", { params });
export const getSessionsAnalytics = (params) => axiosInstance.get("/admin/analytics/sessions", { params });
export const getDashboardStats = () => axiosInstance.get("/admin/dashboard/stats");

// ── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = (params) => axiosInstance.get("/admin/audit-logs", { params });
export const getAuditLogById = (logId) => axiosInstance.get(`/admin/audit-logs/${logId}`);

// ── System Management ────────────────────────────────────────────────────────
export const getSystemHealth = () => axiosInstance.get("/admin/system/health");
export const getFeatureFlags = () => axiosInstance.get("/admin/system/flags");
export const toggleFeatureFlag = (data) => axiosInstance.patch("/admin/system/flags", data);
export const toggleMaintenance = (data) => axiosInstance.patch("/admin/system/maintenance", data);

// Legacy/Compatibility export
export const adminApi = {
    getDashboardStats,
    getAdminUsers,
    updateUserRole,
    getPendingSocieties,
    updateSocietyStatus,
};
