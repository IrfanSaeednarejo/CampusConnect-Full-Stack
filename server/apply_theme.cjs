const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'client', 'src');

const replacements = [
    ['#F0FDF4', '#F0F9FF'],
    ['#ECFDF5', '#E0F2FE'],
    ['#0D9488', '#2563EB'],
    ['#0F766E', '#1D4ED8'],
    ['#A7F3D0', '#BAE6FD'],
    ['#064E3B', '#0C4A6E'],
    ['#047857', '#0369A1'],
    ['#84CC16', '#F59E0B'],
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
        console.log('Updated:', path.relative(srcDir, file));
    }
}
console.log(`\nDONE. Updated ${updated} files.`);
