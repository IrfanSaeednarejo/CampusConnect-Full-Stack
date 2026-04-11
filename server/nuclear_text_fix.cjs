/**
 * NUCLEAR TEXT-WHITE ELIMINATOR
 * 
 * Strategy: We cannot do a simple global replace because `text-white` is VALID
 * when the element has a colored background (like `bg-primary`, `bg-red-600`, etc).
 * 
 * This script uses a line-by-line approach:
 * - For each line containing `text-white`, check if the SAME LINE also has a
 *   colored background class (bg-primary, bg-[#...], bg-red-*, bg-green-*, etc.).
 * - If YES → keep `text-white` (it's on a button/badge with colored bg)
 * - If NO → replace `text-white` with `text-text-primary` (it's body/heading text)
 * 
 * Additionally handles:
 * - `text-text-primary` on nav links where active state previously used text-white
 * - Profile button text visibility
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'client', 'src');

// Patterns that indicate a colored background where white text IS correct
const COLORED_BG_PATTERNS = [
    /bg-primary/,
    /bg-primary-hover/,
    /bg-\[#[0-9a-fA-F]{3,8}\]/,  // bg-[#hex]
    /bg-red-[4-9]00/,
    /bg-green-[4-9]00/,
    /bg-blue-[4-9]00/,
    /bg-indigo-[4-9]00/,
    /bg-purple-[4-9]00/,
    /bg-rose-[4-9]00/,
    /bg-emerald-[4-9]00/,
    /bg-teal-[4-9]00/,
    /bg-cyan-[4-9]00/,
    /bg-orange-[4-9]00/,
    /bg-yellow-[4-9]00/,
    /bg-pink-[4-9]00/,
    /bg-amber-[4-9]00/,
    /bg-black/,
    /bg-gray-900/,
    /bg-slate-900/,
    /bg-gradient-to/,
];

// Files to SKIP (theme preview uses inline styles, not our concern)
const SKIP_FILES = ['ThemePreview.jsx'];

function hasColoredBackground(line) {
    return COLORED_BG_PATTERNS.some(pattern => pattern.test(line));
}

function walk(dir) {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            files.push(...walk(full));
        } else if (/\.(jsx|js)$/.test(entry.name) && !SKIP_FILES.includes(entry.name)) {
            files.push(full);
        }
    }
    return files;
}

let totalFiles = 0;
let totalReplacements = 0;

for (const file of walk(srcDir)) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('text-white')) continue;

    const lines = content.split('\n');
    let fileChanged = false;
    let fileReplacements = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes('text-white')) continue;

        // Check if this line has a colored background
        if (hasColoredBackground(line)) {
            // White text is correct here - skip
            continue;
        }

        // No colored background found - replace text-white with text-text-primary
        lines[i] = line.replace(/text-white/g, 'text-text-primary');
        fileChanged = true;
        fileReplacements++;
    }

    if (fileChanged) {
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
        totalFiles++;
        totalReplacements += fileReplacements;
        console.log(`Fixed ${fileReplacements} lines: ${path.relative(srcDir, file)}`);
    }
}

console.log(`\n========================================`);
console.log(`DONE. Fixed ${totalReplacements} lines across ${totalFiles} files.`);
console.log(`========================================`);
