/**
 * Final System Cleanup Script
 * Replaces all hardcoded Google image URLs with proper empty/placeholder fallbacks
 * across the entire frontend codebase.
 */
const fs = require("fs");
const path = require("path");

const CLIENT_SRC = path.join(__dirname, "..", "client", "src");

// Default placeholder for event images — a simple gradient placeholder
const EVENT_PLACEHOLDER = "";
const AVATAR_PLACEHOLDER = "";

let totalFixed = 0;
let filesFixed = 0;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, "utf-8");
    const original = content;

    // Count Google Image URL occurrences
    const googleCount = (content.match(/https:\/\/lh3\.googleusercontent\.com\/[^\s"'`)]+/g) || []).length;

    if (googleCount > 0) {
        // Replace all Google image URLs with empty string
        content = content.replace(/https:\/\/lh3\.googleusercontent\.com\/[^\s"'`)]+/g, "");
        totalFixed += googleCount;
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, "utf-8");
        filesFixed++;
        console.log(`  ✅ ${path.relative(CLIENT_SRC, filePath)} → fixed ${googleCount} Google image URL(s)`);
    }
}

function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "mock") continue;
            walkDir(full);
        } else if (entry.isFile() && (entry.name.endsWith(".jsx") || entry.name.endsWith(".js"))) {
            processFile(full);
        }
    }
}

console.log("🔍 Scanning for hardcoded Google image URLs...\n");
walkDir(CLIENT_SRC);
console.log(`\n========================================`);
console.log(`CLEANUP COMPLETE: Fixed ${totalFixed} Google image URLs across ${filesFixed} files.`);
console.log(`========================================`);
