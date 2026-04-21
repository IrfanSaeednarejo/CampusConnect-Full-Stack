import { ApiError } from "../utils/ApiError.js";

/**
 * Admin role tiers (highest to lowest):
 *   super_admin      — platform-wide, unrestricted
 *   campus_admin     — scoped to their own campus
 *   read_only_admin  — analytics + audit view only
 *   admin            — legacy role, treated as campus_admin
 */

const ADMIN_ROLES = ["super_admin", "campus_admin", "read_only_admin", "admin"];
const SUPER_ADMIN = "super_admin";
const CAMPUS_ADMIN = "campus_admin";
const READ_ONLY = "read_only_admin";
const LEGACY_ADMIN = "admin";

const hasRole = (userRoles = [], ...roles) =>
    roles.some((r) => userRoles.includes(r));

// ─── requireSuperAdmin ────────────────────────────────────────────────────────

/**
 * Restricts to super_admin only.
 */
export const requireSuperAdmin = (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));

    if (!req.user.roles?.includes(SUPER_ADMIN)) {
        return next(new ApiError(403, "Super-admin access required"));
    }
    next();
};

// ─── requireCampusAdmin ───────────────────────────────────────────────────────

/**
 * Requires super_admin OR campus_admin scoped to the target campus.
 *
 * Campus resolution order:
 *   1. req.params[campusIdParam]  (e.g. /admin/users?campusId=xxx)
 *   2. req.query.campusId
 *   3. req.body.campusId
 *
 * @param {string} campusIdParam  - param name to check (default "campusId")
 */
export const requireCampusAdmin = (campusIdParam = "campusId") => {
    return (req, _res, next) => {
        if (!req.user) return next(new ApiError(401, "Authentication required"));

        const roles = req.user.roles || [];

        // Super-admin passes unconditionally
        if (roles.includes(SUPER_ADMIN)) return next();

        // campus_admin or legacy admin must match campus
        if (hasRole(roles, CAMPUS_ADMIN, LEGACY_ADMIN)) {
            const targetCampusId =
                req.params[campusIdParam] ||
                req.query[campusIdParam] ||
                req.body[campusIdParam];

            // If no campus param provided, allow (will be auto-scoped by scopeQuery)
            if (!targetCampusId) return next();

            const userCampus = req.user.campusId?.toString();
            if (userCampus && userCampus !== targetCampusId.toString()) {
                return next(new ApiError(403, "You can only manage your own campus"));
            }
            return next();
        }

        return next(new ApiError(403, "Campus admin access required"));
    };
};

// ─── requireAnyAdmin ─────────────────────────────────────────────────────────

/**
 * Allows any admin tier (including read_only).
 * Use this as the base guard on all admin routes, then apply stricter
 * guards at individual endpoints.
 */
export const requireAnyAdmin = (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));

    if (!hasRole(req.user.roles || [], ...ADMIN_ROLES)) {
        return next(new ApiError(403, "Admin access required"));
    }
    next();
};

// ─── requireWriteAdmin ───────────────────────────────────────────────────────

/**
 * Blocks read_only_admin from write operations.
 * Use on POST/PATCH/DELETE endpoints that campus_admin can also access.
 */
export const requireWriteAdmin = (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));
    const { roles, permissions } = req.user;
    if (hasRole(roles, SUPER_ADMIN, CAMPUS_ADMIN, LEGACY_ADMIN) || permissions?.write) {
        return next();
    }
    return next(new ApiError(403, "permission error", ["User lacks write permission"]));
};

// ─── scopeQuery ───────────────────────────────────────────────────────────────

/**
 * Merges campus scoping into a MongoDB filter object based on the
 * requesting admin's role.
 *
 * - super_admin        → returns baseFilter unchanged (sees all campuses)
 * - campus_admin       → merges { campusId: req.user.campusId }
 * - read_only_admin    → merges { campusId: req.user.campusId }
 * - admin (legacy)     → merges { campusId: req.user.campusId } if set, else unchanged
 *
 * If the caller also passes an explicit campusId override (super_admin selecting
 * a campus from the top-bar dropdown), that takes precedence.
 *
 * @param {import("express").Request} req
 * @param {Object} baseFilter
 * @returns {Object}
 */
export const scopeQuery = (req, baseFilter = {}) => {
    const roles = req.user?.roles || [];
    const isSuperAdmin = roles.includes(SUPER_ADMIN);

    // Super-admin with explicit campus filter from query param
    const overrideCampusId = req.query?.campusId || req.body?.campusId;
    if (isSuperAdmin) {
        if (overrideCampusId) {
            return { ...baseFilter, campusId: overrideCampusId };
        }
        return baseFilter; // unrestricted
    }

    // All other admin roles: scope to their own campus
    const userCampusId = req.user?.campusId;
    if (userCampusId) {
        return { ...baseFilter, campusId: userCampusId };
    }

    return baseFilter;
};

/**
 * Convenience: determine the effective campusId for this request.
 * Returns null if super_admin with no campus filter (meaning "all campuses").
 */
export const getEffectiveCampusId = (req) => {
    const roles = req.user?.roles || [];
    if (roles.includes(SUPER_ADMIN)) {
        return req.query.campusId || null;
    }
    return req.user?.campusId || null;
};

