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
