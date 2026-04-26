import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { ApiError }     from "../utils/ApiError.js";
import {
    recordProfileView,
    getProfileVisitors,
    addExperience,      updateExperience,      deleteExperience,
    addProject,         updateProject,          deleteProject,
    addEventParticipation, updateEventParticipation, deleteEventParticipation,
} from "../services/profile.service.js";
import {
    generateBioSuggestion,
    improveExperienceDescription,
    generateHeadlineSuggestion,
} from "../services/profileAI.service.js";

// ─── Rate Limiter (shared pattern with ai.controller) ─────────────────────────
const AI_RATE_WINDOW_MS = 10 * 60 * 1000;
const AI_RATE_LIMIT     = 10;
const _rateMap          = new Map();

const checkRateLimit = (userId) => {
    const now   = Date.now();
    const calls = (_rateMap.get(userId) || []).filter((t) => now - t < AI_RATE_WINDOW_MS);
    if (calls.length >= AI_RATE_LIMIT) {
        throw new ApiError(429, "AI rate limit reached. Please wait a few minutes.");
    }
    calls.push(now);
    _rateMap.set(userId, calls);
};

// ─── Profile View ─────────────────────────────────────────────────────────────

/** POST /users/profile/:userId/view */
export const trackProfileView = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    await recordProfileView(userId, req.user._id);
    return res.status(200).json(new ApiResponse(200, null, "Profile view recorded"));
});

/** GET /users/profile/:userId/visitors  (owner only) */
export const getVisitors = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (userId !== req.user._id.toString()) {
        throw new ApiError(403, "You can only view your own visitors");
    }
    const result = await getProfileVisitors(userId, req.query);
    return res.status(200).json(new ApiResponse(200, result, "Visitors fetched"));
});

// ─── Experience ───────────────────────────────────────────────────────────────

/** POST /users/me/experience */
export const addExperienceHandler = asyncHandler(async (req, res) => {
    const entry = await addExperience(req.user._id, req.body);
    return res.status(201).json(new ApiResponse(201, entry, "Experience added"));
});

/** PATCH /users/me/experience/:entryId */
export const updateExperienceHandler = asyncHandler(async (req, res) => {
    const entry = await updateExperience(req.user._id, req.params.entryId, req.body);
    return res.status(200).json(new ApiResponse(200, entry, "Experience updated"));
});

/** DELETE /users/me/experience/:entryId */
export const deleteExperienceHandler = asyncHandler(async (req, res) => {
    await deleteExperience(req.user._id, req.params.entryId);
    return res.status(200).json(new ApiResponse(200, null, "Experience deleted"));
});

// ─── Projects ─────────────────────────────────────────────────────────────────

/** POST /users/me/projects */
export const addProjectHandler = asyncHandler(async (req, res) => {
    const files = req.files || [];
    const project = await addProject(req.user._id, req.body, files);
    return res.status(201).json(new ApiResponse(201, project, "Project added"));
});

/** PATCH /users/me/projects/:projectId */
export const updateProjectHandler = asyncHandler(async (req, res) => {
    const files = req.files || [];
    const project = await updateProject(req.user._id, req.params.projectId, req.body, files);
    return res.status(200).json(new ApiResponse(200, project, "Project updated"));
});

/** DELETE /users/me/projects/:projectId */
export const deleteProjectHandler = asyncHandler(async (req, res) => {
    await deleteProject(req.user._id, req.params.projectId);
    return res.status(200).json(new ApiResponse(200, null, "Project deleted"));
});

// ─── Event Participation ──────────────────────────────────────────────────────

/** POST /users/me/event-participation */
export const addEventParticipationHandler = asyncHandler(async (req, res) => {
    const entry = await addEventParticipation(req.user._id, req.body);
    return res.status(201).json(new ApiResponse(201, entry, "Event participation added"));
});

/** PATCH /users/me/event-participation/:entryId */
export const updateEventParticipationHandler = asyncHandler(async (req, res) => {
    const entry = await updateEventParticipation(req.user._id, req.params.entryId, req.body);
    return res.status(200).json(new ApiResponse(200, entry, "Event participation updated"));
});

/** DELETE /users/me/event-participation/:entryId */
export const deleteEventParticipationHandler = asyncHandler(async (req, res) => {
    await deleteEventParticipation(req.user._id, req.params.entryId);
    return res.status(200).json(new ApiResponse(200, null, "Event participation deleted"));
});

// ─── Profile AI ───────────────────────────────────────────────────────────────

/** POST /nexus/profile/bio */
export const aiProfileBioHandler = asyncHandler(async (req, res) => {
    checkRateLimit(req.user._id.toString());
    const { userContext } = req.body;
    if (!userContext) throw new ApiError(400, "userContext is required");
    const result = await generateBioSuggestion(userContext);
    return res.status(200).json(new ApiResponse(200, result, "Bio suggestion generated"));
});

/** POST /nexus/profile/improve-experience */
export const aiImproveExperienceHandler = asyncHandler(async (req, res) => {
    checkRateLimit(req.user._id.toString());
    const { description, title, organization } = req.body;
    if (!description?.trim()) throw new ApiError(400, "description is required");
    const result = await improveExperienceDescription(
        description.trim(),
        title  || "Professional Role",
        organization || "Organization"
    );
    return res.status(200).json(new ApiResponse(200, result, "Experience description improved"));
});

/** POST /nexus/profile/headline */
export const aiProfileHeadlineHandler = asyncHandler(async (req, res) => {
    checkRateLimit(req.user._id.toString());
    const { userContext } = req.body;
    if (!userContext) throw new ApiError(400, "userContext is required");
    const result = await generateHeadlineSuggestion(userContext);
    return res.status(200).json(new ApiResponse(200, result, "Headline suggestion generated"));
});
