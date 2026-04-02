import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

dotenv.config({ path: ".env" });

const MONGO_URI = process.env.MONGODB_URI;

async function resetAdminPassword() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;

        // Ensure we hash the password explicitly with bcrypt
        const rawPassword = "password123";
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const email = "final.test@iba-suk.edu.pk";

        await db.collection("users").updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );

        console.log(`✅ Password for ${email} has been reset to: ${rawPassword}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

resetAdminPassword();
