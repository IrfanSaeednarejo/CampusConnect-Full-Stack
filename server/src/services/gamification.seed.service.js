import { Badge } from "../models/badge.model.js";
import { GamificationRule } from "../models/gamificationRule.model.js";

const DEFAULT_RULES = [
    { actionKey: "task.completed", module: "task", description: "Completed a task", points: 10, dailyCap: 5, dedupStrategy: "action_ref", streakHooks: [{ type: "daily_activity" }] },
    { actionKey: "note.created", module: "note", description: "Created a note", points: 4, dailyCap: 3, dedupStrategy: "action_ref", streakHooks: [{ type: "daily_activity" }] },
    { actionKey: "event.registration_approved", module: "event", description: "Approved event registration", points: 8, dedupStrategy: "action_ref" },
    { actionKey: "event.attended", module: "event", description: "Verified event attendance", points: 20, dedupStrategy: "action_ref", streakHooks: [{ type: "daily_activity" }] },
    { actionKey: "event.feedback_submitted", module: "event", description: "Submitted event feedback", points: 6, dedupStrategy: "action_ref" },
    { actionKey: "society.join_approved", module: "society", description: "Joined a society", points: 10, dedupStrategy: "action_ref" },
    { actionKey: "society.announcement_created", module: "society", description: "Created a society announcement", points: 5, dailyCap: 2, dedupStrategy: "action_ref" },
    { actionKey: "study_group.created", module: "study_group", description: "Created a study group", points: 12, dedupStrategy: "action_ref", streakHooks: [{ type: "daily_activity" }] },
    { actionKey: "study_group.resource_uploaded", module: "study_group", description: "Uploaded a study resource", points: 5, dailyCap: 2, dedupStrategy: "action_ref", streakHooks: [{ type: "daily_activity" }] },
    { actionKey: "study_group.join_approved", module: "study_group", description: "Approved into a study group", points: 6, dedupStrategy: "action_ref" },
    { actionKey: "mentor.verified", module: "mentor", description: "Mentor profile verified", points: 25, dedupStrategy: "one_time" },
    { actionKey: "mentor.booking_confirmed", module: "mentor", description: "Confirmed mentoring booking", points: 5, dedupStrategy: "action_ref" },
    { actionKey: "mentor.session_completed", module: "mentor", description: "Completed mentoring session", points: 20, dedupStrategy: "action_ref", streakHooks: [{ type: "daily_activity" }] },
    { actionKey: "mentor.review_submitted", module: "mentor", description: "Submitted mentor review", points: 8, dedupStrategy: "action_ref" },
    { actionKey: "competition.team_created", module: "competition", description: "Created a competition team", points: 10, dedupStrategy: "action_ref" },
    { actionKey: "competition.team_joined", module: "competition", description: "Joined a competition team", points: 6, dedupStrategy: "action_ref" },
    { actionKey: "competition.submission_submitted", module: "competition", description: "Submitted competition work", points: 15, dedupStrategy: "action_ref", streakHooks: [{ type: "daily_activity" }] },
    { actionKey: "competition.judging_completed", module: "competition", description: "Completed judging for a submission", points: 10, dedupStrategy: "action_ref" },
    { actionKey: "competition.leaderboard_published", module: "competition", description: "Published competition leaderboard", points: 10, dedupStrategy: "action_ref" },
    { actionKey: "profile.completed_100", module: "profile", description: "Completed profile to 100%", points: 25, dedupStrategy: "one_time" },
    { actionKey: "network.connection_accepted", module: "network", description: "Accepted a new connection", points: 2, dailyCap: 10, dedupStrategy: "action_ref" },
];

const DEFAULT_BADGES = [
    { key: "first_steps", name: "First Steps", description: "Earned your first 10 points.", icon: "footprint", category: "general", rarity: "common", criteria: { minPoints: 10 } },
    { key: "task_closer", name: "Task Closer", description: "Completed 5 tasks.", icon: "task_alt", category: "productivity", rarity: "rare", criteria: { actionCount: { actionKey: "task.completed", count: 5 } } },
    { key: "note_keeper", name: "Note Keeper", description: "Created 3 study notes.", icon: "sticky_note_2", category: "study", rarity: "common", criteria: { actionCount: { actionKey: "note.created", count: 3 } } },
    { key: "community_joiner", name: "Community Joiner", description: "Joined your first society.", icon: "diversity_3", category: "community", rarity: "common", criteria: { actionCount: { actionKey: "society.join_approved", count: 1 } } },
    { key: "mentor_verified", name: "Verified Mentor", description: "Your mentor profile was approved.", icon: "school", category: "mentor", rarity: "rare", criteria: { actionCount: { actionKey: "mentor.verified", count: 1 } } },
    { key: "session_guide", name: "Session Guide", description: "Completed 5 mentoring sessions.", icon: "workspace_premium", category: "mentor", rarity: "epic", criteria: { actionCount: { actionKey: "mentor.session_completed", count: 5 } } },
    { key: "team_founder", name: "Team Founder", description: "Created a competition team.", icon: "groups", category: "competition", rarity: "common", criteria: { actionCount: { actionKey: "competition.team_created", count: 1 } } },
    { key: "profile_complete", name: "Profile Complete", description: "Reached 100% profile completion.", icon: "verified", category: "profile", rarity: "rare", criteria: { actionCount: { actionKey: "profile.completed_100", count: 1 } } },
    { key: "streak_builder", name: "Streak Builder", description: "Reached a 3-day activity streak.", icon: "local_fire_department", category: "streak", rarity: "common", criteria: { streakDays: 3 } },
    { key: "streak_master", name: "Streak Master", description: "Reached a 7-day activity streak.", icon: "whatshot", category: "streak", rarity: "epic", criteria: { streakDays: 7 } },
];

export const seedDefaultGamificationConfig = async () => {
    try {
        for (const rule of DEFAULT_RULES) {
            await GamificationRule.findOneAndUpdate(
                { actionKey: rule.actionKey },
                { $setOnInsert: { ...rule, isActive: true, period: "all_time", frequencyLimit: 0 } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        for (const badge of DEFAULT_BADGES) {
            await Badge.findOneAndUpdate(
                { key: badge.key },
                { $setOnInsert: { ...badge, isActive: true, campusScope: "global", manualOnly: false } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        console.info("[Gamification] Default rules and badges seeded");
    } catch (error) {
        console.error("[Gamification] Seed failed:", error.message);
    }
};
