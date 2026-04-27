import mongoose from "mongoose";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { StudyGroup } from "../models/studyGroup.model.js";
import { EntityRequest } from "../models/entityRequest.model.js";
import { Chat } from "../models/chat.model.js";
import { File } from "../models/file.model.js";
import { paginate } from "../utils/paginate.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { systemEvents } from "../utils/events.js";

const uploadFile = async (localPath) => {
    if (!localPath) return null;
    try {
        return await uploadOnCloudinary(localPath);
    } finally {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }
};

const findGroupById = async (groupId, select = "") => {
    if (!mongoose.isValidObjectId(groupId)) throw new ApiError(400, "Invalid study group ID format");
    const group = await StudyGroup.findById(groupId).select(select || undefined);
    if (!group) throw new ApiError(404, "Study group not found");
    return group;
};

const requireCoordinatorOrAdmin = (group, user) => {
    const isAdmin = user.roles?.includes("admin");
    const isCoordinator = group.coordinatorId.toString() === user._id.toString();
    if (!isAdmin && !isCoordinator) throw new ApiError(403, "Only the group coordinator or an admin can perform this action");
};

const requireActiveMember = (group, userId) => {
    const id = userId.toString();
    const isCoordinator = group.coordinatorId.toString() === id;
    const isMember = group.groupMembers.some((m) => m.memberId.toString() === id && m.status === "approved");
    if (!isCoordinator && !isMember) throw new ApiError(403, "You must be an approved member of this study group");
};

export const getStudyGroups = async (queryParams, requestUser) => {
    const { page = 1, limit = 12, campusId, subject, course, tag, status = "active", isPrivate, q } = queryParams;

    const filter = {};
    const isAdmin = requestUser?.roles?.includes("admin");

    const resolvedCampusId = campusId || requestUser?.campusId;
    if (resolvedCampusId) {
        if (!mongoose.isValidObjectId(resolvedCampusId)) throw new ApiError(400, "Invalid campusId format");
        filter.campusId = new mongoose.Types.ObjectId(resolvedCampusId);
    }

    if (!isAdmin) {
        filter.status = "active";
        filter.$or = [
            { isPrivate: false },
            ...(requestUser?._id ? [
                { "groupMembers.memberId": requestUser._id },
                { coordinatorId: requestUser._id },
            ] : []),
        ];
    } else {
        if (status !== "all") filter.status = status;
        if (isPrivate !== undefined) filter.isPrivate = isPrivate === "true";
    }

    if (subject) filter.subject = { $regex: subject.trim(), $options: "i" };
    if (course) filter.course = { $regex: course.trim(), $options: "i" };
    if (tag) filter.tags = tag.trim().toLowerCase();
    if (q?.trim()) filter.$text = { $search: q.trim() };

    return await paginate(StudyGroup, filter, {
        page, limit, select: "-groupResources",
        sort: q?.trim() ? { score: { $meta: "textScore" } } : { createdAt: -1 },
        populate: [{ path: "coordinatorId", select: "profile.displayName profile.avatar" }],
    });
};

export const getMyStudyGroups = async (queryParams, requestUser) => {
    if (!requestUser?._id) throw new ApiError(401, "Authentication required");

    const { page = 1, limit = 12 } = queryParams;
    const userId = requestUser._id;

    const filter = {
        status: { $ne: "deleted" },
        $or: [
            { coordinatorId: userId },
            { "groupMembers.memberId": userId, "groupMembers.status": "approved" }
        ]
    };

    return await paginate(StudyGroup, filter, {
        page, limit,
        sort: { createdAt: -1 },
        populate: [{ path: "coordinatorId", select: "profile.displayName profile.avatar" }],
    });
};


export const getStudyGroupById = async (groupId, requestUser) => {
    if (!mongoose.isValidObjectId(groupId)) throw new ApiError(400, "Invalid study group ID format");

    const group = await StudyGroup.findById(groupId)
        .populate("coordinatorId", "profile.displayName profile.avatar profile.firstName profile.lastName")
        .populate({ path: "groupMembers.memberId", select: "profile.displayName profile.avatar profile.firstName profile.lastName academic.department" })
        .populate({ path: "groupResources.fileId", select: "fileName fileUrl mimeType fileSize" })
        .populate({ path: "groupResources.uploadedBy", select: "profile.displayName profile.avatar" });

    if (!group || group.status === "deleted") throw new ApiError(404, "Study group not found");

    const isAdmin = requestUser?.roles?.includes("admin");
    if (group.isPrivate && !isAdmin) {
        const userId = requestUser._id.toString();
        const isMember = group.groupMembers.some((m) => m.memberId._id?.toString() === userId || m.memberId.toString?.() === userId);
        const isCoordinator = group.coordinatorId._id?.toString() === userId || group.coordinatorId.toString() === userId;
        
        if (!isMember && !isCoordinator) {
            throw new ApiError(403, "This is a private study group. Request an invite to view it.");
        }
    }

    return group;
};

