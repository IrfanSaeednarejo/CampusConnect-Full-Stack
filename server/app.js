import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./src/middlewares/errorHandler.middleware.js";

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
// import mentorRouter    from "./src/routes/mentor.routes.js";
// import eventRouter     from "./src/routes/event.routes.js";
// import noteRouter      from "./src/routes/note.routes.js";
// import fileRouter      from "./src/routes/file.routes.js";
// import notificationRouter from "./src/routes/notification.routes.js";
// import dashboardRouter from "./src/routes/dashboard.routes.js";
// import contactRouter   from "./src/routes/contact.routes.js";
// import paymentRouter   from "./src/routes/payment.routes.js";
// import analyticsRouter from "./src/routes/analytics.routes.js";
// import aiRoute         from "./src/routes/ai.routes.js";

app.get("/", (_req, res) => res.send("Campus Connect API is running"));
app.get("/api/v1", (_req, res) => res.send("Backend of Campus Connect"));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/campuses", campusRouter);
app.use("/api/v1/societies", societyRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/study-groups", studyGroupRouter);
// app.use("/api/v1/mentors",      mentorRouter);
// app.use("/api/v1/events",       eventRouter);
// app.use("/api/v1/notes",        noteRouter);
// app.use("/api/v1/files",        fileRouter);
// app.use("/api/v1/notifications",notificationRouter);
// app.use("/api/v1/dashboard",    dashboardRouter);
// app.use("/api/v1/contact-us",   contactRouter);
// app.use("/api/v1/payments",     paymentRouter);
// app.use("/api/v1/analytics",    analyticsRouter);
// app.use("/api/v1/ai",           aiRoute);

// ─── Global Error Handler (must be LAST middleware) ─────────────────────────
app.use(errorHandler);

export { app };