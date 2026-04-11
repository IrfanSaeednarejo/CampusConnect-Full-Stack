const fs = require('fs');
const files = [
    'd:\\University\\HHadias repo FYP\\FYP-CampusConnect\\client\\src\\pages\\Dashboard\\MentorDashboard.jsx',
    'd:\\University\\HHadias repo FYP\\FYP-CampusConnect\\client\\src\\pages\\Dashboard\\StudentDashboard.jsx',
    'd:\\University\\HHadias repo FYP\\FYP-CampusConnect\\client\\src\\pages\\Dashboard\\EventDashboard.jsx',
    'd:\\University\\HHadias repo FYP\\FYP-CampusConnect\\client\\src\\pages\\Dashboard\\SocietyDashboard.jsx'
];

files.forEach(f => {
    if (fs.existsSync(f)) {
        let text = fs.readFileSync(f, 'utf8');

        // Globally replace text-white with text-text-primary in these layout files
        text = text.replace(/text-white/g, 'text-text-primary');

        // BUT restore text-white for buttons where bg-primary is used
        text = text.replace(/bg-primary text-text-primary/g, 'bg-primary text-white');

        // Fix specific bad background logic in MentorDashboard
        text = text.replace(/bg-\[\#BAE6FD\] text-text-primary/g, 'bg-primary text-white');

        // Fix hover states that got mutated
        text = text.replace(/hover:text-text-primary/g, 'hover:text-primary');

        fs.writeFileSync(f, text);
        console.log(`Updated ${f}`);
    }
});
