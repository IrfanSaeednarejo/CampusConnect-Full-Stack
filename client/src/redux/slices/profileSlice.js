import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as profileApi from "../../api/profileApi";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchPublicProfile = createAsyncThunk(
    "profile/fetchPublic",
    async (userId, { rejectWithValue }) => {
        try {
            const { data } = await profileApi.getPublicProfile(userId);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchMyProfile = createAsyncThunk(
    "profile/fetchMine",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await profileApi.getMyProfile();
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchMyVisitors = createAsyncThunk(
    "profile/fetchVisitors",
    async ({ userId, page = 1 }, { rejectWithValue }) => {
        try {
            const { data } = await profileApi.getMyVisitors(userId, { page });
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ── Experience ────────────────────────────────────────────────────────────────
export const addExperienceThunk = createAsyncThunk(
    "profile/addExperience",
    async (data, { rejectWithValue }) => {
        try { const { data: r } = await profileApi.addExperience(data); return r.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);
export const updateExperienceThunk = createAsyncThunk(
    "profile/updateExperience",
    async ({ id, data }, { rejectWithValue }) => {
        try { const { data: r } = await profileApi.updateExperience(id, data); return { id, entry: r.data }; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);
export const deleteExperienceThunk = createAsyncThunk(
    "profile/deleteExperience",
    async (id, { rejectWithValue }) => {
        try { await profileApi.deleteExperience(id); return id; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);

// ── Projects ──────────────────────────────────────────────────────────────────
export const addProjectThunk = createAsyncThunk(
    "profile/addProject",
    async (formData, { rejectWithValue }) => {
        try { const { data } = await profileApi.addProject(formData); return data.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);
export const updateProjectThunk = createAsyncThunk(
    "profile/updateProject",
    async ({ id, formData }, { rejectWithValue }) => {
        try { const { data } = await profileApi.updateProject(id, formData); return { id, project: data.data }; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);
export const deleteProjectThunk = createAsyncThunk(
    "profile/deleteProject",
    async (id, { rejectWithValue }) => {
        try { await profileApi.deleteProject(id); return id; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);

// ── Event Participation ────────────────────────────────────────────────────────
export const addEventParticipationThunk = createAsyncThunk(
    "profile/addEventParticipation",
    async (data, { rejectWithValue }) => {
        try { const { data: r } = await profileApi.addEventParticipation(data); return r.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);
export const updateEventParticipationThunk = createAsyncThunk(
    "profile/updateEventParticipation",
    async ({ id, data }, { rejectWithValue }) => {
        try { const { data: r } = await profileApi.updateEventParticipation(id, data); return { id, entry: r.data }; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);
export const deleteEventParticipationThunk = createAsyncThunk(
    "profile/deleteEventParticipation",
    async (id, { rejectWithValue }) => {
        try { await profileApi.deleteEventParticipation(id); return id; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);

// ── Profile AI ─────────────────────────────────────────────────────────────────
export const generateBioThunk = createAsyncThunk(
    "profile/ai/bio",
    async (userContext, { rejectWithValue }) => {
        try { const { data } = await profileApi.aiGenerateBio(userContext); return data.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);
export const improveExperienceThunk = createAsyncThunk(
    "profile/ai/experience",
    async ({ description, title, organization }, { rejectWithValue }) => {
        try { const { data } = await profileApi.aiImprovExperience(description, title, organization); return data.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);
export const generateHeadlineThunk = createAsyncThunk(
    "profile/ai/headline",
    async (userContext, { rejectWithValue }) => {
        try { const { data } = await profileApi.aiGenerateHeadline(userContext); return data.data; }
        catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
    }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
    // Public / viewed profile
    viewedProfile:  null,
    viewLoading:    false,
    viewError:      null,

    // Own full profile
    myProfile:      null,
    myLoading:      false,

    // Who viewed my profile
    visitors:       [],
    visitorsTotal:  0,
    visitorsPage:   1,

    // Per-section loading (for inline spinners)
    sectionLoading: {
        experience: false,
        projects:   false,
        events:     false,
    },
    sectionError: null,

    // Active tab
    activeTab: "about",

    // AI
    ai: {
        generating:  false,
        suggestion:  null,   // { bio?, headline?, description? }
        error:       null,
    },
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setActiveTab(state, { payload }) { state.activeTab = payload; },
        clearViewedProfile(state)  { state.viewedProfile = null; state.viewError = null; },
        clearAiSuggestion(state)   { state.ai.suggestion = null; state.ai.error = null; },
    },
    extraReducers: (builder) => {
        // fetchPublicProfile
        builder
            .addCase(fetchPublicProfile.pending,   (s) => { s.viewLoading = true; s.viewError = null; })
            .addCase(fetchPublicProfile.fulfilled, (s, { payload }) => { s.viewLoading = false; s.viewedProfile = payload; })
            .addCase(fetchPublicProfile.rejected,  (s, { payload }) => { s.viewLoading = false; s.viewError = payload; });

        // fetchMyProfile
        builder
            .addCase(fetchMyProfile.pending,   (s) => { s.myLoading = true; })
            .addCase(fetchMyProfile.fulfilled, (s, { payload }) => { s.myLoading = false; s.myProfile = payload; })
            .addCase(fetchMyProfile.rejected,  (s) => { s.myLoading = false; });

        // visitors
        builder.addCase(fetchMyVisitors.fulfilled, (s, { payload }) => {
            s.visitors      = payload.docs;
            s.visitorsTotal = payload.total;
            s.visitorsPage  = payload.page;
        });

        // ── Experience ──
        builder
            .addCase(addExperienceThunk.pending,   (s) => { s.sectionLoading.experience = true; })
            .addCase(addExperienceThunk.fulfilled, (s, { payload }) => {
                s.sectionLoading.experience = false;
                if (s.myProfile) s.myProfile.experience.unshift(payload);
            })
            .addCase(addExperienceThunk.rejected,  (s, { payload }) => { s.sectionLoading.experience = false; s.sectionError = payload; });

        builder.addCase(updateExperienceThunk.fulfilled, (s, { payload: { id, entry } }) => {
            if (s.myProfile) {
                const idx = s.myProfile.experience.findIndex((e) => e._id === id);
                if (idx >= 0) s.myProfile.experience[idx] = entry;
            }
        });

        builder.addCase(deleteExperienceThunk.fulfilled, (s, { payload: id }) => {
            if (s.myProfile) s.myProfile.experience = s.myProfile.experience.filter((e) => e._id !== id);
        });

        // ── Projects ──
        builder
            .addCase(addProjectThunk.pending,   (s) => { s.sectionLoading.projects = true; })
            .addCase(addProjectThunk.fulfilled, (s, { payload }) => {
                s.sectionLoading.projects = false;
                if (s.myProfile) s.myProfile.projects.unshift(payload);
            })
            .addCase(addProjectThunk.rejected,  (s, { payload }) => { s.sectionLoading.projects = false; s.sectionError = payload; });

        builder.addCase(updateProjectThunk.fulfilled, (s, { payload: { id, project } }) => {
            if (s.myProfile) {
                const idx = s.myProfile.projects.findIndex((p) => p._id === id);
                if (idx >= 0) s.myProfile.projects[idx] = project;
            }
        });

        builder.addCase(deleteProjectThunk.fulfilled, (s, { payload: id }) => {
            if (s.myProfile) s.myProfile.projects = s.myProfile.projects.filter((p) => p._id !== id);
        });

        // ── Event Participation ──
        builder
            .addCase(addEventParticipationThunk.pending,   (s) => { s.sectionLoading.events = true; })
            .addCase(addEventParticipationThunk.fulfilled, (s, { payload }) => {
                s.sectionLoading.events = false;
                if (s.myProfile) s.myProfile.eventParticipation.unshift(payload);
            })
            .addCase(addEventParticipationThunk.rejected,  (s, { payload }) => { s.sectionLoading.events = false; s.sectionError = payload; });

        builder.addCase(updateEventParticipationThunk.fulfilled, (s, { payload: { id, entry } }) => {
            if (s.myProfile) {
                const idx = s.myProfile.eventParticipation.findIndex((e) => e._id === id);
                if (idx >= 0) s.myProfile.eventParticipation[idx] = entry;
            }
        });

        builder.addCase(deleteEventParticipationThunk.fulfilled, (s, { payload: id }) => {
            if (s.myProfile) s.myProfile.eventParticipation = s.myProfile.eventParticipation.filter((e) => e._id !== id);
        });

        // ── Profile AI ──
        builder
            .addCase(generateBioThunk.pending,       (s) => { s.ai.generating = true; s.ai.error = null; s.ai.suggestion = null; })
            .addCase(generateBioThunk.fulfilled,     (s, { payload }) => { s.ai.generating = false; s.ai.suggestion = payload; })
            .addCase(generateBioThunk.rejected,      (s, { payload }) => { s.ai.generating = false; s.ai.error = payload; });

        builder
            .addCase(improveExperienceThunk.pending,   (s) => { s.ai.generating = true; s.ai.error = null; s.ai.suggestion = null; })
            .addCase(improveExperienceThunk.fulfilled, (s, { payload }) => { s.ai.generating = false; s.ai.suggestion = payload; })
            .addCase(improveExperienceThunk.rejected,  (s, { payload }) => { s.ai.generating = false; s.ai.error = payload; });

        builder
            .addCase(generateHeadlineThunk.pending,   (s) => { s.ai.generating = true; s.ai.error = null; s.ai.suggestion = null; })
            .addCase(generateHeadlineThunk.fulfilled, (s, { payload }) => { s.ai.generating = false; s.ai.suggestion = payload; })
            .addCase(generateHeadlineThunk.rejected,  (s, { payload }) => { s.ai.generating = false; s.ai.error = payload; });
    },
});

export const { setActiveTab, clearViewedProfile, clearAiSuggestion } = profileSlice.actions;
export default profileSlice.reducer;
