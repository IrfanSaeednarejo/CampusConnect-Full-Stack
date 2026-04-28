import { Connection } from "../models/connection.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { emitToUser } from "../sockets/index.js";
import { systemEvents } from "../utils/events.js";
import { sendEmail } from "./email.service.js";

const SAFE_SELECT = "profile.displayName profile.avatar profile.firstName profile.lastName profile.bio roles campusId interests";

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
        
        systemEvents.emit("notification:create", {
            userId: recipientId,
            type: "connection_request",
            title: "New Connection Request",
            body: `${populated.requester.profile.displayName} sent you a connection request.`,
            ref: populated.requester._id,
            refModel: "User",
            actorId: requesterId
        });

        // Email the recipient
        const recipientUserDoc = await User.findById(recipientId).select("email profile.firstName");
        if (recipientUserDoc) {
            sendEmail(recipientUserDoc.email, "connection_request", {
                firstName: recipientUserDoc.profile.firstName,
                senderName: populated.requester.profile.displayName,
                profileUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/users/${requesterId}`,
            });
        }

        return populated;
    }

    const newConnection = await Connection.create({
        requester: requesterId,
        recipient: recipientId,
        status: "pending"
    });

    const populated = await Connection.findById(newConnection._id).populate("requester", SAFE_SELECT).lean();
    emitToUser(recipientId.toString(), "CONNECTION_REQUEST_RECEIVED", { connection: populated });
    
    systemEvents.emit("notification:create", {
        userId: recipientId,
        type: "connection_request",
        title: "New Connection Request",
        body: `${populated.requester.profile.displayName} sent you a connection request.`,
        ref: populated.requester._id,
        refModel: "User",
        actorId: requesterId
    });

    // Email the recipient
    const recipientUserDoc = await User.findById(recipientId).select("email profile.firstName");
    if (recipientUserDoc) {
        sendEmail(recipientUserDoc.email, "connection_request", {
            firstName: recipientUserDoc.profile.firstName,
            senderName: populated.requester.profile.displayName,
            profileUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/users/${requesterId}`,
        });
    }

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
        
        systemEvents.emit("notification:create", {
            userId: connection.requester._id,
            type: "connection_accepted",
            title: "Connection Request Accepted",
            body: `${populated.recipient.profile.displayName} accepted your connection request.`,
            ref: populated.recipient._id,
            refModel: "User",
            actorId: userId
        });

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
    
    // Get all my existing connections (any status) to exclude them
    const connections = await Connection.find({
        $or: [{ requester: userId }, { recipient: userId }]
    }).lean();
    
    const excludeIds = connections.map(c => 
        c.requester.toString() === userId.toString() ? c.recipient.toString() : c.requester.toString()
    );
    excludeIds.push(userId.toString());
    
    // Get candidates
    const candidates = await User.find({
        _id: { $nin: excludeIds },
        status: "active",
        roles: { $nin: ["super_admin"] }
    }).select(SAFE_SELECT).lean();
    
    const myAcceptedSet = new Set(connections.filter(c => c.status === "accepted").map(c => 
        c.requester.toString() === userId.toString() ? c.recipient.toString() : c.requester.toString()
    ));

    const mutualConns = await Connection.find({
        $or: [
            { requester: { $in: Array.from(myAcceptedSet) } },
            { recipient: { $in: Array.from(myAcceptedSet) } }
        ],
        status: "accepted"
    }).lean();

    const mutualCountMap = {};
    mutualConns.forEach(c => {
        const reqStr = c.requester.toString();
        const recStr = c.recipient.toString();
        if (myAcceptedSet.has(reqStr) && !myAcceptedSet.has(recStr)) {
            mutualCountMap[recStr] = (mutualCountMap[recStr] || 0) + 1;
        } else if (myAcceptedSet.has(recStr) && !myAcceptedSet.has(reqStr)) {
            mutualCountMap[reqStr] = (mutualCountMap[reqStr] || 0) + 1;
        }
    });

    const myInterests = me.interests || [];

    const scored = candidates.map(c => {
        let score = 0;
        
        if (c.campusId?.toString() === me.campusId?.toString()) score += 5;
        
        const commonInterests = (c.interests || []).filter(i => myInterests.includes(i));
        score += commonInterests.length * 2;
        
        const mCount = mutualCountMap[c._id.toString()] || 0;
        score += mCount * 3;
        
        let matchType = "New";
        if (score >= 15) matchType = "Strong match";
        else if (score >= 5) matchType = "Moderate match";

        return {
            ...c,
            score,
            mutualCount: mCount,
            sharedInterests: commonInterests,
            matchType
        };
    });
    
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return 0; // fallback can be adding recent or random
    });
    
    return scored.slice(0, limit);
};

export const getMutualConnections = async (userId, targetId, limit = 3) => {
    const myConns = await Connection.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: "accepted"
    }).lean();
    
    const targetConns = await Connection.find({
        $or: [{ requester: targetId }, { recipient: targetId }],
        status: "accepted"
    }).lean();
    
    const mySet = new Set(myConns.map(c => 
        c.requester.toString() === userId.toString() ? c.recipient.toString() : c.requester.toString()
    ));
    
    const mutualIds = targetConns.reduce((acc, c) => {
        const peerId = c.requester.toString() === targetId.toString() ? c.recipient.toString() : c.requester.toString();
        if (mySet.has(peerId) && peerId !== userId.toString()) {
            acc.push(peerId);
        }
        return acc;
    }, []);
    
    const mutualCount = mutualIds.length;
    const previewIds = mutualIds.slice(0, limit);
    
    const mutualUsers = await User.find({ _id: { $in: previewIds } })
        .select(SAFE_SELECT).lean();
        
    return {
        mutualCount,
        mutualUsers
    };
};

export const getUserConnections = async (targetUserId) => {
    const connections = await Connection.find({
        $or: [{ requester: targetUserId }, { recipient: targetUserId }],
        status: "accepted"
    }).populate("requester", SAFE_SELECT)
      .populate("recipient", SAFE_SELECT)
      .lean();

    const result = connections.map((conn) => {
        const peer = conn.requester._id.toString() === targetUserId.toString() ? conn.recipient : conn.requester;
        return { connectionId: conn._id, user: peer, connectedAt: conn.updatedAt };
    });

    return result;
};

export const getConnectionStatus = async (userId, targetId) => {
    const connection = await Connection.findOne({
        $or: [
            { requester: userId, recipient: targetId },
            { requester: targetId, recipient: userId }
        ]
    }).lean();

    if (!connection) return { status: 'none', connectionId: null };
    return {
        status: connection.status,          // 'pending' | 'accepted' | 'rejected'
        connectionId: connection._id,
        isRequester: connection.requester.toString() === userId.toString()
    };
};
