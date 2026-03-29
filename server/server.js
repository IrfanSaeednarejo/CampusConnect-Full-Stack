import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "../server/src/config/db.js";
import { app } from "./app.js";
import { initializeSocket } from "./src/sockets/index.js";
import { startEventTransitionJob } from "./src/jobs/eventTransitions.job.js";

dotenv.config({
    path: ".env",
});

connectDB()
    .then(async () => {
        // Auto-verify any existing unverified mentors (one-time migration)
        try {
            const { Mentor } = await import("./src/models/mentor.model.js");
            const result = await Mentor.updateMany({ verified: false }, { $set: { verified: true } });
            if (result.modifiedCount > 0) {
                console.log(`[Migration] Auto-verified ${result.modifiedCount} mentor(s)`);
            }
        } catch (e) {
            console.warn("[Migration] Mentor auto-verify skipped:", e.message);
        }
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        const httpServer = createServer(app);

        const io = initializeSocket(httpServer);
        app.set("io", io);

        const { initNotificationService } = await import("./src/services/notification.service.js");
        initNotificationService(app);
        
        try {
            startEventTransitionJob(app);
        } catch (jobErr) {
            console.warn("Event transition job failed to start:", jobErr.message);
        }

        httpServer.listen(process.env.PORT || 8000, () => {
            console.log(` Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!!", err);
    });
