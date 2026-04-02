/**
 * Migration: Drop TTL indexes on emailVerificationExpiry and passwordResetExpiry
 * 
 * These TTL indexes were causing MongoDB to auto-delete user documents
 * after the verification/reset token expired (24h for email, 1h for password).
 * 
 * Run this script ONCE to remove the existing indexes from the live database:
 *   node scripts/drop_ttl_indexes.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("ERROR: MONGODB_URI not set in .env");
    process.exit(1);
}

async function dropTTLIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("[Migration] Connected to MongoDB");

        const db = mongoose.connection.db;
        const collection = db.collection("users");

        // List all indexes on the users collection
        const indexes = await collection.indexes();
        console.log(`[Migration] Found ${indexes.length} indexes on 'users' collection:`);

        for (const idx of indexes) {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}${idx.expireAfterSeconds !== undefined ? ` (TTL: ${idx.expireAfterSeconds}s)` : ""}`);
        }

        // Drop the emailVerificationExpiry TTL index
        const emailTTL = indexes.find(
            (idx) => idx.key?.emailVerificationExpiry !== undefined && idx.expireAfterSeconds !== undefined
        );
        if (emailTTL) {
            await collection.dropIndex(emailTTL.name);
            console.log(`\n✅ DROPPED TTL index: "${emailTTL.name}" (emailVerificationExpiry)`);
        } else {
            console.log("\n⚠️  No TTL index found on emailVerificationExpiry (already removed or never created)");
        }

        // Drop the passwordResetExpiry TTL index
        const passwordTTL = indexes.find(
            (idx) => idx.key?.passwordResetExpiry !== undefined && idx.expireAfterSeconds !== undefined
        );
        if (passwordTTL) {
            await collection.dropIndex(passwordTTL.name);
            console.log(`✅ DROPPED TTL index: "${passwordTTL.name}" (passwordResetExpiry)`);
        } else {
            console.log("⚠️  No TTL index found on passwordResetExpiry (already removed or never created)");
        }

        // Verify
        const remaining = await collection.indexes();
        const remainingTTL = remaining.filter((idx) => idx.expireAfterSeconds !== undefined);
        if (remainingTTL.length === 0) {
            console.log("\n🎉 SUCCESS: No TTL indexes remain on the users collection. User data is safe.");
        } else {
            console.log(`\n⚠️  ${remainingTTL.length} TTL indexes still remain:`, remainingTTL.map((i) => i.name));
        }

    } catch (err) {
        console.error("[Migration] Error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("[Migration] Disconnected from MongoDB");
    }
}

dropTTLIndexes();
