import assert from "assert/strict";
import { createServer } from "http";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import { app } from "../app.js";
import { Badge } from "../src/models/badge.model.js";
import { Certificate } from "../src/models/certificate.model.js";
import { GamificationRule } from "../src/models/gamificationRule.model.js";
import { PointsTransaction } from "../src/models/pointsTransaction.model.js";
import { User } from "../src/models/user.model.js";
import { UserBadge } from "../src/models/userBadge.model.js";
import { UserGamification } from "../src/models/userGamification.model.js";
import {
    awardForAction,
    emitGamificationSocketEvents,
    updateUserGamificationSummary,
} from "../src/services/gamification.service.js";
import { issueCertificate, verifyCertificate } from "../src/services/certificate.service.js";

const cleanupIds = {
    userId: null,
    badgeId: null,
};

const ensure = async (label, fn) => {
    await fn();
    console.log(`PASS ${label}`);
};

const uniqueEmail = () => `gamification-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

const createTestUser = async () => {
    const user = await User.create({
        email: uniqueEmail(),
        password: "Password123!",
        roles: ["student"],
        profile: {
            firstName: "Smoke",
            lastName: "Tester",
            displayName: `smoke_${Date.now()}`,
        },
    });
    cleanupIds.userId = user._id;
    return user;
};

const upsertRule = async (rule) =>
    await GamificationRule.findOneAndUpdate(
        { actionKey: rule.actionKey },
        { $set: rule },
        { upsert: true, new: true, runValidators: true }
    );

const main = async () => {
    await connectDB();
    const server = createServer(app);

    try {
        const user = await createTestUser();

        const badge = await Badge.findOneAndUpdate(
            { key: "smoke_test_badge" },
            {
                $set: {
                    name: "Smoke Test Badge",
                    description: "Unlocked during gamification smoke tests",
                    icon: "verified",
                    category: "testing",
                    rarity: "common",
                    criteria: { actionCount: { actionKey: "smoke.action", count: 1 } },
                    isActive: true,
                    campusScope: "global",
                    manualOnly: false,
                },
            },
            { upsert: true, new: true, runValidators: true }
        );
        cleanupIds.badgeId = badge._id;

        await upsertRule({
            actionKey: "smoke.action",
            module: "testing",
            description: "Smoke award action",
            points: 11,
            dailyCap: 50,
            dedupStrategy: "action_ref",
            isActive: true,
            frequencyLimit: 0,
            period: "all_time",
        });

        await upsertRule({
            actionKey: "smoke.cap",
            module: "testing",
            description: "Smoke cap action",
            points: 6,
            dailyCap: 1,
            dedupStrategy: "action_ref",
            isActive: true,
            frequencyLimit: 0,
            period: "all_time",
        });

        await ensure("protected summary route returns 401 without token", async () => {
            await new Promise((resolve) => server.listen(0, resolve));
            const { port } = server.address();
            const response = await fetch(`http://127.0.0.1:${port}/api/v1/gamification/me/summary`);
            assert.equal(response.status, 401);
        });

        await ensure("public certificate verification returns 404 for invalid code", async () => {
            const { port } = server.address();
            const response = await fetch(`http://127.0.0.1:${port}/api/v1/gamification/certificates/verify/INVALID-CODE`);
            assert.equal(response.status, 404);
        });

        let firstAward;
        await ensure("awardForAction creates transaction and updates summary", async () => {
            firstAward = await awardForAction({
                actionKey: "smoke.action",
                actorId: user._id,
                refModel: "User",
                refId: user._id,
                context: {
                    dedupKey: `smoke-action-${user._id}`,
                    reason: "Smoke test award",
                },
            });
            assert.equal(firstAward.skipped, false);
            assert.ok(firstAward.transaction?._id);
            const summary = await UserGamification.findOne({ userId: user._id });
            assert.ok(summary);
            assert.equal(summary.totalPoints >= 11, true);
        });

        await ensure("duplicate reward is blocked", async () => {
            const duplicate = await awardForAction({
                actionKey: "smoke.action",
                actorId: user._id,
                refModel: "User",
                refId: user._id,
                context: {
                    dedupKey: `smoke-action-${user._id}`,
                    reason: "Smoke test award",
                },
            });
            assert.equal(duplicate.skipped, true);
            assert.equal(duplicate.reason, "duplicate_reward_blocked");
        });

        await ensure("daily cap is enforced", async () => {
            const first = await awardForAction({
                actionKey: "smoke.cap",
                actorId: user._id,
                refModel: "User",
                refId: `${user._id}-cap-1`,
                context: { reason: "Cap test 1" },
            });
            assert.equal(first.skipped, false);

            const second = await awardForAction({
                actionKey: "smoke.cap",
                actorId: user._id,
                refModel: "User",
                refId: `${user._id}-cap-2`,
                context: { reason: "Cap test 2" },
            });
            assert.equal(second.skipped, true);
            assert.equal(second.reason, "daily_cap_reached");
        });

        await ensure("badge unlock works when criteria are met", async () => {
            const awardedBadge = await UserBadge.findOne({ userId: user._id, badgeId: badge._id });
            assert.ok(awardedBadge);
        });

        await ensure("user summary updates after points", async () => {
            const summary = await updateUserGamificationSummary(user._id);
            assert.equal(summary.totalPoints >= 17, true);
            assert.equal(summary.level >= 1, true);
        });

        await ensure("socket emit function does not crash", async () => {
            assert.doesNotThrow(() => {
                emitGamificationSocketEvents({
                    userId: user._id.toString(),
                    pointsEvent: {
                        userId: user._id.toString(),
                        actionKey: "smoke.action",
                        points: 1,
                        totalPoints: 1,
                        level: 1,
                        reason: "socket smoke",
                        createdAt: new Date().toISOString(),
                    },
                });
            });
        });

        let certificate;
        await ensure("certificate verification works for generated certificate", async () => {
            certificate = await issueCertificate({
                userId: user._id,
                sourceModel: "Manual",
                sourceId: `smoke-${user._id}`,
                type: "manual_test",
                title: "Smoke Test Certificate",
                meta: { roleLabel: "Tester" },
            });
            assert.ok(certificate._id);
            const verified = await verifyCertificate(certificate.verificationCode);
            assert.ok(verified);
            assert.equal(verified.verificationCode, certificate.verificationCode);
            assert.equal(verified.recipient.displayName.length > 0, true);
        });

        console.log("Gamification smoke tests completed successfully.");
    } finally {
        if (server.listening) {
            await new Promise((resolve) => server.close(resolve));
        }

        if (cleanupIds.userId) {
            await Promise.all([
                UserGamification.deleteMany({ userId: cleanupIds.userId }),
                PointsTransaction.deleteMany({ userId: cleanupIds.userId }),
                UserBadge.deleteMany({ userId: cleanupIds.userId }),
                Certificate.deleteMany({ userId: cleanupIds.userId }),
                User.deleteOne({ _id: cleanupIds.userId }),
            ]);
        }

        if (cleanupIds.badgeId) {
            await Badge.deleteOne({ _id: cleanupIds.badgeId });
        }

        await GamificationRule.deleteMany({ actionKey: { $in: ["smoke.action", "smoke.cap"] } });
        await mongoose.disconnect();
    }
};

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("Gamification smoke tests failed:", error);
        process.exit(1);
    });
