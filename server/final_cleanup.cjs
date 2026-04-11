/**
 * FINAL CLEANUP PASS
 * 
 * Catches the stragglers that the main script missed:
 * 1. #17cf60 green text/ring/border accents
 * 2. text-white on pages that had dark bgs (now light) 
 * 3. #2a3d32 dividers
 * 4. #17cf63 border/focus colors on inputs
 * 5. Other one-off dark-mode hexes
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'client', 'src');
const SKIP = ['ThemePreview.jsx', 'node_modules', '.git', 'themes'];

const REPLACEMENTS = [
    // Green accent text
    [/text-\[#17cf60\]/g, 'text-primary'],
    [/text-\[#17cf63\]/g, 'text-primary'],

    // Green focus/ring/border
    [/focus:ring-\[#17cf60\]/g, 'focus:ring-primary'],
    [/focus:border-\[#17cf60\]/g, 'focus:border-primary'],
    [/focus:ring-\[#17cf63\]/g, 'focus:ring-primary'],
    [/focus:border-\[#17cf63\]/g, 'focus:border-primary'],
    [/hover:text-\[#17cf60\]/g, 'hover:text-primary'],
    [/hover:text-\[#17cf63\]/g, 'hover:text-primary'],

    // Dark-mode dividers
    [/divide-\[#2a3d32\]/g, 'divide-border'],

    // Old border-white/10 from dark mode
    [/border-white\/10/g, 'border-border'],

    // text-white/60 header text (now on light bg)
    [/text-white\/60/g, 'text-text-secondary'],

    // Remaining text-white on now-light page bodies (CreateTask specifically)
    // Only target the root container text-white
    [/bg-background text-white font-display/g, 'bg-background text-text-primary font-display'],

    // Old inline green text via dangerouslySetInnerHTML
    // class="text-[#17cf60]" → class="text-primary"
    // We need to handle the escaped version inside a string
    [/text-\[#17cf60\]/g, 'text-primary'],

    // border-[#0bda43] online indicators  
    [/border-\[#0bda43\]/g, 'border-primary'],
    [/bg-\[#0bda43\]/g, 'bg-primary'],

    // border-[#FFFFFF] on online indicator bubbles
    [/border-\[#FFFFFF\]/g, 'border-background'],

    // Old green colors in spinner
    [/border-\[#1dc964\]/g, 'border-primary'],

    // hover:border-[#1dc964] 
    [/hover:border-\[#1dc964\]\/40/g, 'hover:border-primary/40'],
    [/hover:border-\[#1dc964\]/g, 'hover:border-primary'],
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
        console.log(`Fixed ${fileReplacements} in: ${path.relative(srcDir, file)}`);
    }
}

console.log(`\n========================================`);
console.log(`FINAL CLEANUP: Fixed ${totalReplacements} values across ${totalFiles} files.`);
console.log(`========================================`);