export const createStudyGroup = async (data, requestUser) => {
    const { name, description, subject, course, tags, maxMembers, isPrivate, requireJoinApproval, schedule, campusId } = data;

    if (!name?.trim()) throw new ApiError(400, "Study group name is required");

    const resolvedCampusId = campusId || requestUser?.campusId;
    if (!resolvedCampusId) throw new ApiError(400, "campusId is required — set it in your profile or pass it in the request body");

    const parsedTags = Array.isArray(tags) ? tags : typeof tags === "string" ? JSON.parse(tags) : [];
    const parsedSchedule = Array.isArray(schedule) ? schedule : typeof schedule === "string" ? JSON.parse(schedule) : [];

    const isAdmin = requestUser.roles?.includes("admin");
    const forcedStatus = isAdmin ? (data.status || "active") : "pending";

    const resolvedCoordinatorId = isAdmin && data.coordinatorId ? data.coordinatorId : requestUser._id;

    const groupData = {
        name: name.trim(), 
        description: description?.trim() || "", 
        subject: subject?.trim() || "",
        course: course?.trim() || "", 
        campusId: resolvedCampusId, 
        coordinatorId: resolvedCoordinatorId,
        tags: parsedTags, 
        maxMembers: parseInt(maxMembers, 10) || 20, 
        isPrivate: isPrivate === "true" || isPrivate === true,
        requireJoinApproval: requireJoinApproval === "true" || requireJoinApproval === true,
        schedule: parsedSchedule, 
        groupMembers: [{ memberId: resolvedCoordinatorId, role: "coordinator", status: "approved", joinedAt: new Date() }],
        memberCount: 1, 
        status: forcedStatus,
        requestedBy: requestUser._id,
    };

    if (isAdmin && forcedStatus === "active") {
        groupData.approvedBy = requestUser._id;
    }

    if (data.requestMeta) {
        groupData.requestMeta = {
            notes: data.requestMeta.notes?.trim() || "",
            expectedSize: parseInt(data.requestMeta.expectedSize, 10) || 0,
            preferredSchedule: Array.isArray(data.requestMeta.preferredSchedule) ? data.requestMeta.preferredSchedule : []
        };
    }

    const group = await StudyGroup.create(groupData);

    if (forcedStatus === "pending") {
        await EntityRequest.create({
            type: "study_group",
            payload: data,
            requestedBy: requestUser._id,
            campusId: resolvedCampusId,
            createdEntityId: group._id,
        }).catch(err => console.error("[StudyGroup] Failed to create EntityRequest:", err.message));
    }

    try {
        const chat = await Chat.create({
            type: "studygroup", name: group.name, description: group.description, campusId: resolvedCampusId,
            createdBy: requestUser._id, contextId: group._id, members: [{ userId: resolvedCoordinatorId, role: "admin", joinedAt: new Date() }],
        });
        group.chatId = chat._id;
        await group.save();
    } catch (err) {
        console.error("[StudyGroup] Failed to create linked chat:", err.message);
    }

    return await StudyGroup.findById(group._id)
        .populate("coordinatorId", "profile.displayName profile.avatar")
        .select("-groupResources");
};

