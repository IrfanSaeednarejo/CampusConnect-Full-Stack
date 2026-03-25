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
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        const httpServer = createServer(app);

        const io = initializeSocket(httpServer);
        app.set("io", io);

        const { initNotificationService } = await import("./src/services/notification.service.js");
        initNotificationService(app);
        startEventTransitionJob(app);

        httpServer.listen(process.env.PORT || 8000, () => {
            console.log(` Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!!", err);
    });
