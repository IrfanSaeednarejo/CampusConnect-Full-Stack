// Script to transition draft events to registration status
// and check mentor profile names
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";

dotenv.config({ path: ".env" });

async function fixData() {
    await connectDB();

    // 1. Fix Events: Transition all draft events to "registration"
    const { Event } = await import("./src/models/event.model.js");
    const eventResult = await Event.updateMany(
        { status: "draft" },
        { $set: { status: "registration" } }
    );
    console.log(`[Events] Transitioned ${eventResult.modifiedCount} draft event(s) to "registration" status`);

    // Show current events
    const events = await Event.find({}, "title status startAt endAt").lean();
    console.log("[Events] Current events in DB:");
    events.forEach(e => console.log(`  - "${e.title}" → status: ${e.status}, starts: ${e.startAt}`));

    // 2. Check Mentors: Show mentor names to diagnose the display issue
    const Mentor = (await import("./src/models/mentor.model.js")).Mentor;
    const mentors = await Mentor.find({}).populate("userId", "profile email").lean();
    console.log(`\n[Mentors] ${mentors.length} mentor(s) found:`);
    mentors.forEach(m => {
        const u = m.userId;
        const name = u?.profile?.displayName || `${u?.profile?.firstName || ''} ${u?.profile?.lastName || ''}`.trim() || 'NO NAME';
        console.log(`  - ${name} (${u?.email}) | bio: "${m.bio?.substring(0, 40)}..." | expertise: [${m.expertise?.join(', ')}]`);
    });

    await mongoose.disconnect();
    console.log("\nDone!");
}

fixData().catch(e => { console.error(e); process.exit(1); });
