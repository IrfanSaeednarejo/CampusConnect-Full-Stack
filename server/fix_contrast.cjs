const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'client', 'src');

const replacements = [
    ['text-[#e6edf3]', 'text-text-primary'],
    ['bg-[#112118]', 'bg-background'],
];

function walk(dir) {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            files.push(...walk(full));
        } else if (/\.(jsx|js|css)$/.test(entry.name)) {
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
        console.log('Fixed contrast:', path.relative(srcDir, file));
    }
}
console.log(`\nDONE. Fixed ${updated} files.`);
