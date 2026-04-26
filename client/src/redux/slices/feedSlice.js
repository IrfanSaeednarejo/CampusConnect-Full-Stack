import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as postApi from "../../api/postApi";
import { aiDraftPost, aiImprovePost, aiSuggestHashtags, aiGeneratePoll, aiModeratePost } from "../../api/nexusApi";

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchFeed = createAsyncThunk("feed/fetchFeed", async ({ feedType = "campus", page = 1 }, { rejectWithValue }) => {
    try {
        const { data } = await postApi.getFeed(feedType, page);
        return { ...data.data, page, feedType };
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const createPost = createAsyncThunk("feed/createPost", async (formData, { rejectWithValue }) => {
    try {
        const { data } = await postApi.createPost(formData);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const deletePost = createAsyncThunk("feed/deletePost", async (postId, { rejectWithValue }) => {
    try {
        await postApi.deletePost(postId);
        return postId;
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const reactToPost = createAsyncThunk("feed/reactToPost", async ({ postId, reactionType }, { rejectWithValue }) => {
    try {
        const { data } = await postApi.reactToPost(postId, reactionType);
        return { postId, ...data.data };
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const repostPost = createAsyncThunk("feed/repostPost", async ({ postId, comment }, { rejectWithValue }) => {
    try {
        const { data } = await postApi.repostPost(postId, comment);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const voteOnPoll = createAsyncThunk("feed/voteOnPoll", async ({ postId, optionIndexes }, { rejectWithValue }) => {
    try {
        const { data } = await postApi.voteOnPoll(postId, optionIndexes);
        return { postId, poll: data.data };
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const fetchComments = createAsyncThunk("feed/fetchComments", async ({ postId, page = 1 }, { rejectWithValue }) => {
    try {
        const { data } = await postApi.getComments(postId, page);
        return { postId, ...data.data, page };
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const addComment = createAsyncThunk("feed/addComment", async ({ postId, body, parentId, mentions }, { rejectWithValue }) => {
    try {
        const { data } = await postApi.addComment(postId, body, parentId, mentions);
        return { postId, comment: data.data };
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const deleteComment = createAsyncThunk("feed/deleteComment", async ({ postId, commentId }, { rejectWithValue }) => {
    try {
        await postApi.deleteComment(postId, commentId);
        return { postId, commentId };
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

export const fetchTrendingHashtags = createAsyncThunk("feed/fetchTrendingHashtags", async (_, { rejectWithValue }) => {
    try {
        const { data } = await postApi.getTrendingHashtags();
        return data.data;
    } catch (err) {
        return rejectWithValue(err.message);
    }
});

// ── Post AI Thunks ─────────────────────────────────────────────────────────────

export const draftPostThunk = createAsyncThunk("feed/ai/draft", async ({ topic, tone }, { rejectWithValue }) => {
    try {
        const { data } = await aiDraftPost(topic, tone);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const improvePostThunk = createAsyncThunk("feed/ai/improve", async ({ body, tone }, { rejectWithValue }) => {
    try {
        const { data } = await aiImprovePost(body, tone);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const suggestHashtagsThunk = createAsyncThunk("feed/ai/hashtags", async (body, { rejectWithValue }) => {
    try {
        const { data } = await aiSuggestHashtags(body);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const generatePollThunk = createAsyncThunk("feed/ai/poll", async (question, { rejectWithValue }) => {
    try {
        const { data } = await aiGeneratePoll(question);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const moderatePostThunk = createAsyncThunk("feed/ai/moderate", async (body, { rejectWithValue }) => {
    try {
        const { data } = await aiModeratePost(body);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
    // Feed
    docs:         [],
    pagination:   { total: 0, page: 1, pages: 1, limit: 15 },
    feedType:     "campus",
    feedLoading:  false,
    feedError:    null,
    hasMore:      true,

    // Active post (for comment drawer)
    activePostId:    null,

    // Comments map: { [postId]: { docs[], pagination, loading } }
    comments:        {},

    // Composer
    composerOpen:    false,
    composerLoading: false,

    // Repost Composer
    repostComposerOpen: false,
    repostOriginalPost: null,

    // Trending
    trendingHashtags: [],

    // Post AI Assistant
    ai: {
        drafting:          false,
        improving:         false,
        tagging:           false,
        pollingGen:        false,
        moderating:        false,
        suggestions: {
            hashtags:    [],
            pollOptions: [],
        },
        suggestion:        null,   // { body: string } — pending draft/improve result
        moderationResult:  null,   // { safe, score, reason }
        error:             null,
    },
};

const feedSlice = createSlice({
    name: "feed",
    initialState,
    reducers: {
        setFeedType(state, action) {
            state.feedType  = action.payload;
            state.docs      = [];
            state.pagination = { total: 0, page: 1, pages: 1, limit: 15 };
            state.hasMore   = true;
        },
        openComposer(state) { state.composerOpen = true; },
        closeComposer(state) { state.composerOpen = false; },
        openRepostComposer(state, action) {
            state.repostOriginalPost = action.payload;
            state.repostComposerOpen = true;
        },
        closeRepostComposer(state) {
            state.repostOriginalPost = null;
            state.repostComposerOpen = false;
        },
        setActivePost(state, action) { state.activePostId = action.payload; },
        clearActivePost(state) { state.activePostId = null; },
        clearAiSuggestion(state) {
            state.ai.suggestion       = null;
            state.ai.error            = null;
        },
        clearAiHashtags(state) {
            state.ai.suggestions.hashtags = [];
        },
        clearAiPollOptions(state) {
            state.ai.suggestions.pollOptions = [];
        },
        clearModerationResult(state) {
            state.ai.moderationResult = null;
        },
        // Optimistic reaction update for snappy UX
        optimisticReact(state, { payload: { postId, reactionType, userId } }) {
            const post = state.docs.find((p) => p._id === postId);
            if (!post) return;
            const idx = post.reactions.findIndex((r) => r.userId === userId);
            if (idx >= 0) {
                if (post.reactions[idx].type === reactionType) {
                    post.reactions.splice(idx, 1);
                } else {
                    post.reactions[idx].type = reactionType;
                }
            } else {
                post.reactions.push({ userId, type: reactionType });
            }
        },
    },
    extraReducers: (builder) => {
        // ── fetchFeed ──
        builder
            .addCase(fetchFeed.pending, (state) => { state.feedLoading = true; state.feedError = null; })
            .addCase(fetchFeed.fulfilled, (state, { payload }) => {
                state.feedLoading = false;
                if (payload.page === 1) {
                    state.docs = payload.docs;
                } else {
                    // Deduplicate on infinite scroll
                    const existingIds = new Set(state.docs.map((p) => p._id));
                    state.docs.push(...payload.docs.filter((p) => !existingIds.has(p._id)));
                }
                state.pagination = payload.pagination;
                state.hasMore    = payload.pagination.page < payload.pagination.pages;
                state.feedType   = payload.feedType;
            })
            .addCase(fetchFeed.rejected, (state, { payload }) => {
                state.feedLoading = false;
                state.feedError   = payload;
            });

        // ── createPost ──
        builder
            .addCase(createPost.pending, (state)  => { state.composerLoading = true; })
            .addCase(createPost.fulfilled, (state, { payload }) => {
                state.composerLoading = false;
                state.composerOpen    = false;
                state.docs.unshift(payload); // prepend to feed
            })
            .addCase(createPost.rejected, (state) => { state.composerLoading = false; });

        // ── deletePost ──
        builder.addCase(deletePost.fulfilled, (state, { payload: postId }) => {
            state.docs = state.docs.filter((p) => p._id !== postId);
        });

        // ── repostPost ──
        builder
            .addCase(repostPost.pending, (state) => { state.composerLoading = true; })
            .addCase(repostPost.fulfilled, (state, { payload }) => {
                state.composerLoading = false;
                state.repostComposerOpen = false;
                state.repostOriginalPost = null;
                state.docs.unshift(payload);
                const original = state.docs.find((p) => p._id === payload.repostOf);
                if (original) original.repostCount = (original.repostCount || 0) + 1;
            })
            .addCase(repostPost.rejected, (state) => { state.composerLoading = false; });

        // ── voteOnPoll ──
        builder.addCase(voteOnPoll.fulfilled, (state, { payload: { postId, poll } }) => {
            const post = state.docs.find((p) => p._id === postId);
            if (post) post.poll = poll;
        });

        // ── fetchComments ──
        builder
            .addCase(fetchComments.pending, (state, { meta }) => {
                const pid = meta.arg.postId;
                if (!state.comments[pid]) state.comments[pid] = { docs: [], pagination: {}, loading: true };
                state.comments[pid].loading = true;
            })
            .addCase(fetchComments.fulfilled, (state, { payload }) => {
                const { postId, docs, pagination, page } = payload;
                if (!state.comments[postId]) state.comments[postId] = { docs: [], pagination: {}, loading: false };
                if (page === 1) {
                    state.comments[postId].docs = docs;
                } else {
                    state.comments[postId].docs.push(...docs);
                }
                state.comments[postId].pagination = pagination;
                state.comments[postId].loading    = false;
            });

        // ── addComment ──
        builder.addCase(addComment.fulfilled, (state, { payload: { postId, comment } }) => {
            if (comment.parentId === null || comment.parentId === undefined) {
                // Top-level — prepend to comments
                if (!state.comments[postId]) state.comments[postId] = { docs: [], pagination: {}, loading: false };
                state.comments[postId].docs.unshift(comment);
            }
            // Increment count on post card
            const post = state.docs.find((p) => p._id === postId);
            if (post) post.commentCount = (post.commentCount || 0) + 1;
        });

        // ── deleteComment ──
        builder.addCase(deleteComment.fulfilled, (state, { payload: { postId, commentId } }) => {
            if (state.comments[postId]) {
                state.comments[postId].docs = state.comments[postId].docs.filter((c) => c._id !== commentId);
            }
            const post = state.docs.find((p) => p._id === postId);
            if (post && post.commentCount > 0) post.commentCount -= 1;
        });

        // ── trending ──
        builder.addCase(fetchTrendingHashtags.fulfilled, (state, { payload }) => {
            state.trendingHashtags = payload;
        });

        // ── Post AI ──
        // draft
        builder
            .addCase(draftPostThunk.pending,   (state) => { state.ai.drafting = true;  state.ai.error = null; state.ai.suggestion = null; })
            .addCase(draftPostThunk.fulfilled, (state, { payload }) => { state.ai.drafting = false; state.ai.suggestion = payload; })
            .addCase(draftPostThunk.rejected,  (state, { payload }) => { state.ai.drafting = false; state.ai.error = payload; });

        // improve
        builder
            .addCase(improvePostThunk.pending,   (state) => { state.ai.improving = true;  state.ai.error = null; state.ai.suggestion = null; })
            .addCase(improvePostThunk.fulfilled, (state, { payload }) => { state.ai.improving = false; state.ai.suggestion = payload; })
            .addCase(improvePostThunk.rejected,  (state, { payload }) => { state.ai.improving = false; state.ai.error = payload; });

        // hashtags
        builder
            .addCase(suggestHashtagsThunk.pending,   (state) => { state.ai.tagging = true;  state.ai.error = null; })
            .addCase(suggestHashtagsThunk.fulfilled, (state, { payload }) => { state.ai.tagging = false; state.ai.suggestions.hashtags = payload?.hashtags || []; })
            .addCase(suggestHashtagsThunk.rejected,  (state, { payload }) => { state.ai.tagging = false; state.ai.error = payload; });

        // poll generation
        builder
            .addCase(generatePollThunk.pending,   (state) => { state.ai.pollingGen = true;  state.ai.error = null; })
            .addCase(generatePollThunk.fulfilled, (state, { payload }) => { state.ai.pollingGen = false; state.ai.suggestions.pollOptions = payload?.options || []; })
            .addCase(generatePollThunk.rejected,  (state, { payload }) => { state.ai.pollingGen = false; state.ai.error = payload; });

        // moderation
        builder
            .addCase(moderatePostThunk.pending,   (state) => { state.ai.moderating = true;  state.ai.moderationResult = null; })
            .addCase(moderatePostThunk.fulfilled, (state, { payload }) => { state.ai.moderating = false; state.ai.moderationResult = payload; })
            .addCase(moderatePostThunk.rejected,  (state) => { state.ai.moderating = false; state.ai.moderationResult = { safe: true, score: 0, reason: null }; });
    },
});

export const {
    setFeedType, openComposer, closeComposer,
    openRepostComposer, closeRepostComposer,
    setActivePost, clearActivePost, optimisticReact,
    clearAiSuggestion, clearAiHashtags, clearAiPollOptions, clearModerationResult,
} = feedSlice.actions;

export default feedSlice.reducer;
