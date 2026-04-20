import mongoose, { Schema } from "mongoose";

// ─── Action constants ─────────────────────────────────────────────────────────

export const ADMIN_ACTIONS = {
    // Users
    USER_SUSPENDED:          "USER_SUSPENDED",
    USER_REACTIVATED:        "USER_REACTIVATED",
    USER_BANNED:             "USER_BANNED",
    USER_FORCE_LOGGED_OUT:   "USER_FORCE_LOGGED_OUT",
    USER_ROLE_CHANGED:       "USER_ROLE_CHANGED",
    USER_DELETED:            "USER_DELETED",
    USER_BULK_SUSPENDED:     "USER_BULK_SUSPENDED",

    // Mentors
    MENTOR_APPROVED:         "MENTOR_APPROVED",
    MENTOR_REJECTED:         "MENTOR_REJECTED",
    MENTOR_SUSPENDED:        "MENTOR_SUSPENDED",
    MENTOR_TIER_OVERRIDDEN:  "MENTOR_TIER_OVERRIDDEN",

    // Societies
    SOCIETY_CREATED:         "SOCIETY_CREATED",
    SOCIETY_APPROVED:        "SOCIETY_APPROVED",
    SOCIETY_REJECTED:        "SOCIETY_REJECTED",
    SOCIETY_FROZEN:          "SOCIETY_FROZEN",
    SOCIETY_DELETED:         "SOCIETY_DELETED",
    SOCIETY_HEAD_REASSIGNED: "SOCIETY_HEAD_REASSIGNED",

    // Events
    EVENT_CANCELLED:         "EVENT_CANCELLED",
    EVENT_FORCE_CLOSED:      "EVENT_FORCE_CLOSED",
    EVENT_STATUS_CHANGED:    "EVENT_STATUS_CHANGED",

    // Study Groups
    STUDYGROUP_CREATED:      "STUDYGROUP_CREATED",
    STUDYGROUP_DELETED:      "STUDYGROUP_DELETED",
    STUDYGROUP_ARCHIVED:     "STUDYGROUP_ARCHIVED",

    // Notifications
    NOTIFICATION_BROADCAST:  "NOTIFICATION_BROADCAST",
    NOTIFICATION_TARGETED:   "NOTIFICATION_TARGETED",

    // Campus
    CAMPUS_CREATED:          "CAMPUS_CREATED",
    CAMPUS_STATUS_CHANGED:   "CAMPUS_STATUS_CHANGED",
    CAMPUS_ADMIN_ASSIGNED:   "CAMPUS_ADMIN_ASSIGNED",

    // System
    SYSTEM_MAINTENANCE_TOGGLED: "SYSTEM_MAINTENANCE_TOGGLED",
    FEATURE_FLAG_CHANGED:    "FEATURE_FLAG_CHANGED",
    ADMIN_LOGIN:             "ADMIN_LOGIN",
    ADMIN_ELEVATED:          "ADMIN_ELEVATED",
};

const ALL_ACTIONS = Object.values(ADMIN_ACTIONS);

// ─── Schema ───────────────────────────────────────────────────────────────────

const adminAuditLogSchema = new Schema(
    {
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Admin ID is required"]
        },

        /** Snapshot of the admin's role at the time of action. */
        adminRole: {
            type: String,
            required: true,
            enum: ["super_admin", "campus_admin", "read_only_admin", "admin"],
        },

        action: {
            type: String,
            required: [true, "Action is required"],
            enum: { values: ALL_ACTIONS, message: "{VALUE} is not a valid admin action" },
        },

        targetModel: {
            type: String,
            enum: ["User", "Campus", "Society", "Event", "Mentor", "Chat", "StudyGroup", "MentorBooking", "Notification"],
        },

        targetId: {
            type: Schema.Types.ObjectId,
        },

        /**
         * Flexible payload for:
         *   - before/after snapshots:   { before: { status: "active" }, after: { status: "suspended" } }
         *   - reason strings:           { reason: "..." }
         *   - bulk results:             { succeeded: 12, failed: 2 }
         *   - notification details:     { title, body, recipientCount }
         */
        payload: {
            type: Schema.Types.Mixed,
            default: {},
        },

        ipAddress: {
            type: String,
            trim: true,
        },

        userAgent: {
            type: String,
            trim: true,
        },

        /** Which campus this action was scoped to (campus_admin actions). */
        campusId: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1, createdAt: -1 });
adminAuditLogSchema.index({ targetModel: 1, targetId: 1 });
adminAuditLogSchema.index({ campusId: 1, createdAt: -1 });

// TTL: auto-delete after 90 days
adminAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AdminAuditLog = mongoose.model("AdminAuditLog", adminAuditLogSchema);
