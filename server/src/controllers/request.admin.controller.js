import { asyncHandler as ah } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Mentor } from "../models/mentor.model.js";
import { Society } from "../models/society.model.js";
import { Event } from "../models/event.model.js";
import { StudyGroup } from "../models/studyGroup.model.js";
import { scopeQuery } from "../middlewares/adminAuth.middleware.js";

export const getUnifiedRequests = ah(async (req, res) => {
    const { type = "all" } = req.query;

    const baseFilter = scopeQuery(req, {});
    
    const results = {};

    if (type === "all" || type === "mentors") {
        results.mentors = await Mentor.find({ ...baseFilter, verified: false })
            .populate("userId", "profile.displayName profile.avatar email")
            .sort({ createdAt: -1 });
    }

    if (type === "all" || type === "societies") {
        results.societies = await Society.find({ ...baseFilter, status: "pending" })
            .populate("createdBy", "profile.displayName profile.avatar")
            .sort({ createdAt: -1 });
    }

    if (type === "all" || type === "events") {
        results.events = await Event.find({ ...baseFilter, status: "pending" })
            .populate("createdBy", "profile.displayName profile.avatar")
            .populate("societyId", "name tag")
            .sort({ createdAt: -1 });
    }

    if (type === "all" || type === "study_groups") {
        results.studyGroups = await StudyGroup.find({ ...baseFilter, status: "pending" })
            .populate("coordinatorId", "profile.displayName profile.avatar")
            .sort({ createdAt: -1 });
    }

    // Flatten for a unified feed if type is "all"
    let unified = [];
    if (type === "all") {
        unified = [
            ...(results.mentors || []).map(m => ({ ...m.toObject(), requestType: "mentor" })),
            ...(results.societies || []).map(s => ({ ...s.toObject(), requestType: "society" })),
            ...(results.events || []).map(e => ({ ...e.toObject(), requestType: "event" })),
            ...(results.studyGroups || []).map(g => ({ ...g.toObject(), requestType: "study_group" })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json(new ApiResponse(200, type === "all" ? unified : results, "Requests fetched"));
});
