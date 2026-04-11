require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");
const { User } = require("./src/models/user.model.js");

const MONGODB_URI = process.env.MONGODB_URI;

console.log("Connecting to MongoDB...");
mongoose
    .connect(MONGODB_URI)
    .then(async () => {
        console.log("✅ Successfully connected to MongoDB.");

        try {
            // Find how many users currently have incomplete onboarding
            const incompleteCount = await User.countDocuments({
                $or: [
                    { "onboarding.isComplete": false },
                    { "onboarding.isComplete": { $exists: false } }
                ]
            });

            console.log(`Found ${incompleteCount} users with incomplete onboarding.`);

            if (incompleteCount > 0) {
                // Update all users who haven't completed onboarding
                const result = await User.updateMany(
                    {
                        $or: [
                            { "onboarding.isComplete": false },
                            { "onboarding.isComplete": { $exists: false } }
                        ]
                    },
                    {
                        $set: {
                            "onboarding.isComplete": true,
                            "onboarding.completedSteps": ["welcome", "profile-setup", "notifications-setup", "complete"],
                            "onboarding.completedAt": new Date()
                        }
                    }
                );

                console.log(`✅ Successfully updated ${result.modifiedCount} users to skip onboarding.`);
            } else {
                console.log("All users are already marked as onboarded. Nothing to do.");
            }

        } catch (error) {
            console.error("❌ Error updating users:", error);
        } finally {
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB. Fix complete.");
            process.exit(0);
        }
    })
    .catch((err) => {
        console.error("❌ Failed to connect to MongoDB:", err);
        process.exit(1);
    });
