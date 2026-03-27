import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./src/middlewares/errorHandler.middleware.js";
import { ApiError } from "./src/utils/ApiError.js";

const app = express();

app.use(
    cors({
        origin: [
            "https://Campus-Connect.vercel.app",
            "http://localhost:5173",
        ],
        credentials: true,
    })
);

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./src/routes/user.routes.js";
import campusRouter from "./src/routes/campus.routes.js";
import societyRouter from "./src/routes/society.routes.js";
import chatRouter from "./src/routes/chat.routes.js";
import studyGroupRouter from "./src/routes/studyGroup.routes.js";
import competitionRouter from "./src/routes/eventEngine.routes.js";
import mentorRouter from "./src/routes/mentor.routes.js";
import fileRouter from "./src/routes/file.routes.js";
import notificationRouter from "./src/routes/notification.routes.js";

app.get("/", (_req, res) => res.json({ status: "ok", service: "CampusConnect API" }));
app.get("/api/v1", (_req, res) => res.json({ status: "ok", version: "1.0.0" }));


app.use("/api/v1/users", userRouter);
app.use("/api/v1/campuses", campusRouter);
app.use("/api/v1/societies", societyRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/study-groups", studyGroupRouter);
app.use("/api/v1/competitions", competitionRouter);
app.use("/api/v1/mentors", mentorRouter);
app.use("/api/v1/files", fileRouter);
app.use("/api/v1/notifications", notificationRouter);

app.use((err, _req, _res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return next(new ApiError(400, "Malformed JSON in request body"));
    }
    next(err);
});

app.use((_req, _res, next) => {
    next(new ApiError(404, "Route not found"));
});

app.use(errorHandler);

export { app };