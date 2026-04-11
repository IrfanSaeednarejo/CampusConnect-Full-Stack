const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'client', 'src');

const replacements = [
    ['#F0F9FF', '#EEF2FF'],
    ['#E0F2FE', '#E0E7FF'],
    ['#0C4A6E', '#0F172A'],
    ['#0369A1', '#475569'],
    ['#38BDF8', '#94A3B8'],
    ['#BAE6FD', '#C7D2FE'],
    ['#2563EB', '#4F46E5'],
    ['#1D4ED8', '#4338CA']
];

function walk(dir) {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            files.push(...walk(full));
        } else if (/\.(jsx|js|css)$/.test(entry.name) && !entry.name.includes('ThemePreview')) {
            files.push(full);
        }
    }
    return files;
}

let updated = 0;
for (const file of walk(srcDir)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    for (const [from, to] of replacements) {
        content = content.split(from).join(to);
    }
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        updated++;
        console.log('Swapped Az->In:', path.relative(srcDir, file));
    }
}
console.log(`\nDONE. Updated ${updated} files.`);
