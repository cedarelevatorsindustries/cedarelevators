/**
 * Theme Converter Script
 * Converts admin panel from orange theme to blue theme
 */

const fs = require('fs');
const path = require('path');

// Color mapping from orange to blue
const colorMap = {
    'orange-50': 'blue-50',
    'orange-100': 'blue-100',
    'orange-200': 'blue-200',
    'orange-300': 'blue-300',
    'orange-400': 'blue-400',
    'orange-500': 'blue-500',
    'orange-600': 'blue-600',
    'orange-700': 'blue-700',
    'orange-800': 'blue-800',
    'orange-900': 'blue-900',
    'orange-950': 'blue-950',
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

    // Replace all orange color references with blue
    Object.entries(colorMap).forEach(([orange, blue]) => {
        const regex = new RegExp(orange, 'g');
        const matches = content.match(regex);
        if (matches) {
            content = content.replace(regex, blue);
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

console.log('🎨 Converting admin theme from orange to blue...\n');

directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
});

console.log(`\n✅ Theme conversion complete!`);
console.log(`   Files modified: ${filesProcessed}`);
console.log(`   Total replacements: ${replacements}\n`);
