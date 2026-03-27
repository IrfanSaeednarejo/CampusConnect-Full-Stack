import { ApiError } from "../utils/ApiError.js";

/**
 * Role-based authorization middleware factory.
 *
 * Usage in routes:
 *   router.post("/", verifyJWT, authorize("admin"), createCampus);
 *   router.post("/", verifyJWT, authorize("admin", "society_head"), createEvent);
 *
 * Must be placed AFTER verifyJWT so that `req.user` is populated.
 *
 * @param  {...string} allowedRoles  One or more role strings the user must have.
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Authentication required"));
        }

        const userRoles = req.user.roles || [];
        const hasRole = allowedRoles.some((role) => userRoles.includes(role));

        if (!hasRole) {
            return next(
                new ApiError(
                    403,
                    `Access denied — requires one of: ${allowedRoles.join(", ")}`
                )
            );
        }

        next();
    };
};

/**
 * Verifies the requesting user is the owner of a given resource,
 * OR holds one of the allowed override roles (e.g. "admin").
 *
 * Usage:
 *   authorizeOwnerOrRoles(req.params.userId, "admin")
 *
 * Returns `true` if authorized, throws ApiError(403) otherwise.
 *
 * @param {import("express").Request} req
 * @param {string|import("mongoose").Types.ObjectId} ownerId
 * @param  {...string} overrideRoles
 */
const authorizeOwnerOrRoles = (req, ownerId, ...overrideRoles) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    const isSelf = req.user._id.toString() === ownerId?.toString();
    const hasOverrideRole = overrideRoles.some((r) =>
        (req.user.roles || []).includes(r)
    );

    if (!isSelf && !hasOverrideRole) {
        throw new ApiError(403, "You do not have permission to perform this action");
    }

    return true;
};

export { authorize, authorizeOwnerOrRoles };
