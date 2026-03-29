import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function fixSocieties() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const db = mongoose.connection;

        // Update all societies so requireApproval is true
        const updateResult = await db.collection('societies').updateMany(
            {},
            { $set: { requireApproval: true } }
        );
        console.log(`Updated ${updateResult.modifiedCount} societies to require validation.`);

        // IMPORTANT: Let's also reset the 'master' user's approved status on those societies
        // so they can cleanly test the flow right now.
        const masterUser = await db.collection('users').findOne({
            $or: [
                { 'profile.displayName': /master/i },
                { email: /master/i }
            ]
        });

        if (masterUser) {
            console.log(`Found master user with ID: ${masterUser._id}`);

            // Revert all "approved" memberships to "left" for testing
            const resetResult = await db.collection('societies').updateMany(
                { "members.memberId": masterUser._id, "members.status": "approved" },
                { $set: { "members.$[elem].status": "left" } },
                { arrayFilters: [{ "elem.memberId": masterUser._id }] }
            );
            console.log(`Reset ${resetResult.modifiedCount} memberships for the master user back to 'left'.`);
        } else {
            console.log("Master user not found.");
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixSocieties();
