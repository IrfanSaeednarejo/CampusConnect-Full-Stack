/**
 * SECOND-PASS EDGE CASE FIXER
 * 
 * Targets specific problematic patterns the first pass missed:
 * 1. bg-surface text-white → bg-surface text-text-primary  
 * 2. bg-surface-hover text-white → bg-surface-hover text-text-primary
 * 3. bg-[#C7D2FE] text-white → bg-[#C7D2FE] text-text-primary (light bg!)
 * 4. bg-black → bg-background (illegal dark background)
 * 5. bg-green-600 → bg-primary (old green accent)
 * 6. bg-green-800 → bg-primary-hover
 * 7. hover:text-white → hover:text-primary (on non-colored elements)
 * 8. hover:bg-[#404851] → hover:bg-primary-hover (dark hover remnant)
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'client', 'src');

const SKIP = ['ThemePreview.jsx', 'node_modules', '.git'];

const LINE_REPLACEMENTS = [
    // Fix text-white on light backgrounds (same-line patterns)
    [/bg-surface\s+text-white/g, 'bg-surface text-text-primary'],
    [/bg-surface-hover\s+text-white/g, 'bg-surface-hover text-text-primary'],
    [/bg-\[#C7D2FE\]\s+text-white/g, 'bg-[#C7D2FE] text-text-primary'],
    [/bg-\[#E0E7FF\]\s+text-white/g, 'bg-[#E0E7FF] text-text-primary'],

    // Fix text-white paired with light bg via border patterns
    [/bg-surface-hover border border-border[^"]*text-white/g, (match) => match.replace('text-white', 'text-text-primary')],

    // Nuke illegal dark backgrounds
    [/bg-black\b/g, 'bg-background'],

    // Fix old green accent buttons
    [/bg-green-600/g, 'bg-primary'],
    [/bg-green-700/g, 'bg-primary-hover'],
    [/bg-green-800/g, 'bg-primary-hover'],

    // Fix old green border active states  
    [/border-green-500/g, 'border-primary'],

    // Fix dark hover remnants
    [/hover:bg-\[#404851\]/g, 'hover:bg-primary-hover'],
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

for (const file of walk(srcDir)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    for (const [pattern, replacement] of LINE_REPLACEMENTS) {
        content = content.replace(pattern, replacement);
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        totalFiles++;
        console.log('Fixed:', path.relative(srcDir, file));
    }
}

console.log(`\n========================================`);
console.log(`DONE. Second-pass fixed ${totalFiles} files.`);
console.log(`========================================`);
