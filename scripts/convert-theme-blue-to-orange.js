/**
 * Theme Converter Script: Blue to Orange
 * Reverses the previous conversion to bring back orange theme
 */

const fs = require('fs');
const path = require('path');

// Color mapping from blue to orange (Reversed)
const colorMap = {
    'blue-50': 'orange-50',
    'blue-100': 'orange-100',
    'blue-200': 'orange-200',
    'blue-300': 'orange-300',
    'blue-400': 'orange-400',
    'blue-500': 'orange-500',
    'blue-600': 'orange-600',
    'blue-700': 'orange-700',
    'blue-800': 'orange-800',
    'blue-900': 'orange-900',
    'blue-950': 'orange-950',
    // Also handle possible slate/gray to light theme conversions if needed, 
    // but focusing on primary color swap first.
};

// Directories to process
const directories = [
    path.join(__dirname, '../src/app/admin'),
    path.join(__dirname, '../src/modules/admin'),
];

let filesProcessed = 0;
let replacements = 0;

function processFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.tsx', '.ts', '.jsx', '.js'].includes(ext)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace all blue color references with orange
    Object.entries(colorMap).forEach(([blue, orange]) => {
        const regex = new RegExp(blue, 'g');
        const matches = content.match(regex);
        if (matches) {
            content = content.replace(regex, orange);
            replacements += matches.length;
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesProcessed++;
        console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
    }
}

function processDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.warn(`Directory not found: ${dir}`);
        return;
    }
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else {
            processFile(fullPath);
        }
    });
}

console.log('🎨 Converting admin theme from BLUE to ORANGE...\n');

directories.forEach(dir => {
    processDirectory(dir);
});

console.log(`\n✅ Theme conversion complete!`);
console.log(`   Files modified: ${filesProcessed}`);
console.log(`   Total replacements: ${replacements}\n`);
