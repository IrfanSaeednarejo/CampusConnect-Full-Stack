const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname);

const IGNORE_DIRS = ['node_modules', '.git', '.gemini', 'dist', 'build', 'scratch'];

const REPLACEMENTS = [
    { regex: /CampusNexus/g, replace: 'CampusNexus' },
    { regex: /Campus Nexus/g, replace: 'Campus Nexus' },
    { regex: /campusnexus/g, replace: 'campusnexus' },
    { regex: /campus-nexus/g, replace: 'campus-nexus' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                processDirectory(fullPath);
            }
        } else {
            // Only process common text files
            if (!/\.(js|jsx|ts|tsx|json|md|html|css|env|txt)$/i.test(file) && !file.endsWith('.env')) continue;
            
            // Skip package-lock.json as changing it manually can corrupt it
            if (file === 'package-lock.json') continue;

            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const { regex, replace } of REPLACEMENTS) {
                if (regex.test(content)) {
                    content = content.replace(regex, replace);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory(ROOT_DIR);
console.log('Replacement complete.');
