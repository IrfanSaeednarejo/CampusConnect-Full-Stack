/**
 * Reusable Mongoose pagination helper.
 *
 * Eliminates duplicated skip/limit/count logic across controllers.
 *
 * @param {import("mongoose").Model} Model   Mongoose model to query
 * @param {Object}  filter                   Mongoose filter object
 * @param {Object}  options
 * @param {number}  [options.page=1]         Current page (1-indexed)
 * @param {number}  [options.limit=20]       Documents per page (max 100)
 * @param {string}  [options.select]         Space-delimited field projection
 * @param {string|Object} [options.sort]     Mongoose sort expression
 * @param {Array}   [options.populate]       Array of populate specs
 * @param {boolean} [options.lean=true]      Return plain JS objects
 *
 * @returns {Promise<{
 *   docs: Array,
 *   pagination: { total: number, page: number, pages: number, limit: number }
 * }>}
 *
 * @example
 *   const result = await paginate(User, { campusId, status: "active" }, {
 *       page: req.query.page,
 *       limit: req.query.limit,
 *       select: "profile.displayName profile.avatar roles",
 *       sort: { createdAt: -1 },
 *       populate: [{ path: "campusId", select: "name slug" }],
 *   });
 *   res.json(new ApiResponse(200, result, "Users fetched"));
 */
const paginate = async (Model, filter = {}, options = {}) => {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
    const skip = (page - 1) * limit;

    let query = Model.find(filter);

    if (options.select) query = query.select(options.select);
    if (options.sort) query = query.sort(options.sort);
    if (options.lean !== false) query = query.lean();

    if (options.populate) {
        const pops = Array.isArray(options.populate)
            ? options.populate
            : [options.populate];
        pops.forEach((p) => {
            query = query.populate(p);
        });
    }

    const [docs, total] = await Promise.all([
        query.skip(skip).limit(limit),
        Model.countDocuments(filter),
    ]);

    return {
        docs,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit) || 1,
            limit,
        },
    };
};

export { paginate };
