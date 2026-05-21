import axiosInstance from "./axios";

export const getMyGamificationSummary = () => axiosInstance.get("/gamification/me/summary");
export const getMyGamificationTransactions = (params) => axiosInstance.get("/gamification/me/transactions", { params });
export const getMyGamificationBadges = () => axiosInstance.get("/gamification/me/badges");
export const getMyGamificationStreaks = () => axiosInstance.get("/gamification/me/streaks");
export const getMyGamificationCertificates = () => axiosInstance.get("/gamification/me/certificates");
export const getMyGamificationProgress = () => axiosInstance.get("/gamification/me/progress");

export const getGlobalLeaderboard = () => axiosInstance.get("/gamification/leaderboards/global");
export const getCampusLeaderboard = (campusId) => axiosInstance.get(`/gamification/leaderboards/campus/${campusId}`);
export const getModuleLeaderboard = (module) => axiosInstance.get(`/gamification/leaderboards/module/${module}`);

export const getBadgeCatalog = () => axiosInstance.get("/gamification/badges");
export const getBadgeById = (badgeId) => axiosInstance.get(`/gamification/badges/${badgeId}`);
export const getUserBadges = (userId) => axiosInstance.get(`/gamification/users/${userId}/badges`);
export const getCertificateById = (certificateId) => axiosInstance.get(`/gamification/certificates/${certificateId}`);
export const verifyCertificate = (code) => axiosInstance.get(`/gamification/certificates/verify/${code}`);

export const getGamificationRules = () => axiosInstance.get("/admin/gamification/rules");
export const createGamificationRule = (data) => axiosInstance.post("/admin/gamification/rules", data);
export const updateGamificationRule = (ruleId, data) => axiosInstance.patch(`/admin/gamification/rules/${ruleId}`, data);
export const adjustGamificationPoints = (data) => axiosInstance.post("/admin/gamification/points/adjust", data);
export const awardGamificationBadge = (data) => axiosInstance.post("/admin/gamification/badges/award", data);
export const issueGamificationCertificate = (data) => axiosInstance.post("/admin/gamification/certificates/issue", data);
export const rebuildGamificationLeaderboard = (data) => axiosInstance.post("/admin/gamification/leaderboards/rebuild", data);
export const getGamificationAudit = () => axiosInstance.get("/admin/gamification/audit");

export const getGamificationAnalyticsOverview = () => axiosInstance.get("/admin/gamification/analytics/overview");
export const getGamificationAnalyticsLeaderboards = () => axiosInstance.get("/admin/gamification/analytics/leaderboards");
export const getGamificationAnalyticsBadges = () => axiosInstance.get("/admin/gamification/analytics/badges");
export const getGamificationAnalyticsCertificates = () => axiosInstance.get("/admin/gamification/analytics/certificates");
export const getGamificationAnalyticsAnomalies = () => axiosInstance.get("/admin/gamification/analytics/anomalies");
