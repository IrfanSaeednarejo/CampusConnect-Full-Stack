import api from './axios';

const BASE = '/competitions';

export const getCompetitions = (params = {}) =>
  api.get(BASE, { params });

export const getCompetitionById = (eventId) =>
  api.get(`${BASE}/${eventId}`);

export const createCompetition = (formData) =>
  api.post(BASE, formData);

export const updateCompetition = (eventId, formData) =>
  api.patch(`${BASE}/${eventId}`, formData);

export const deleteCompetition = (eventId) =>
  api.delete(`${BASE}/${eventId}`);

export const transitionState = (eventId, data) =>
  api.patch(`${BASE}/${eventId}/transition`, data);

export const updateJudges = (eventId, data) =>
  api.patch(`${BASE}/${eventId}/judges`, data);

export const getAnnouncements = (eventId) =>
  api.get(`${BASE}/${eventId}/announcements`);

export const postAnnouncement = (eventId, data) =>
  api.post(`${BASE}/${eventId}/announcements`, data);

export const getLeaderboard = (eventId) =>
  api.get(`${BASE}/${eventId}/leaderboard`);

export const publishLeaderboard = (eventId) =>
  api.patch(`${BASE}/${eventId}/leaderboard/publish`);

export const getTeams = (eventId, params = {}) =>
  api.get(`${BASE}/${eventId}/teams`, { params });

export const getTeamById = (eventId, teamId) =>
  api.get(`${BASE}/${eventId}/teams/${teamId}`);

export const getMyTeam = (eventId) =>
  api.get(`${BASE}/${eventId}/teams/my`);

export const createTeam = (eventId, data) =>
  api.post(`${BASE}/${eventId}/teams`, data);

export const updateTeam = (eventId, teamId, data) =>
  api.patch(`${BASE}/${eventId}/teams/${teamId}`, data);

export const deleteTeam = (eventId, teamId) =>
  api.delete(`${BASE}/${eventId}/teams/${teamId}`);

export const joinTeam = (eventId, teamId, data = {}) =>
  api.post(`${BASE}/${eventId}/teams/${teamId}/join`, data);

export const leaveTeam = (eventId, teamId) =>
  api.post(`${BASE}/${eventId}/teams/${teamId}/leave`);

export const kickMember = (eventId, teamId, userId) =>
  api.delete(`${BASE}/${eventId}/teams/${teamId}/members/${userId}`);

export const transferLeadership = (eventId, teamId, data) =>
  api.patch(`${BASE}/${eventId}/teams/${teamId}/transfer`, data);

export const disqualifyTeam = (eventId, teamId, data) =>
  api.patch(`${BASE}/${eventId}/teams/${teamId}/disqualify`, data);

export const getSubmissions = (eventId, params = {}) =>
  api.get(`${BASE}/${eventId}/submissions`, { params });

export const getMySubmission = (eventId) =>
  api.get(`${BASE}/${eventId}/submissions/my`);

export const getSubmissionById = (eventId, subId) =>
  api.get(`${BASE}/${eventId}/submissions/${subId}`);

export const upsertSubmission = (eventId, data) =>
  api.post(`${BASE}/${eventId}/submissions`, data);

export const addFileToSubmission = (eventId, formData) =>
  api.post(`${BASE}/${eventId}/submissions/files`, formData);

export const removeFileFromSubmission = (eventId, fileId) =>
  api.delete(`${BASE}/${eventId}/submissions/files/${fileId}`);

export const scoreSubmission = (eventId, subId, data) =>
  api.post(`${BASE}/${eventId}/submissions/${subId}/score`, data);

export const getSubmissionScores = (eventId, subId) =>
  api.get(`${BASE}/${eventId}/submissions/${subId}/scores`);

export const retractScore = (eventId, subId) =>
  api.delete(`${BASE}/${eventId}/submissions/${subId}/scores/my`);

export const getJudgingProgress = (eventId) =>
  api.get(`${BASE}/${eventId}/judging/progress`);

export const getMyJudgingQueue = (eventId, params = {}) =>
  api.get(`${BASE}/${eventId}/judging/my-queue`, { params });

// Registration
export const registerForEvent = (eventId, formData) =>
  api.post(`${BASE}/${eventId}/register`, formData);

export const getEventRegistrations = (eventId, params = {}) =>
  api.get(`${BASE}/${eventId}/registrations`, { params });

export const approveRegistration = (eventId, userId) =>
  api.patch(`${BASE}/${eventId}/registrations/${userId}/approve`);

export const rejectRegistration = (eventId, userId, reason) =>
  api.patch(`${BASE}/${eventId}/registrations/${userId}/reject`, { reason });
