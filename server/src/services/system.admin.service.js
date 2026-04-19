import mongoose from "mongoose";
import os from "os";
import { AdminAuditLog, ADMIN_ACTIONS } from "../models/adminAuditLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { writeAuditLog } from "../utils/auditLog.js";
import { setMaintenanceMode, getMaintenanceMode } from "../middlewares/maintenance.middleware.js";
import { emitEvent } from "../utils/eventBus.js";

// ─── State ────────────────────────────────────────────────────────────────────

const featureFlags = {
    chatEnabled: true,
    eventsEnabled: true,
    mentorMarketplaceEnabled: true,
    newRegistrationsEnabled: true,
    studyGroupsEnabled: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatUptime = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const getSystemHealth = async (ioExpress) => {
    const socketCount = ioExpress ? ioExpress.engine?.clientsCount || 0 : 0;

    const dbState = mongoose.connection.readyState;
    const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" }[dbState] || "unknown";

    const memTotal = os.totalmem();
    const memFree = os.freemem();
    const memUsedPercent = parseFloat(((1 - memFree / memTotal) * 100).toFixed(1));

    const uptimeSeconds = process.uptime();

    const oneHourAgo = new Date(Date.now() - 3600000);
    const recentErrorActions = [ADMIN_ACTIONS.EVENT_FORCE_CLOSED, ADMIN_ACTIONS.SYSTEM_MAINTENANCE_TOGGLED];
    const errorCount = await AdminAuditLog.countDocuments({
        action: { $in: recentErrorActions },
        createdAt: { $gte: oneHourAgo },
    });

    const health = {
        db: { status: dbStatus, latencyMs: null },
        socketConnections: socketCount,
        memory: {
            totalMB: Math.round(memTotal / 1024 / 1024),
            usedPercent: memUsedPercent,
        },
        uptime: {
            seconds: Math.round(uptimeSeconds),
            formatted: formatUptime(uptimeSeconds),
        },
        maintenanceMode: getMaintenanceMode(),
        errorCountLastHour: errorCount,
        status: dbStatus === "connected" ? (memUsedPercent > 90 ? "degraded" : "healthy") : "unhealthy",
    };

    try {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        health.db.latencyMs = Date.now() - start;
    } catch {
        health.db.latencyMs = null;
    }

    return health;
};

export const getFeatureFlags = async () => {
    return featureFlags;
};

export const toggleFeatureFlag = async (flag, enabled, adminUser, req) => {
    if (!(flag in featureFlags)) {
        throw new ApiError(400, `Unknown flag: "${flag}". Valid flags: ${Object.keys(featureFlags).join(", ")}`);
    }

    const previousValue = featureFlags[flag];
    featureFlags[flag] = enabled;

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.FEATURE_FLAG_CHANGED,
        payload: { flag, before: previousValue, after: enabled },
    });

    await emitEvent(ADMIN_ACTIONS.FEATURE_FLAG_CHANGED + "@v1", {
        actorId: adminUser._id,
        payload: { flag, enabled }
    });

    return featureFlags;
};

export const toggleMaintenance = async (enabled, adminUser, req, ioExpress) => {
    const wasPreviouslyEnabled = getMaintenanceMode();

    if (wasPreviouslyEnabled === enabled) {
        throw new ApiError(400, `Maintenance mode is already ${enabled ? "ON" : "OFF"}`);
    }

    setMaintenanceMode(enabled);

    await writeAuditLog({
        req,
        action: ADMIN_ACTIONS.SYSTEM_MAINTENANCE_TOGGLED,
        payload: { before: wasPreviouslyEnabled, after: enabled },
    });

    if (ioExpress) {
        ioExpress.of("/admin").emit("admin:maintenance_toggled", { enabled, toggledBy: adminUser._id, at: new Date() });
    }

    await emitEvent(ADMIN_ACTIONS.SYSTEM_MAINTENANCE_TOGGLED + "@v1", {
        actorId: adminUser._id,
        payload: { enabled }
    });

    return { maintenanceMode: enabled };
};
