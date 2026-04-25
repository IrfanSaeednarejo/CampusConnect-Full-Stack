import cron from "node-cron";
import { getUpcomingReminders, markReminderSent } from "../services/task.service.js";
import { systemEvents } from "../utils/events.js";

/**
 * Task Reminder Cron Job
 *
 * Runs every 30 minutes.
 * Finds all tasks due within the next 24 hours that haven't had a reminder sent.
 * Emits a notification:create system event for each, then marks the reminder as sent.
 *
 * Non-blocking: failures are logged but never crash the job.
 */
export const startTaskReminderJob = () => {
    // Runs every 30 minutes: "*/30 * * * *"
    cron.schedule("*/30 * * * *", async () => {
        console.log("[TaskReminderJob] Running reminder check...");

        try {
            const tasks = await getUpcomingReminders(24);

            if (tasks.length === 0) {
                console.log("[TaskReminderJob] No upcoming tasks to remind.");
                return;
            }

            console.log(`[TaskReminderJob] Found ${tasks.length} task(s) to remind.`);

            for (const task of tasks) {
                try {
                    const dueText = task.dueDate
                        ? new Date(task.dueDate).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                          })
                        : "soon";

                    systemEvents.emit("notification:create", {
                        userId: task.userId,
                        type: "task_reminder",
                        title: "⏰ Task Due Soon",
                        body: `"${task.title}" is due ${dueText}. Don't forget!`,
                        ref: task._id,
                        refModel: "Task",
                        priority: task.priority === "urgent" ? "high" : "normal",
                    });

                    await markReminderSent(task._id);
                } catch (err) {
                    console.error(
                        `[TaskReminderJob] Failed to process task ${task._id}:`,
                        err.message
                    );
                }
            }
        } catch (err) {
            console.error("[TaskReminderJob] Critical error during reminder check:", err.message);
        }
    });

    console.info("[TaskReminderJob] Initialized — runs every 30 minutes.");
};
