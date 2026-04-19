/**
 * seedSuperAdmin.js
 *
 * One-time script to bootstrap the first super_admin account.
 * Run with: node server/scripts/seedSuperAdmin.js
 *
 * Reads from .env:
 *   SUPER_ADMIN_EMAIL      — e-mail for the super admin account
 *   SUPER_ADMIN_PASSWORD   — password (min 8 chars)
 *   SUPER_ADMIN_DISPLAY_NAME — display name (default: "superadmin")
 *   MONGODB_URI            — MongoDB connection string
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL = process.env.SUPER_ADMIN_EMAIL;
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const DISPLAY_NAME = process.env.SUPER_ADMIN_DISPLAY_NAME || "superadmin";

if (!MONGODB_URI || !EMAIL || !PASSWORD) {
    console.error(
        "❌  Missing required env vars: MONGODB_URI, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD"
    );
    process.exit(1);
}

if (PASSWORD.length < 8) {
    console.error("❌  SUPER_ADMIN_PASSWORD must be at least 8 characters");
    process.exit(1);
}

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅  MongoDB connected");

        // Dynamically import User model AFTER connection is established
        const { User } = await import("../src/models/user.model.js");

        const existing = await User.findOne({ email: EMAIL.toLowerCase() });

        if (existing) {
            if (existing.roles?.includes("super_admin")) {
                console.log(`ℹ️   Super admin already exists: ${existing.email}`);
            } else {
                // Upgrade existing user to super_admin
                await User.findByIdAndUpdate(existing._id, {
                    $addToSet: { roles: "super_admin" },
                });
                console.log(`✅  Existing user "${existing.email}" upgraded to super_admin`);
            }
        } else {
            const user = await User.create({
                email: EMAIL.toLowerCase().trim(),
                password: PASSWORD,
                emailVerified: true,
                roles: ["super_admin"],
                status: "active",
                profile: {
                    firstName: "super",
                    lastName: "admin",
                    displayName: DISPLAY_NAME.toLowerCase(),
                    avatar: "",
                },
            });

            console.log(`✅  Super admin created successfully`);
            console.log(`   Email:        ${user.email}`);
            console.log(`   Display Name: ${user.profile.displayName}`);
            console.log(`   User ID:      ${user._id}`);
        }

        await mongoose.disconnect();
        console.log("✅  Done");
        process.exit(0);
    } catch (err) {
        console.error("❌  Seed failed:", err.message);
        process.exit(1);
    }
};

run();
