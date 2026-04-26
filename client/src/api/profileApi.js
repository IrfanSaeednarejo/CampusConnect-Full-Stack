import api from "./axios";

const BASE = "/users";

// ── Profile Read ───────────────────────────────────────────────────────────────
export const getPublicProfile = (userId)     => api.get(`${BASE}/profile/${userId}`);
export const getMyProfile     = ()           => api.get(`${BASE}/current-user`);
export const recordProfileView= (userId)     => api.post(`${BASE}/profile/${userId}/view`);
export const getMyVisitors    = (userId, p)  => api.get(`${BASE}/profile/${userId}/visitors`, { params: p });

// ── Experience ─────────────────────────────────────────────────────────────────
export const addExperience    = (data)       => api.post(`${BASE}/me/experience`, data);
export const updateExperience = (id, data)   => api.patch(`${BASE}/me/experience/${id}`, data);
export const deleteExperience = (id)         => api.delete(`${BASE}/me/experience/${id}`);

// ── Projects ───────────────────────────────────────────────────────────────────
export const addProject       = (fd)         => api.post(`${BASE}/me/projects`, fd);
export const updateProject    = (id, fd)     => api.patch(`${BASE}/me/projects/${id}`, fd);
export const deleteProject    = (id)         => api.delete(`${BASE}/me/projects/${id}`);

// ── Event Participation ────────────────────────────────────────────────────────
export const addEventParticipation    = (d)  => api.post(`${BASE}/me/event-participation`, d);
export const updateEventParticipation = (id, d) => api.patch(`${BASE}/me/event-participation/${id}`, d);
export const deleteEventParticipation = (id) => api.delete(`${BASE}/me/event-participation/${id}`);

// ── Profile AI ─────────────────────────────────────────────────────────────────
export const aiGenerateBio      = (ctx)      => api.post("/nexus/profile/bio",                { userContext: ctx });
export const aiImprovExperience = (d, t, o)  => api.post("/nexus/profile/improve-experience", { description: d, title: t, organization: o });
export const aiGenerateHeadline = (ctx)      => api.post("/nexus/profile/headline",           { userContext: ctx });
