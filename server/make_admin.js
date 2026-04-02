import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env" });

const MONGO_URI = process.env.MONGODB_URI;

async function makeAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        const users = await db.collection("users").find({}, { projection: { email: 1, roles: 1, "profile.displayName": 1 } }).toArray();

        console.log("\n--- All Users ---");
        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.profile?.displayName || "N/A"} | ${u.email} | roles: [${u.roles?.join(", ")}]`);
        });

        // Make ALL users with existing accounts into admin (pick the first one, or update all)
        // For now, let's add admin role to the FIRST user found
        if (users.length > 0) {
            const target = users[0];
            const result = await db.collection("users").updateOne(
                { _id: target._id },
                { $addToSet: { roles: "admin" } }
            );
            console.log(`\n✅ Added 'admin' role to: ${target.email} (${target.profile?.displayName || "N/A"})`);
            console.log(`   Modified: ${result.modifiedCount}`);
        }

        await mongoose.disconnect();
        console.log("\nDone!");
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

makeAdmin();
