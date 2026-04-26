import mongoose from "mongoose";
import { Report } from "../models/report.model.js";
import { ApiError } from "../utils/ApiError.js";
import { paginate } from "../utils/paginate.js";
import { writeAuditLog } from "../utils/auditLog.js";

export const listReports = async (filter, options) => {
    return await paginate(Report, filter, {
        page: options.page,
        limit: options.limit,
        sort: { createdAt: -1 },
        populate: [
            { path: "reporterId", select: "profile.displayName email" },
        ],
    });
};

export const resolveReport = async (reportId, status, adminNotes, adminUser, req) => {
    if (!mongoose.isValidObjectId(reportId)) throw new ApiError(400, "Invalid report ID");

    const VALID_STATUSES = ["reviewed", "dismissed", "resolved"];
    if (!VALID_STATUSES.includes(status)) {
        throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const report = await Report.findById(reportId);
    if (!report) throw new ApiError(404, "Report not found");

    report.status = status;
    if (adminNotes !== undefined) {
        report.adminNotes = adminNotes;
    }
    report.resolvedBy = adminUser._id;
    report.resolvedAt = new Date();

    await report.save();

    await writeAuditLog({
        req,
        action: "REPORT_RESOLVED",
        targetModel: "Report",
        targetId: report._id,
        payload: { status, adminNotes },
    });

    return report;
};
