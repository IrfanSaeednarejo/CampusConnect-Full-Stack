import { Connection } from "../models/connection.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { emitToUser } from "../sockets/index.js";

const SAFE_SELECT = "profile.displayName profile.avatar profile.firstName profile.lastName roles campusId interests";

export const getNetworkState = async (userId) => {
    const connections = await Connection.find({
        $or: [{ requester: userId }, { recipient: userId }]
    }).populate("requester", SAFE_SELECT)
      .populate("recipient", SAFE_SELECT)
      .lean();

    const pendingSent = [];
    const pendingReceived = [];
    const connected = [];

    connections.forEach((conn) => {
        if (conn.status === "accepted") {
            const peer = conn.requester._id.toString() === userId.toString() ? conn.recipient : conn.requester;
            connected.push({ connectionId: conn._id, user: peer, connectedAt: conn.updatedAt });
        } else if (conn.status === "pending") {
            if (conn.requester._id.toString() === userId.toString()) {
                pendingSent.push({ connectionId: conn._id, user: conn.recipient, requestedAt: conn.createdAt });
            } else {
                pendingReceived.push({ connectionId: conn._id, user: conn.requester, requestedAt: conn.createdAt });
            }
        }
    });

    return { connected, pendingSent, pendingReceived };
};

export const sendRequest = async (requesterId, recipientId) => {
    if (requesterId.toString() === recipientId.toString()) throw new ApiError(400, "Cannot connect to yourself");

    const recipientExists = await User.exists({ _id: recipientId });
    if (!recipientExists) throw new ApiError(404, "Target user not found");

    const existing = await Connection.findOne({
        $or: [
            { requester: requesterId, recipient: recipientId },
            { requester: recipientId, recipient: requesterId },
        ]
    });

    if (existing) {
        if (existing.status === "pending") throw new ApiError(400, "Connection request already pending");
        if (existing.status === "accepted") throw new ApiError(400, "Already connected");
        
        existing.requester = requesterId;
        existing.recipient = recipientId;
        existing.status = "pending";
        await existing.save();
        
        const populated = await Connection.findById(existing._id).populate("requester", SAFE_SELECT).lean();
        emitToUser(recipientId.toString(), "CONNECTION_REQUEST_RECEIVED", { connection: populated });
        return populated;
    }

    const newConnection = await Connection.create({
        requester: requesterId,
        recipient: recipientId,
        status: "pending"
    });

    const populated = await Connection.findById(newConnection._id).populate("requester", SAFE_SELECT).lean();
    emitToUser(recipientId.toString(), "CONNECTION_REQUEST_RECEIVED", { connection: populated });
    
    return populated;
};

export const respondToRequest = async (userId, connectionId, action) => {
    const connection = await Connection.findById(connectionId);
    if (!connection) throw new ApiError(404, "Connection request not found");

    if (connection.recipient.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only respond to requests sent to you");
    }

    if (connection.status !== "pending") {
        throw new ApiError(400, `Request is already ${connection.status}`);
    }

    if (action === "accept") {
        connection.status = "accepted";
        await connection.save();
        
        const populated = await Connection.findById(connection._id)
            .populate("requester", SAFE_SELECT)
            .populate("recipient", SAFE_SELECT)
            .lean();
        
        emitToUser(connection.requester._id.toString(), "CONNECTION_ACCEPTED", { connection: populated });
        return populated;
    } else if (action === "reject") {
        connection.status = "rejected";
        await connection.save();
        
        emitToUser(connection.requester._id.toString(), "CONNECTION_REJECTED", { connectionId });
        return { status: "rejected" };
    }

    throw new ApiError(400, "Invalid action");
};

export const cancelRequest = async (userId, connectionId) => {
    const connection = await Connection.findById(connectionId);
    if (!connection) throw new ApiError(404, "Connection request not found");

    if (connection.requester.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only cancel your own requests");
    }

    if (connection.status !== "pending") {
        throw new ApiError(400, "Can only cancel pending requests");
    }

    await connection.deleteOne();
    emitToUser(connection.recipient.toString(), "CONNECTION_CANCELLED", { connectionId });
    return { success: true };
};

export const removeConnection = async (userId, connectionId) => {
    const connection = await Connection.findById(connectionId);
    if (!connection) throw new ApiError(404, "Connection not found");
    
    if (connection.requester.toString() !== userId.toString() && connection.recipient.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized");
    }
    
    await connection.deleteOne();
    
    const otherUserId = connection.requester.toString() === userId.toString() ? connection.recipient.toString() : connection.requester.toString();
    emitToUser(otherUserId, "CONNECTION_REMOVED", { connectionId });
    
    return { success: true };
};

export const getSuggestedMembers = async (userId, limit = 5) => {
    const me = await User.findById(userId).lean();
    if (!me) throw new ApiError(404, "User not found");
    
    const connections = await Connection.find({
        $or: [{ requester: userId }, { recipient: userId }]
    }).lean();
    
    const excludeIds = connections.map(c => 
        c.requester.toString() === userId.toString() ? c.recipient : c.requester
    );
    excludeIds.push(userId);
    
    const suggested = await User.find({
        _id: { $nin: excludeIds },
        campusId: me.campusId,
        status: "active"
    }).select(SAFE_SELECT).limit(limit).lean();
    
    if (suggested.length < limit) {
        const more = await User.find({
           _id: { $nin: [...excludeIds, ...suggested.map(s => s._id)] },
           status: "active"
        }).select(SAFE_SELECT).limit(limit - suggested.length).lean();
        return [...suggested, ...more];
    }
    
    return suggested;
};
