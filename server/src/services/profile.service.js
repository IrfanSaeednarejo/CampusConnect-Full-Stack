import { User }        from "../models/user.model.js";
import { ProfileView } from "../models/profileView.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { v2 as cloudinary } from "cloudinary";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely find a subdocument entry by id, throwing 404 if not found. */
const findEntry = (arr, id, label) => {
    const entry = arr?.id(id);
    if (!entry) throw new ApiError(404, `${label} entry not found`);
    return entry;
};

/** Upload up to 3 images to Cloudinary, returning { urls, publicIds }. */
export const uploadProjectImages = async (files = []) => {
    const results = await Promise.all(
        files.map((f) =>
            cloudinary.uploader.upload(f.path, {
                folder: "campusconnect/projects",
                transformation: [{ width: 1200, crop: "limit" }, { quality: "auto" }],
            })
        )
    );
    return {
        urls:      results.map((r) => r.secure_url),
        publicIds: results.map((r) => r.public_id),
    };
};

/** Delete Cloudinary images by publicId array. */
export const deleteCloudinaryImages = async (publicIds = []) => {
    await Promise.all(
        publicIds.filter(Boolean).map((id) => cloudinary.uploader.destroy(id))
    );
};

// ─── Profile View Tracking ────────────────────────────────────────────────────

const NOTIFY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Record a profile visit from viewer → profileOwner.
 * Upserts the ProfileView doc, increments profileViews counter on User,
 * and sends a notification if the cooldown has expired.
 */
export const recordProfileView = async (profileOwnerId, viewerId) => {
    // Never track self-views
    if (profileOwnerId.toString() === viewerId.toString()) return;

    const now = new Date();

    const view = await ProfileView.findOneAndUpdate(
        { profileOwner: profileOwnerId, viewer: viewerId },
        {
            $set:  { viewedAt: now },
            $inc:  { viewCount: 1 },
            $setOnInsert: { lastNotifiedAt: null },
        },
        { upsert: true, new: true }
    );

    // Increment the summary counter on User (fire-and-forget)
    User.findByIdAndUpdate(profileOwnerId, { $inc: { profileViews: 1 } }).exec();

    // Decide whether to send a notification
    const shouldNotify =
        !view.lastNotifiedAt ||
        now - new Date(view.lastNotifiedAt) > NOTIFY_COOLDOWN_MS;

    if (shouldNotify) {
        const viewer = await User.findById(viewerId).select("profile.displayName profile.avatar").lean();
        if (viewer) {
            await Notification.create({
                userId:   profileOwnerId,
                type:     "profile_view",
                title:    "Someone viewed your profile",
                body:     `${viewer.profile?.displayName || "A user"} visited your profile.`,
                actorId:  viewerId,
                ref:      view._id,
                refModel: "ProfileView",
                priority: "low",
            });

            // Mark notification sent
            await ProfileView.findByIdAndUpdate(view._id, { $set: { lastNotifiedAt: now } });
        }
    }
};

/**
 * Get a paginated list of recent profile visitors.
 * @returns { docs, total }
 */
export const getProfileVisitors = async (profileOwnerId, { page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
        ProfileView.find({ profileOwner: profileOwnerId })
            .sort({ viewedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("viewer", "profile.displayName profile.avatar profile.headline _id"),
        ProfileView.countDocuments({ profileOwner: profileOwnerId }),
    ]);
    return { docs, total, page, pages: Math.ceil(total / limit) };
};

// ─── Experience CRUD ──────────────────────────────────────────────────────────

export const addExperience = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    user.experience.push(data);
    await user.save();
    return user.experience[user.experience.length - 1];
};

export const updateExperience = async (userId, entryId, data) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const entry = findEntry(user.experience, entryId, "Experience");
    Object.assign(entry, data);
    await user.save();
    return entry;
};

export const deleteExperience = async (userId, entryId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    findEntry(user.experience, entryId, "Experience");
    user.experience.pull(entryId);
    await user.save();
};

// ─── Project CRUD ─────────────────────────────────────────────────────────────

export const addProject = async (userId, data, files = []) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    if (user.projects.length >= 20) throw new ApiError(400, "Maximum 20 projects allowed");

    let imageData = { urls: [], publicIds: [] };
    if (files.length > 0) {
        imageData = await uploadProjectImages(files);
    }

    user.projects.push({
        ...data,
        images:         imageData.urls,
        imagePublicIds: imageData.publicIds,
    });
    await user.save();
    return user.projects[user.projects.length - 1];
};

export const updateProject = async (userId, projectId, data, files = []) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const project = findEntry(user.projects, projectId, "Project");

    // If new images are uploaded, delete old Cloudinary images first
    if (files.length > 0) {
        await deleteCloudinaryImages(project.imagePublicIds);
        const imageData = await uploadProjectImages(files);
        data.images         = imageData.urls;
        data.imagePublicIds = imageData.publicIds;
    }

    Object.assign(project, data);
    await user.save();
    return project;
};

export const deleteProject = async (userId, projectId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const project = findEntry(user.projects, projectId, "Project");
    await deleteCloudinaryImages(project.imagePublicIds);
    user.projects.pull(projectId);
    await user.save();
};

// ─── Event Participation CRUD ─────────────────────────────────────────────────

export const addEventParticipation = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    user.eventParticipation.push(data);
    await user.save();
    return user.eventParticipation[user.eventParticipation.length - 1];
};

export const updateEventParticipation = async (userId, entryId, data) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const entry = findEntry(user.eventParticipation, entryId, "Event participation");
    Object.assign(entry, data);
    await user.save();
    return entry;
};

export const deleteEventParticipation = async (userId, entryId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    findEntry(user.eventParticipation, entryId, "Event participation");
    user.eventParticipation.pull(entryId);
    await user.save();
};

// ─── Achievement Sync (called by event scoring pipeline) ──────────────────────

/**
 * Push a platform-awarded achievement badge to a user.
 * Idempotent by (userId, type, sourceId) — won't duplicate.
 */
export const awardAchievement = async (userId, { type, label, icon, sourceId }) => {
    const exists = await User.findOne({
        _id: userId,
        "achievements.type":     type,
        "achievements.sourceId": sourceId,
    });
    if (exists) return; // already awarded

    await User.findByIdAndUpdate(userId, {
        $push: {
            achievements: { type, label, icon: icon || "emoji_events", sourceId, awardedAt: new Date() },
        },
    });
};
