import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "../server/src/config/db.js";
import { app } from "./app.js";
import { initializeSocket } from "./src/sockets/index.js";
import { startEventTransitionJob } from "./src/jobs/eventTransitions.job.js";
import { startTaskReminderJob } from "./src/jobs/taskReminder.job.js";
import { initNotificationService } from "./src/services/notification.service.js";
import { initMentoringHandlers } from "./src/eventHandlers/mentoring.handler.js";
import { initChatHandlers } from "./src/eventHandlers/chat.handler.js";
import { initNexusHandlers } from "./src/eventHandlers/nexus.handler.js";
import { initAdminSocket, wireAdminFeedHooks } from "./src/sockets/admin.socket.js";
import { systemEvents } from "./src/utils/events.js";

dotenv.config({
    path: ".env",
});

connectDB()
    .then(async () => {
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        const httpServer = createServer(app);

        const io = initializeSocket(httpServer);
        app.set("io", io);

        // Dedicated /admin namespace
        initAdminSocket(io);
        wireAdminFeedHooks(io, systemEvents);

        initNotificationService(app);
        initMentoringHandlers(app);
        initChatHandlers(app);
        initNexusHandlers(app);
        startEventTransitionJob(app);
        startTaskReminderJob();

        httpServer.listen(process.env.PORT || 8000, () => {
            console.log(` Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!!", err);
    });
