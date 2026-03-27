import { Event } from "../models/event.model.js";
import { systemEvents } from "../utils/events.js";
import { emitStatusChange } from "../sockets/event.socket.js";


const JOB_INTERVAL_MS = 60 * 1000;

let _jobTimer = null;

export const runEventTransitions = async (app) => {
    const now = new Date();

    try {
        const readyToStart = await Event.find({
            isOnlineCompetition: true,
            status: "registration",
            startAt: { $lte: now },
        }).select("_id title campusId judgingConfig startAt");

        for (const event of readyToStart) {
            try {
                await Event.findByIdAndUpdate(event._id, { $set: { status: "ongoing" } });

                const io = app?.get("io");
                if (io) {
                    emitStatusChange(io, event._id.toString(), {
                        previousStatus: "registration",
                        newStatus: "ongoing",
                        changedBy: null,
                        changedAt: now,
                        automated: true,
                    });
                }

                systemEvents.emit("notification:create:bulk", {
                    eventId: event._id,
                    type: "event_update",
                    title: `🚀 ${event.title} — Competition Has Started!`,
                    body: "The competition is now live. Start working on your submission!",
                    ref: event._id,
                    refModel: "Event",
                    actorId: null,
                });

                console.info(
                    `[EventTransitions] ${event._id} (${event.title}) → ongoing (automated)`
                );
            } catch (err) {
                console.error(
                    `[EventTransitions] Failed to transition ${event._id} to ongoing:`,
                    err.message
                );
            }
        }

        const readyToLock = await Event.find({
            isOnlineCompetition: true,
            status: "ongoing",
            submissionDeadline: { $lte: now, $exists: true },
        }).select("_id title campusId submissionDeadline");

        for (const event of readyToLock) {
            try {
                await Event.findByIdAndUpdate(event._id, { $set: { status: "submission_locked" } });

                const io = app?.get("io");
                if (io) {
                    emitStatusChange(io, event._id.toString(), {
                        previousStatus: "ongoing",
                        newStatus: "submission_locked",
                        changedBy: null,
                        changedAt: now,
                        automated: true,
                    });
                }

                systemEvents.emit("notification:create:bulk", {
                    eventId: event._id,
                    type: "event_update",
                    title: `🔒 ${event.title} — Submissions Closed`,
                    body: "The submission deadline has passed. No further submissions will be accepted.",
                    ref: event._id,
                    refModel: "Event",
                    actorId: null,
                });

                console.info(
                    `[EventTransitions] ${event._id} (${event.title}) → submission_locked (automated)`
                );
            } catch (err) {
                console.error(
                    `[EventTransitions] Failed to transition ${event._id} to submission_locked:`,
                    err.message
                );
            }
        }

        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const approaching = await Event.find({
            isOnlineCompetition: true,
            status: "ongoing",
            submissionDeadline: {
                $gt: now,
                $lte: in24Hours,
            },
        }).select("_id title submissionDeadline _reminderSent");

        for (const event of approaching) {
            systemEvents.emit("notification:create:bulk", {
                eventId: event._id,
                type: "event_reminder",
                title: `⏰ ${event.title} — 24 Hours Remaining`,
                body: `Submission deadline is in less than 24 hours. Make sure your work is submitted!`,
                ref: event._id,
                refModel: "Event",
                actorId: null,
            });
        }

    } catch (err) {
        console.error("[EventTransitions] Job error:", err.message);
    }
};

export const startEventTransitionJob = (app, intervalMs = JOB_INTERVAL_MS) => {
    if (_jobTimer) {
        console.warn("[EventTransitions] Job is already running");
        return;
    }
    runEventTransitions(app).catch((err) =>
        console.error("[EventTransitions] Startup run error:", err.message)
    );

    _jobTimer = setInterval(() => {
        runEventTransitions(app).catch((err) =>
            console.error("[EventTransitions] Interval run error:", err.message)
        );
    }, intervalMs);

    console.info(
        `[EventTransitions] Job started — checking every ${intervalMs / 1000}s`
    );
};
export const stopEventTransitionJob = () => {
    if (_jobTimer) {
        clearInterval(_jobTimer);
        _jobTimer = null;
        console.info("[EventTransitions] Job stopped");
    }
};