import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Task } from "../models/task.model.js";
import { paginate } from "../utils/paginate.js";
import { emitEvent, EventTypes } from "../utils/eventBus.js";
import { systemEvents } from "../utils/events.js";

/**
 * Create a new task for the requesting user.
 */
export const createTask = async (data, requestUser) => {
    const { title, description, dueDate, priority, status, source, sourceRef, tags } = data;

    if (!title?.trim()) {
        throw new ApiError(400, "Task title is required");
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    if (parsedDueDate && isNaN(parsedDueDate.getTime())) {
        throw new ApiError(400, "Invalid due date format");
    }

    const task = await Task.create({
        userId: requestUser._id,
        campusId: requestUser.campusId,
        title: title.trim(),
        description: description?.trim() || "",
        dueDate: parsedDueDate,
        priority: priority || "medium",
        status: status || "pending",
        source: source || "manual",
        sourceRef: sourceRef || null,
        tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
    });

    // Emit event for side effects (e.g. Nexus handler notifications)
    emitEvent(EventTypes.NEXUS_TASK_CREATED, {
        actorId: requestUser._id,
        targetId: requestUser._id,
        payload: {
            taskId: task._id,
            title: task.title,
            source: task.source,
        },
    });

    return task;
};

/**
 * Get all tasks for the requesting user with optional filters and pagination.
 */
export const getMyTasks = async (queryParams, requestUser) => {
    const { page = 1, limit = 20, status, priority, source, search, dueBefore, dueAfter } = queryParams;

    const filter = {
        userId: requestUser._id,
        isArchived: false,
    };

    if (status && ["pending", "in_progress", "completed", "cancelled"].includes(status)) {
        filter.status = status;
    }
    if (priority && ["low", "medium", "high", "urgent"].includes(priority)) {
        filter.priority = priority;
    }
    if (source && ["manual", "ai", "event", "booking"].includes(source)) {
        filter.source = source;
    }
    if (search?.trim()) {
        filter.$or = [
            { title: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } },
        ];
    }
    if (dueBefore || dueAfter) {
        filter.dueDate = {};
        if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
        if (dueAfter) filter.dueDate.$gte = new Date(dueAfter);
    }

    return await paginate(Task, filter, {
        page,
        limit,
        sort: { dueDate: 1, priority: -1, createdAt: -1 },
    });
};

/**
 * Get a single task by ID — enforces ownership.
 */
export const getTaskById = async (taskId, requestUser) => {
    if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid task ID format");
    }

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");
    if (task.userId.toString() !== requestUser._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    return task;
};

/**
 * Update a task — enforces ownership. Partial patch.
 */
export const updateTask = async (taskId, data, requestUser) => {
    const task = await getTaskById(taskId, requestUser);

    const allowedFields = ["title", "description", "dueDate", "priority", "status", "tags", "isArchived"];
    const updates = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates[field] = data[field];
        }
    }

    if (updates.title !== undefined) updates.title = updates.title.trim();
    if (updates.dueDate !== undefined) {
        const d = new Date(updates.dueDate);
        if (isNaN(d.getTime())) throw new ApiError(400, "Invalid due date format");
        updates.dueDate = d;
    }
    if (updates.tags !== undefined) {
        updates.tags = Array.isArray(updates.tags)
            ? updates.tags.map((t) => t.trim()).filter(Boolean)
            : task.tags;
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided to update");
    }

    return await Task.findByIdAndUpdate(
        taskId,
        { $set: updates },
        { new: true, runValidators: true }
    );
};

/**
 * Mark a task as completed.
 */
export const completeTask = async (taskId, requestUser) => {
    const task = await getTaskById(taskId, requestUser);

    if (task.status === "completed") {
        throw new ApiError(400, "Task is already completed");
    }
    if (task.status === "cancelled") {
        throw new ApiError(400, "Cannot complete a cancelled task");
    }

    return await Task.findByIdAndUpdate(
        taskId,
        { $set: { status: "completed", completedAt: new Date() } },
        { new: true }
    );
};

/**
 * Delete a task — hard delete, enforces ownership.
 */
export const deleteTask = async (taskId, requestUser) => {
    await getTaskById(taskId, requestUser);
    await Task.findByIdAndDelete(taskId);
    return true;
};

/**
 * Used by the cron job to find tasks due within `hoursAhead` that haven't
 * had a reminder sent yet.
 * @param {number} hoursAhead - Look-ahead window in hours.
 */
export const getUpcomingReminders = async (hoursAhead = 24) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return await Task.find({
        status: { $in: ["pending", "in_progress"] },
        dueDate: { $gte: now, $lte: cutoff },
        reminderSentAt: null,
        isArchived: false,
    }).select("_id userId title dueDate priority");
};

/**
 * Mark that a reminder has been sent for a task.
 */
export const markReminderSent = async (taskId) => {
    await Task.findByIdAndUpdate(taskId, { $set: { reminderSentAt: new Date() } });
};
