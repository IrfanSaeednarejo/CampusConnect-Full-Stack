import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as gamificationApi from "../../api/gamificationApi";

const getMessage = (err) => err?.message || err?.data?.message || "Something went wrong";

export const fetchGamificationSummary = createAsyncThunk("gamification/fetchSummary", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getMyGamificationSummary();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationTransactions = createAsyncThunk("gamification/fetchTransactions", async (params, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getMyGamificationTransactions(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationBadges = createAsyncThunk("gamification/fetchBadges", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getMyGamificationBadges();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationStreaks = createAsyncThunk("gamification/fetchStreaks", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getMyGamificationStreaks();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationCertificates = createAsyncThunk("gamification/fetchCertificates", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getMyGamificationCertificates();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationProgress = createAsyncThunk("gamification/fetchProgress", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getMyGamificationProgress();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGlobalLeaderboard = createAsyncThunk("gamification/fetchGlobalLeaderboard", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getGlobalLeaderboard();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchCampusLeaderboard = createAsyncThunk("gamification/fetchCampusLeaderboard", async (campusId, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getCampusLeaderboard(campusId);
    return { campusId, rows: data.data };
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchModuleLeaderboard = createAsyncThunk("gamification/fetchModuleLeaderboard", async (module, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getModuleLeaderboard(module);
    return { module, rows: data.data };
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationRules = createAsyncThunk("gamification/fetchRules", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getGamificationRules();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const createGamificationRuleThunk = createAsyncThunk("gamification/createRule", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.createGamificationRule(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const updateGamificationRuleThunk = createAsyncThunk("gamification/updateRule", async ({ ruleId, payload }, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.updateGamificationRule(ruleId, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const adjustGamificationPointsThunk = createAsyncThunk("gamification/adjustPoints", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.adjustGamificationPoints(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const awardGamificationBadgeThunk = createAsyncThunk("gamification/awardBadge", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.awardGamificationBadge(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const issueGamificationCertificateThunk = createAsyncThunk("gamification/issueCertificate", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.issueGamificationCertificate(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const rebuildGamificationLeaderboardThunk = createAsyncThunk("gamification/rebuildLeaderboard", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.rebuildGamificationLeaderboard(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationAudit = createAsyncThunk("gamification/fetchAudit", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getGamificationAudit();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationAnalyticsOverview = createAsyncThunk("gamification/fetchAnalyticsOverview", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getGamificationAnalyticsOverview();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationAnalyticsLeaderboards = createAsyncThunk("gamification/fetchAnalyticsLeaderboards", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getGamificationAnalyticsLeaderboards();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationAnalyticsBadges = createAsyncThunk("gamification/fetchAnalyticsBadges", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getGamificationAnalyticsBadges();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationAnalyticsCertificates = createAsyncThunk("gamification/fetchAnalyticsCertificates", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getGamificationAnalyticsCertificates();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

export const fetchGamificationAnalyticsAnomalies = createAsyncThunk("gamification/fetchAnalyticsAnomalies", async (_, { rejectWithValue }) => {
  try {
    const { data } = await gamificationApi.getGamificationAnalyticsAnomalies();
    return data.data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

const initialState = {
  summary: null,
  progress: null,
  transactions: [],
  transactionsPagination: null,
  badges: [],
  streaks: [],
  certificates: [],
  leaderboards: {
    global: [],
    campus: {},
    module: {},
  },
  rules: [],
  audit: [],
  analytics: {
    overview: null,
    leaderboards: null,
    badges: [],
    certificates: [],
    anomalies: [],
  },
  latestRewardEvent: null,
  loading: false,
  adminLoading: false,
  error: null,
};

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    pointsEarned(state, action) {
      const event = action.payload;
      state.latestRewardEvent = { type: "points", ...event };
      if (state.summary) {
        state.summary.totalPoints = event.totalPoints;
        state.summary.level = event.level;
        state.summary.lastEarnedAt = event.createdAt;
      }
      state.transactions.unshift({
        _id: `socket-${event.createdAt}-${event.actionKey}`,
        actionKey: event.actionKey,
        points: event.points,
        reason: event.reason,
        createdAt: event.createdAt,
        direction: event.points < 0 ? "debit" : "credit",
      });
      if (state.transactions.length > 20) state.transactions.pop();
    },
    badgeUnlocked(state, action) {
      const event = action.payload;
      state.latestRewardEvent = { type: "badge", ...event };
      state.badges.unshift({
        awardedAt: event.awardedAt,
        badgeId: event.badge,
      });
      if (state.summary) {
        state.summary.badgesCount = (state.summary.badgesCount || 0) + 1;
      }
    },
    levelUp(state, action) {
      const event = action.payload;
      state.latestRewardEvent = { type: "level", ...event };
      if (state.summary) {
        state.summary.level = event.newLevel;
        state.summary.totalPoints = event.totalPoints;
      }
    },
    streakUpdated(state, action) {
      const event = action.payload;
      state.latestRewardEvent = { type: "streak", ...event };
      const index = state.streaks.findIndex((streak) => streak.streakType === event.streakType);
      if (index >= 0) {
        state.streaks[index] = { ...state.streaks[index], ...event };
      } else {
        state.streaks.unshift(event);
      }
      if (state.summary) {
        state.summary.currentStreak = event.currentCount;
        state.summary.longestStreak = Math.max(state.summary.longestStreak || 0, event.longestCount || 0);
      }
    },
    leaderboardUpdated(state, action) {
      const event = action.payload;
      state.latestRewardEvent = { type: "leaderboard", ...event };
    },
    certificateIssued(state, action) {
      const event = action.payload;
      state.latestRewardEvent = { type: "certificate", ...event };
      state.certificates.unshift({
        _id: event.certificateId,
        title: event.title,
        verificationCode: event.verificationCode,
        pdfUrl: event.pdfUrl,
        issuedAt: new Date().toISOString(),
      });
      if (state.summary) {
        state.summary.certificatesCount = (state.summary.certificatesCount || 0) + 1;
      }
    },
    clearLatestRewardEvent(state) {
      state.latestRewardEvent = null;
    },
    clearGamificationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGamificationSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGamificationSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.progress = { ...(state.progress || {}), levelMeta: action.payload.levelMeta };
      })
      .addCase(fetchGamificationSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchGamificationTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.docs || [];
        state.transactionsPagination = action.payload.pagination || null;
      })
      .addCase(fetchGamificationBadges.fulfilled, (state, action) => {
        state.badges = action.payload || [];
      })
      .addCase(fetchGamificationStreaks.fulfilled, (state, action) => {
        state.streaks = action.payload || [];
      })
      .addCase(fetchGamificationCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload || [];
      })
      .addCase(fetchGamificationProgress.fulfilled, (state, action) => {
        state.progress = action.payload;
        if (!state.summary && action.payload?.summary) state.summary = action.payload.summary;
      })
      .addCase(fetchGlobalLeaderboard.fulfilled, (state, action) => {
        state.leaderboards.global = action.payload || [];
      })
      .addCase(fetchCampusLeaderboard.fulfilled, (state, action) => {
        state.leaderboards.campus[action.payload.campusId] = action.payload.rows || [];
      })
      .addCase(fetchModuleLeaderboard.fulfilled, (state, action) => {
        state.leaderboards.module[action.payload.module] = action.payload.rows || [];
      })
      .addCase(fetchGamificationRules.pending, (state) => {
        state.adminLoading = true;
      })
      .addCase(fetchGamificationRules.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.rules = action.payload || [];
      })
      .addCase(fetchGamificationRules.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })
      .addCase(createGamificationRuleThunk.fulfilled, (state, action) => {
        state.rules.push(action.payload);
      })
      .addCase(updateGamificationRuleThunk.fulfilled, (state, action) => {
        const index = state.rules.findIndex((rule) => rule._id === action.payload._id);
        if (index >= 0) state.rules[index] = action.payload;
      })
      .addCase(fetchGamificationAudit.fulfilled, (state, action) => {
        state.audit = action.payload || [];
      })
      .addCase(fetchGamificationAnalyticsOverview.fulfilled, (state, action) => {
        state.analytics.overview = action.payload;
      })
      .addCase(fetchGamificationAnalyticsLeaderboards.fulfilled, (state, action) => {
        state.analytics.leaderboards = action.payload;
      })
      .addCase(fetchGamificationAnalyticsBadges.fulfilled, (state, action) => {
        state.analytics.badges = action.payload || [];
      })
      .addCase(fetchGamificationAnalyticsCertificates.fulfilled, (state, action) => {
        state.analytics.certificates = action.payload || [];
      })
      .addCase(fetchGamificationAnalyticsAnomalies.fulfilled, (state, action) => {
        state.analytics.anomalies = action.payload || [];
      });
  },
});

export const {
  pointsEarned,
  badgeUnlocked,
  levelUp,
  streakUpdated,
  leaderboardUpdated,
  certificateIssued,
  clearLatestRewardEvent,
  clearGamificationError,
} = gamificationSlice.actions;

export const selectGamificationSummary = (state) => state.gamification.summary;
export const selectGamificationProgress = (state) => state.gamification.progress;
export const selectGamificationTransactions = (state) => state.gamification.transactions;
export const selectGamificationBadges = (state) => state.gamification.badges;
export const selectGamificationStreaks = (state) => state.gamification.streaks;
export const selectGamificationCertificates = (state) => state.gamification.certificates;
export const selectGamificationLeaderboards = (state) => state.gamification.leaderboards;
export const selectGamificationRules = (state) => state.gamification.rules;
export const selectGamificationAnalytics = (state) => state.gamification.analytics;
export const selectLatestRewardEvent = (state) => state.gamification.latestRewardEvent;
export const selectGamificationLoading = (state) => state.gamification.loading;

export default gamificationSlice.reducer;
