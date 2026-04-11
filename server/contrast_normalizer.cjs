const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'client', 'src');

function walk(dir) {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            files.push(...walk(full));
        } else if (/\.(jsx|js)$/.test(entry.name)) {
            files.push(full);
        }
    }
    return files;
}

let updated = 0;
for (const file of walk(srcDir)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Backgrounds - turning dark blocks to clean outlined light blocks
    content = content.replace(/bg-gray-(800|900)/g, 'bg-surface border border-border');
    content = content.replace(/bg-slate-(800|900)/g, 'bg-surface border border-border');
    content = content.replace(/bg-gray-[67]00/g, 'bg-surface hover:bg-surface-hover border border-border');
    content = content.replace(/bg-slate-[67]00/g, 'bg-surface hover:bg-surface-hover border border-border');

    // Muted Texts - turning light muted dark-mode text into readable dark disabled text
    content = content.replace(/text-gray-[345]00/g, 'text-text-secondary');
    content = content.replace(/text-slate-[345]00/g, 'text-text-secondary');

    // Light text on dark bg -> Primary dark text on light bg
    content = content.replace(/text-gray-[12]00/g, 'text-text-primary');
    content = content.replace(/text-slate-[12]00/g, 'text-text-primary');

    // Borders
    content = content.replace(/border-gray-[678]00/g, 'border-border');
    content = content.replace(/border-slate-[678]00/g, 'border-border');

    // Placeholders
    content = content.replace(/placeholder-gray-[45]00/g, 'placeholder-text-secondary');
    content = content.replace(/placeholder-slate-[45]00/g, 'placeholder-text-secondary');

    // Any stray bad hexes
    content = content.replace(/bg-\[\#161b22\]/ig, 'bg-surface border border-border');
    content = content.replace(/bg-\[\#0d1117\]/ig, 'bg-background');

    // Search bar specific - if they used background white transparency on a dark header, it goes blank on a light header.
    content = content.replace(/bg-white\/5|bg-white\/10|bg-white\/20/g, 'bg-surface border border-border');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        updated++;
        console.log('Normalized:', path.relative(srcDir, file));
    }
}
console.log(`\nDONE. Normalized ${updated} files.`);
