/**
 * admin.socket.js
 *
 * Initialises a dedicated Socket.io namespace /admin for admin dashboard
 * real-time feeds. Completely isolated from the main namespace.
 *
 * Integration in server.js (after initializeSocket):
 *   import { initAdminSocket } from "./src/sockets/admin.socket.js";
 *   initAdminSocket(io);
 */

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const ADMIN_ROLES = ["super_admin", "campus_admin", "read_only_admin", "admin"];

/**
 * Initialise the /admin namespace and wire system event hooks.
 *
 * @param {import("socket.io").Server} io
 */
export const initAdminSocket = (io) => {
    const adminNs = io.of("/admin");

    // ── Auth middleware for namespace ──────────────────────────────────────
    adminNs.use(async (socket, next) => {
        try {
            let token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace("Bearer ", "");

            if (!token) {
                const cookieHeader = socket.handshake.headers?.cookie || "";
                const cookies = Object.fromEntries(
                    cookieHeader.split(";").map((c) => {
                        const [k, ...v] = c.trim().split("=");
                        return [k, v.join("=")];
                    })
                );
                token = cookies.accessToken;
            }

            if (!token) return next(new Error("Admin authentication required"));

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded._id).select("_id campusId roles profile.displayName status");

            if (!user || user.status !== "active") return next(new Error("User not found or inactive"));

            const hasAdminRole = ADMIN_ROLES.some((r) => user.roles?.includes(r));
            if (!hasAdminRole) return next(new Error("Admin access required"));

            socket.adminUser = user;
            next();
        } catch (err) {
            next(new Error("Invalid or expired admin token"));
        }
    });

    // ── Connection handlers ────────────────────────────────────────────────
    adminNs.on("connection", (socket) => {
        const user = socket.adminUser;

        // Campus-admins join their campus room for scoped events
        if (user.campusId) {
            socket.join(`campus:${user.campusId.toString()}`);
        }

        // All admins join the global admin room
        socket.join("global:admin");

        // Super admins also join a super-admin-only room
        if (user.roles?.includes("super_admin")) {
            socket.join("super_admin");
        }

        // Send current connection info back to the admin
        socket.emit("admin:connected", {
            userId: user._id,
            displayName: user.profile?.displayName,
            roles: user.roles,
            campusId: user.campusId,
        });

        socket.on("admin:ping", (cb) => {
            if (typeof cb === "function") cb({ pong: true, ts: Date.now() });
        });

        socket.on("disconnect", () => {
            // No-op — rooms auto-cleaned by socket.io
        });
    });

    console.info("[AdminSocket] /admin namespace initialized");
    return adminNs;
};

// ─── Emitter helpers (called by controllers + event handlers) ─────────────────

/**
 * Emit an event to all connected admins, optionally scoped to a campus.
 *
 * @param {import("socket.io").Server} io
 * @param {string} event          - socket event name
 * @param {Object} data           - payload
 * @param {string|null} campusId  - if provided, also emits to campus:campusId room
 */
export const emitToAdmins = (io, event, data, campusId = null) => {
    if (!io) return;
    const adminNs = io.of("/admin");

    // Always emit to global admin room (super_admins)
    adminNs.to("global:admin").emit(event, { ...data, _ts: Date.now() });

    // Also emit to campus-scoped room if relevant
    if (campusId) {
        adminNs.to(`campus:${campusId.toString()}`).emit(event, { ...data, _ts: Date.now() });
    }
};

/**
 * Emit only to super_admins (e.g. system-level events).
 */
export const emitToSuperAdmins = (io, event, data) => {
    if (!io) return;
    io.of("/admin").to("super_admin").emit(event, { ...data, _ts: Date.now() });
};

// ─── Hooks into existing systemEvents ────────────────────────────────────────

/**
 * Wire admin dashboard live-feed events into existing systemEvents emitter.
 * Call this in server.js after both initializeSocket and initAdminSocket.
 *
 * @param {import("socket.io").Server} io
 * @param {import("events").EventEmitter} systemEvents
 */
export const wireAdminFeedHooks = (io, systemEventsEmitter) => {
    if (!systemEventsEmitter) return;

    // New user registered (hook into existing notification:create or user service)
    systemEventsEmitter.on("admin:user_registered", (data) => {
        emitToAdmins(io, "admin:user_registered", data, data.campusId);
    });

    // New mentor application submitted
    systemEventsEmitter.on("admin:mentor_applied", (data) => {
        emitToAdmins(io, "admin:mentor_applied", data, data.campusId);
    });

    // New society created
    systemEventsEmitter.on("admin:society_created", (data) => {
        emitToAdmins(io, "admin:society_created", data, data.campusId);
    });

    // New event created
    systemEventsEmitter.on("admin:event_created", (data) => {
        emitToAdmins(io, "admin:event_created", data, data.campusId);
    });

    // New booking
    systemEventsEmitter.on("admin:booking_created", (data) => {
        emitToAdmins(io, "admin:booking_created", data, data.campusId);
    });

    console.info("[AdminSocket] Live-feed hooks wired to systemEvents");
};