export const updateStudyGroup = async (groupId, data, requestUser) => {
    const { name, description, subject, course, tags, maxMembers, isPrivate, schedule } = data;

    const group = await findGroupById(groupId, "coordinatorId status");
    requireCoordinatorOrAdmin(group, requestUser);

    if (group.status !== "active") throw new ApiError(400, "Cannot update an archived or deleted study group");

    const updates = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (subject !== undefined) updates.subject = subject.trim();
    if (course !== undefined) updates.course = course.trim();
    if (maxMembers !== undefined) updates.maxMembers = parseInt(maxMembers, 10);
    if (isPrivate !== undefined) updates.isPrivate = isPrivate === "true" || isPrivate === true;
    if (data.requireJoinApproval !== undefined) updates.requireJoinApproval = data.requireJoinApproval === "true" || data.requireJoinApproval === true;

    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : typeof tags === "string" ? JSON.parse(tags) : [];
    if (schedule !== undefined) updates.schedule = Array.isArray(schedule) ? schedule : typeof schedule === "string" ? JSON.parse(schedule) : [];

    if (Object.keys(updates).length === 0) throw new ApiError(400, "No valid fields provided — nothing to update");

    const updated = await StudyGroup.findByIdAndUpdate(groupId, { $set: updates }, { new: true, runValidators: true })
        .populate("coordinatorId", "profile.displayName profile.avatar")
        .select("-groupResources");

    if (updates.name && updated.chatId) {
        Chat.findByIdAndUpdate(updated.chatId, { $set: { name: updates.name } })
            .catch((err) => console.error("[StudyGroup] Failed to sync chat name:", err.message));
    }

    return updated;
};

export const deleteStudyGroup = async (groupId, requestUser) => {
    const group = await findGroupById(groupId, "coordinatorId chatId memberCount status");
    requireCoordinatorOrAdmin(group, requestUser);

    if (group.status === "deleted") throw new ApiError(400, "Study group is already deleted");

    await StudyGroup.findByIdAndUpdate(groupId, { $set: { status: "deleted" } });

    if (group.chatId) {
        Chat.findByIdAndUpdate(group.chatId, { $set: { isArchived: true } })
            .catch((err) => console.error("[StudyGroup] Failed to archive linked chat:", err.message));
    }

    return { groupId, membersAffected: group.memberCount };
};

export const archiveStudyGroup = async (groupId, requestUser) => {
    const group = await findGroupById(groupId, "coordinatorId status");
    requireCoordinatorOrAdmin(group, requestUser);

    if (group.status !== "active") throw new ApiError(400, `Study group is already "${group.status}"`);

    return await StudyGroup.findByIdAndUpdate(groupId, { $set: { status: "archived" } }, { new: true })
        .select("_id name status");
};

export const joinStudyGroup = async (groupId, requestUser) => {
    const group = await findGroupById(groupId, "coordinatorId groupMembers memberCount maxMembers isPrivate requireJoinApproval status chatId");

    if (group.status !== "active") throw new ApiError(400, "This study group is not currently accepting members");
    if (group.isPrivate) throw new ApiError(403, "This is a private study group — ask the coordinator for an invite");

    const userId = requestUser._id.toString();
    if (group.coordinatorId.toString() === userId) throw new ApiError(409, "You are the coordinator of this group");
    
    const existingMember = group.groupMembers.find((m) => m.memberId.toString() === userId);
    if (existingMember) {
        if (existingMember.status === "pending") throw new ApiError(409, "Your join request is still pending approval");
        if (existingMember.status === "approved") throw new ApiError(409, "You are already a member of this study group");
        // If they were rejected, maybe allow them to request again? For now, blocked.
        if (existingMember.status === "rejected") throw new ApiError(403, "Your request to join was previously rejected");
    }

    if (group.memberCount >= group.maxMembers) throw new ApiError(409, "This study group is full");

    const newMemberStatus = group.requireJoinApproval ? "pending" : "approved";
    
    group.groupMembers.push({ 
        memberId: requestUser._id, 
        role: "member", 
        status: newMemberStatus,
        joinedAt: new Date() 
    });
    
    await group.save();

    // Only add to chat if approved immediately
    if (newMemberStatus === "approved" && group.chatId) {
        Chat.findByIdAndUpdate(group.chatId, {
            $push: { members: { userId: requestUser._id, role: "member", joinedAt: new Date() } }
        }).catch((err) => console.error("[StudyGroup] Failed to add member to chat:", err.message));
    }

    // Notify coordinator of pending request
    if (newMemberStatus === "pending") {
        systemEvents.emit("notification:create", {
            userId: group.coordinatorId,
            type: "studygroup_invite",
            title: "New Join Request",
            body: `${requestUser.profile?.displayName || "A user"} wants to join "${group.name || "your group"}".`,
            actorId: requestUser._id,
            ref: group._id,
            refModel: "StudyGroup",
            priority: "normal",
        });
    }

    return { 
        status: newMemberStatus,
        memberCount: group.memberCount 
    };
};

