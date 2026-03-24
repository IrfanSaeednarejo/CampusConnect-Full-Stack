import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/**
 * Express middleware that collects validation errors produced by
 * express-validator check chains and throws ApiError(400) if any exist.
 *
 * Usage in routes:
 *   import { body, param } from "express-validator";
 *   import { validate } from "../middlewares/validate.middleware.js";
 *
 *   router.post(
 *       "/",
 *       [
 *           body("title").trim().notEmpty().withMessage("Title is required"),
 *           body("startAt").isISO8601().withMessage("startAt must be a valid date"),
 *       ],
 *       validate,
 *       createEvent
 *   );
 *
 * Validation chains run first (as an array of middleware), then `validate`
 * aggregates any errors and either calls `next()` or throws.
 */
const validate = (req, _res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
    }));

    throw new ApiError(
        400,
        "Validation failed",
        extractedErrors
    );
};

export { validate };
