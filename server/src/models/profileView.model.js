import mongoose, { Schema } from "mongoose";

/**
 * ProfileView — tracks who visited a user's profile.
 *
 * Key constraints:
 *  - One document per (profileOwner, viewer) pair, upserted each visit.
 *  - Notification is rate-limited: only one per pair per 24h (handled in service layer).
 *  - Auto-expires after 6 months to keep the collection lean.
 */
const profileViewSchema = new Schema(
    {
        profileOwner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        viewer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Last time this viewer viewed the owner's profile
        viewedAt: {
            type: Date,
            default: Date.now,
        },
        // Last time a notification was dispatched for this pair
        lastNotifiedAt: {
            type: Date,
            default: null,
        },
        // Total view count from this viewer to this owner
        viewCount: {
            type: Number,
            default: 1,
            min: 1,
        },
    },
    {
        timestamps: false,
        versionKey: false,
    }
);

// Unique compound index — one record per viewer-owner pair
profileViewSchema.index({ profileOwner: 1, viewer: 1 }, { unique: true });

// Secondary index for "who viewed my profile" queries (latest first)
profileViewSchema.index({ profileOwner: 1, viewedAt: -1 });

// Auto-expire after 6 months of no activity
profileViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 6 * 30 * 24 * 60 * 60 });

export const ProfileView = mongoose.model("ProfileView", profileViewSchema);