export const handleMembershipRequest = async (groupId, memberUserId, action, requestUser) => {
    const group = await findGroupById(groupId, "coordinatorId groupMembers memberCount chatId status");
    requireCoordinatorOrAdmin(group, requestUser);

    if (!["accept", "reject"].includes(action)) throw new ApiError(400, "Invalid action. Use 'accept' or 'reject'");

    const memberIndex = group.groupMembers.findIndex((m) => m.memberId.toString() === memberUserId.toString());
    if (memberIndex === -1) throw new ApiError(404, "Join request not found");

    const member = group.groupMembers[memberIndex];
    if (member.status !== "pending") throw new ApiError(400, `Cannot ${action} a member who is already ${member.status}`);

    if (action === "accept") {
        member.status = "approved";
        member.joinedAt = new Date();
        
        // Sync with Chat
        if (group.chatId) {
            await Chat.findByIdAndUpdate(group.chatId, {
                $push: { members: { userId: memberUserId, role: "member", joinedAt: new Date() } }
            }).catch((err) => console.error("[StudyGroup] Failed to sync member to chat on acceptance:", err.message));
        }
    } else {
        // If rejected, we can either remove them or set status to rejected. 
        // Removing them allows them to try again later if they want, or keeps the array clean.
        group.groupMembers.splice(memberIndex, 1);
    }

    await group.save();

    // Notify the member of the decision
    systemEvents.emit("notification:create", {
        userId: memberUserId,
        type: "studygroup_update",
        title: action === "accept" ? "🎉 Join Request Approved!" : "Join Request Not Approved",
        body: action === "accept"
            ? `You have been approved to join "${group.name || "a study group"}".`
            : `Your request to join "${group.name || "a study group"}" was not approved.`,
        actorId: requestUser._id,
        ref: group._id,
        refModel: "StudyGroup",
        priority: action === "accept" ? "high" : "normal",
    });

    return { status: action === "accept" ? "approved" : "rejected", action };
};

export const leaveStudyGroup = async (groupId, requestUser) => {
    const group = await findGroupById(groupId, "coordinatorId groupMembers memberCount chatId");

    const userId = requestUser._id.toString();
    if (group.coordinatorId.toString() === userId) {
        throw new ApiError(400, "You are the coordinator — transfer coordinator role or delete the group instead");
    }

    const memberIndex = group.groupMembers.findIndex((m) => m.memberId.toString() === userId);
    if (memberIndex === -1) throw new ApiError(404, "You are not a member of this study group");

    group.groupMembers.splice(memberIndex, 1);
    await group.save();

    if (group.chatId) {
        Chat.findByIdAndUpdate(group.chatId, { $pull: { members: { userId: requestUser._id } } })
            .catch((err) => console.error("[StudyGroup] Failed to remove member from chat:", err.message));
    }

    return true;
};

export const removeMember = async (groupId, memberId, requestUser) => {
    if (!mongoose.isValidObjectId(memberId)) throw new ApiError(400, "Invalid member ID format");

    const group = await findGroupById(groupId, "coordinatorId groupMembers memberCount chatId");
    requireCoordinatorOrAdmin(group, requestUser);

    if (group.coordinatorId.toString() === memberId) throw new ApiError(400, "Cannot remove the coordinator through this endpoint");

    const memberIndex = group.groupMembers.findIndex((m) => m.memberId.toString() === memberId);
    if (memberIndex === -1) throw new ApiError(404, "Member not found in this study group");

    group.groupMembers.splice(memberIndex, 1);
    await group.save();

    if (group.chatId) {
        Chat.findByIdAndUpdate(group.chatId, { $pull: { members: { userId: new mongoose.Types.ObjectId(memberId) } } })
            .catch((err) => console.error("[StudyGroup] Failed to remove member from chat:", err.message));
    }

    // Notify removed member
    systemEvents.emit("notification:create", {
        userId: memberId,
        type: "studygroup_update",
        title: "Removed from Study Group",
        body: `You have been removed from "${group.name || "a study group"}".`,
        actorId: requestUser._id,
        ref: group._id,
        refModel: "StudyGroup",
        priority: "normal",
    });

    return { removedMemberId: memberId };
};

export const updateMemberRole = async (groupId, memberId, data, requestUser) => {
    const { role } = data;
    if (!mongoose.isValidObjectId(memberId)) throw new ApiError(400, "Invalid member ID format");

    const validRoles = ["member", "coordinator"];
    if (!role || !validRoles.includes(role)) throw new ApiError(400, `Role must be one of: ${validRoles.join(", ")}`);

    const group = await findGroupById(groupId, "coordinatorId groupMembers");
    requireCoordinatorOrAdmin(group, requestUser);

    const member = group.groupMembers.find((m) => m.memberId.toString() === memberId);
    if (!member) throw new ApiError(404, "Member not found in this study group");
    if (member.role === role) throw new ApiError(400, `Member already has the role "${role}"`);

    member.role = role;
    await group.save();

    return { memberId, role };
};

