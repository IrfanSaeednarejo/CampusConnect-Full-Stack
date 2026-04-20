import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as networkService from "../services/network.service.js";

export const getNetworkState = asyncHandler(async (req, res) => {
    const data = await networkService.getNetworkState(req.user._id);
    return res.status(200).json(new ApiResponse(200, data, "Network state fetched"));
});

export const sendConnectionRequest = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;
    const connection = await networkService.sendRequest(req.user._id, targetUserId);
    return res.status(201).json(new ApiResponse(201, connection, "Connection request sent"));
});

export const respondToConnectionRequest = asyncHandler(async (req, res) => {
    const { action } = req.body; // "accept" or "reject"
    const connection = await networkService.respondToRequest(req.user._id, req.params.connectionId, action);
    return res.status(200).json(new ApiResponse(200, connection, `Request ${action}ed`));
});

export const cancelConnectionRequest = asyncHandler(async (req, res) => {
    await networkService.cancelRequest(req.user._id, req.params.connectionId);
    return res.status(200).json(new ApiResponse(200, null, "Request cancelled"));
});

export const removeConnection = asyncHandler(async (req, res) => {
    await networkService.removeConnection(req.user._id, req.params.connectionId);
    return res.status(200).json(new ApiResponse(200, null, "Connection removed"));
});

export const getSuggestedMembers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const suggested = await networkService.getSuggestedMembers(req.user._id, limit);
    return res.status(200).json(new ApiResponse(200, suggested, "Suggested members fetched"));
});
