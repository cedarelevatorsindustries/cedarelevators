/**
 * Theme Converter Script
 * Converts admin panel from red theme to orange theme
 */

const fs = require('fs');
const path = require('path');

// Color mapping from red to orange
const colorMap = {
    'red-50': 'orange-50',
    'red-100': 'orange-100',
    'red-200': 'orange-200',
    'red-300': 'orange-300',
    'red-400': 'orange-400',
    'red-500': 'orange-500',
    'red-600': 'orange-600',
    'red-700': 'orange-700',
    'red-800': 'orange-800',
    'red-900': 'orange-900',
    'red-950': 'orange-950',
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

    // Replace all red color references with orange
    Object.entries(colorMap).forEach(([red, orange]) => {
        const regex = new RegExp(red, 'g');
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

console.log('🎨 Converting admin theme from red to orange...\n');

directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
});

console.log(`\n✅ Theme conversion complete!`);
console.log(`   Files modified: ${filesProcessed}`);
console.log(`   Total replacements: ${replacements}\n`);