export const addResource = async (groupId, data, file, requestUser) => {
    const { title } = data;
    const localPath = file?.path;
    if (!localPath) throw new ApiError(400, "File is required");

    const group = await findGroupById(groupId, "coordinatorId groupMembers status groupResources");
    requireActiveMember(group, requestUser._id);

    if (group.status !== "active") throw new ApiError(400, "Cannot add resources to an inactive group");

    const uploaded = await uploadFile(localPath);
    if (!uploaded?.secure_url) throw new ApiError(500, "File upload failed — please try again");

    const fileDoc = await File.create({
        userId: requestUser._id, fileName: file.originalname, fileUrl: uploaded.secure_url,
        publicId: uploaded.public_id, mimeType: file.mimetype, fileSize: file.size,
        context: "studygroup", contextId: group._id, description: title?.trim() || "", isPublic: false,
    });

    group.groupResources.push({
        fileId: fileDoc._id, title: title?.trim() || file.originalname, uploadedBy: requestUser._id, createdAt: new Date()
    });

    await group.save();

    const lastResource = group.groupResources[group.groupResources.length - 1];

    return {
        resource: lastResource,
        file: { _id: fileDoc._id, fileName: fileDoc.fileName, fileUrl: fileDoc.fileUrl, mimeType: fileDoc.mimeType, fileSize: fileDoc.fileSize }
    };
};

export const removeResource = async (groupId, resourceId, requestUser) => {
    if (!mongoose.isValidObjectId(resourceId)) throw new ApiError(400, "Invalid resource ID format");

    const group = await findGroupById(groupId, "coordinatorId groupMembers groupResources");
    const resourceIndex = group.groupResources.findIndex((r) => r._id.toString() === resourceId);
    if (resourceIndex === -1) throw new ApiError(404, "Resource not found in this study group");

    const resource = group.groupResources[resourceIndex];
    const userId = requestUser._id.toString();
    const isAdmin = requestUser.roles?.includes("admin");
    const isCoordinator = group.coordinatorId.toString() === userId;

    if (!isAdmin && !isCoordinator) {
        throw new ApiError(403, "Only the coordinator or an admin can remove this resource");
    }

    const fileDoc = await File.findById(resource.fileId).select("publicId");
    if (fileDoc?.publicId) {
        deleteFromCloudinary(fileDoc.publicId)
            .catch((err) => console.error("[StudyGroup] Failed to delete resource from Cloudinary:", err.message));
    }

    await File.findByIdAndDelete(resource.fileId);
    group.groupResources.splice(resourceIndex, 1);
    await group.save();

    return { resourceId };
};

export const getResources = async (groupId, requestUser) => {
    const group = await findGroupById(groupId, "coordinatorId groupMembers groupResources status");
    requireActiveMember(group, requestUser._id);

    await StudyGroup.populate(group.groupResources, [
        { path: "fileId", select: "fileName fileUrl mimeType fileSize createdAt", model: "File" },
        { path: "uploadedBy", select: "profile.displayName profile.avatar", model: "User" },
    ]);

    return group.groupResources;
};

export const updateSchedule = async (groupId, data, requestUser) => {
    const { schedule } = data;
    if (!Array.isArray(schedule)) throw new ApiError(400, "schedule must be an array of schedule slots");

    const group = await findGroupById(groupId, "coordinatorId status");
    requireCoordinatorOrAdmin(group, requestUser);

    if (group.status !== "active") throw new ApiError(400, "Cannot update schedule of an inactive group");

    for (const slot of schedule) {
        if (slot.day < 0 || slot.day > 6) throw new ApiError(400, "Schedule day must be between 0 (Sunday) and 6 (Saturday)");
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) throw new ApiError(400, "Schedule times must be in HH:mm format (e.g. 09:00)");
        if (slot.startTime >= slot.endTime) throw new ApiError(400, `startTime must be before endTime for day ${slot.day}`);
    }

    return await StudyGroup.findByIdAndUpdate(groupId, { $set: { schedule } }, { new: true, runValidators: true })
        .select("_id name schedule");
};
