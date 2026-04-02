import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env" });

async function switchAdmin() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const { User } = await import("../src/models/user.model.js");

    // 1. Remove admin role from old account
    const oldAdmin = await User.findOne({ email: "final.test@iba-suk.edu.pk" });
    if (oldAdmin) {
        oldAdmin.roles = oldAdmin.roles.filter(r => r !== "admin");
        if (oldAdmin.roles.length === 0) oldAdmin.roles = ["student"];
        await oldAdmin.save({ validateBeforeSave: false });
        console.log(`✅ Removed admin role from final.test@iba-suk.edu.pk → roles: [${oldAdmin.roles}]`);
    } else {
        console.log("⚠️  final.test@iba-suk.edu.pk not found (may have been deleted by TTL bug)");
    }

    // 2. Grant admin role to new account and set password
    const newAdmin = await User.findOne({ email: "admin.system@iba-suk.edu.pk" }).select("+password");
    if (!newAdmin) {
        console.error("❌ admin.system@iba-suk.edu.pk not found in database!");
        await mongoose.disconnect();
        return;
    }

    if (!newAdmin.roles.includes("admin")) {
        newAdmin.roles.push("admin");
    }
    newAdmin.password = "CampusconnectAdmin";
    await newAdmin.save({ validateBeforeSave: false });

    console.log(`✅ admin.system@iba-suk.edu.pk is now admin → roles: [${newAdmin.roles}]`);
    console.log(`✅ Password set to: CampusconnectAdmin`);

    await mongoose.disconnect();
    console.log("Done");
}

switchAdmin().catch(err => { console.error(err); process.exit(1); });
