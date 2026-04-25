import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as taskService from "../services/task.service.js";

const createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user);
    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

const getMyTasks = asyncHandler(async (req, res) => {
    const result = await taskService.getMyTasks(req.query, req.user);
    return res.status(200).json(new ApiResponse(200, result, "Tasks fetched successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);
    return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

const completeTask = asyncHandler(async (req, res) => {
    const task = await taskService.completeTask(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, task, "Task marked as completed"));
});

const deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.params.id, req.user);
    return res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
});

export { createTask, getMyTasks, getTaskById, updateTask, completeTask, deleteTask };
