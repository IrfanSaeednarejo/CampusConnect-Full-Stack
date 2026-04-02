import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env" });

async function cleanup() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[Cleanup] Connected");

    const db = mongoose.connection.db;
    const users = db.collection("users");

    // Clear dangling email verification fields and mark all as verified
    const r1 = await users.updateMany(
        { emailVerificationExpiry: { $exists: true } },
        { $unset: { emailVerificationExpiry: "", emailVerificationToken: "" }, $set: { emailVerified: true } }
    );
    console.log(`Cleaned emailVerificationExpiry from ${r1.modifiedCount} users`);

    // Clear dangling password reset fields
    const r2 = await users.updateMany(
        { passwordResetExpiry: { $exists: true } },
        { $unset: { passwordResetExpiry: "", passwordResetToken: "" } }
    );
    console.log(`Cleaned passwordResetExpiry from ${r2.modifiedCount} users`);

    await mongoose.disconnect();
    console.log("[Cleanup] Done");
}

cleanup().catch(err => { console.error(err); process.exit(1); });
