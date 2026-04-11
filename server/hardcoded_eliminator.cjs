/**
 * COMPREHENSIVE HARDCODED DATA ELIMINATION SCRIPT
 * 
 * This script performs a surgical sweep of the entire codebase to:
 * 1. Replace ALL hardcoded dark-mode hex backgrounds with theme variables
 * 2. Replace old green accent colors with Indigo primary
 * 3. Fix old dark-mode page backgrounds  
 * 4. Replace old hover states with new Indigo equivalents
 * 5. Clean up remaining visual inconsistencies
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'client', 'src');

const SKIP = ['ThemePreview.jsx', 'node_modules', '.git', 'themes'];

// Comprehensive replacement map
const REPLACEMENTS = [
    // === DARK PAGE BACKGROUNDS ===
    [/bg-\[#111814\]/g, 'bg-background'],         // MentorshipHub dark bg
    [/bg-\[#112116\]/g, 'bg-background'],         // VerificationPending dark bg
    [/bg-\[#112117\]/g, 'bg-background'],         // CreateTask dark bg
    [/bg-\[#1c241f\]/g, 'bg-surface'],            // MentorshipHub card bg
    [/bg-\[#1a2a20\]/g, 'bg-surface'],            // CreateTask card bg
    [/bg-\[#1f2428\]/g, 'bg-surface'],            // StudentTasks header bg
    [/bg-\[#1a2027\]/g, 'bg-surface-hover'],      // FeatureCard hover bg
    [/bg-\[#1c2620\]/g, 'bg-surface'],            // RoleSelection dark bg
    [/bg-\[#1f2937\]/g, 'bg-surface'],            // AgentMessageList dark bg

    // === DARK BORDERS ===
    [/border-\[#2a3d32\]/g, 'border-border'],     // CreateTask dark borders
    [/border-\[#3d5246\]/g, 'border-border'],     // Old green borders

    // === LEGACY GREEN ACCENTS → INDIGO ===
    [/text-\[#1dc964\]/g, 'text-primary'],         // Green text → Indigo
    [/text-\[#17cf63\]/g, 'text-primary'],         // Green text variant
    [/text-\[#3fb950\]/g, 'text-primary'],         // Green text variant
    [/hover:border-\[#17cf63\]/g, 'hover:border-primary'],
    [/hover:bg-\[#3fb950\]/g, 'hover:bg-primary-hover'],
    [/hover:bg-\[#2aaa4b\]/g, 'hover:bg-primary-hover'], // IconButton
    [/bg-\[#1dc96422\]/g, 'bg-primary/10'],       // Green transparent bg
    [/border-\[#1dc96444\]/g, 'border-primary/20'],// Green transparent border
    [/bg-\[#4338CA\]/g, 'bg-primary'],             // SocietyDetail button
    [/ring-\[#1dc964\]/g, 'ring-primary'],

    // === OLD BLUE ACCENTS → UNIFIED ===
    [/bg-\[#1f6feb\]/g, 'bg-primary'],             // Old blue buttons
    [/hover:bg-\[#388bfd\]/g, 'hover:bg-primary-hover'],
    [/text-\[#58a6ff\]/g, 'text-primary'],         // Old blue text
    [/bg-\[#1f6feb\]\/20/g, 'bg-primary/10'],     // Blue transparent
    [/border-\[#1f6feb\]\/40/g, 'border-primary/20'],

    // === DARK HOVER REMNANTS ===
    [/hover:bg-\[#3d444d\]/g, 'hover:bg-surface-hover'], // Dark hover states
    [/bg-\[#484F58\]/g, 'bg-text-secondary'],      // EventCard past badge

    // === DARK-MODE-ONLY TEXT COLORS ===
    [/text-\[#E6EDF3\]/g, 'text-text-primary'],    // Dashboard EventCard title
    [/text-\[#8B949E\]/g, 'text-text-secondary'],  // Dashboard EventCard subtitle

    // === OLD GREEN STATUS COLORS ===  
    [/text-\[#9eb7a9\]/g, 'text-text-secondary'],  // Muted green text
    [/border-\[#9eb7a9\]/g, 'border-border'],      // Muted green border

    // === OLD ACCENT → INDIGO SPECIFIC ===
    [/text-\[#1dc964\]\s*hover:underline/g, 'text-primary hover:underline'], // Sign in link
    [/font-\[\'Lexend\'\]/g, 'font-display'],      // Hardcoded font

    // === MISC DARK THEME REMNANTS ===
    [/bg-\[#3b82f6\]/g, 'bg-primary'],             // MentorSessions blue button
    [/border-\[#0bda43\]/g, 'border-primary'],     // Online status green → indigo
    [/bg-\[#0bda43\]/g, 'bg-primary'],             // Online indicator green
];

function walk(dir) {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (SKIP.includes(entry.name)) continue;
            files.push(...walk(full));
        } else if (/\.(jsx|js)$/.test(entry.name) && !SKIP.includes(entry.name)) {
            files.push(full);
        }
    }
    return files;
}

let totalFiles = 0;
let totalReplacements = 0;

for (const file of walk(srcDir)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    let fileReplacements = 0;

    for (const [pattern, replacement] of REPLACEMENTS) {
        const matches = content.match(pattern);
        if (matches) {
            fileReplacements += matches.length;
            content = content.replace(pattern, replacement);
        }
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        totalFiles++;
        totalReplacements += fileReplacements;
        console.log(`Fixed ${fileReplacements} instances in: ${path.relative(srcDir, file)}`);
    }
}

console.log(`\n========================================`);
console.log(`DONE. Fixed ${totalReplacements} hardcoded values across ${totalFiles} files.`);
console.log(`========================================`);
