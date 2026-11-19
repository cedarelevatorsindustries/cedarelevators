/**
 * Image Conversion Script - PNG to WebP
 * Cedar Elevator Industries
 * 
 * Run with: node scripts/convert-images-to-webp.mjs
 * Requires: npm install sharp
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, '../public');

// Directories to process
const DIRS_TO_PROCESS = [
    'logo',
    'empty-states',
    'payment-icons',
    'icons',
    'images',
];

// Quality settings
const WEBP_QUALITY = 85;

async function findPngFiles(dir) {
    const files = [];

    try {
        const entries = await readdir(dir);

        for (const entry of entries) {
            const fullPath = join(dir, entry);
            const stats = await stat(fullPath);

            if (stats.isDirectory()) {
                files.push(...await findPngFiles(fullPath));
            } else if (extname(entry).toLowerCase() === '.png') {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.log(`Skipping ${dir}: ${error.message}`);
    }

    return files;
}

async function convertPngToWebp(pngPath) {
    const webpPath = pngPath.replace(/\.png$/i, '.webp');

    try {
        await sharp(pngPath)
            .webp({ quality: WEBP_QUALITY })
            .toFile(webpPath);

        const pngStats = await stat(pngPath);
        const webpStats = await stat(webpPath);

        const savings = ((1 - webpStats.size / pngStats.size) * 100).toFixed(1);

        console.log(`✓ ${basename(pngPath)} → ${basename(webpPath)} (${savings}% smaller)`);

        return {
            original: pngPath,
            converted: webpPath,
            originalSize: pngStats.size,
            newSize: webpStats.size,
        };
    } catch (error) {
        console.error(`✗ Failed: ${pngPath} - ${error.message}`);
        return null;
    }
}

async function main() {
    console.log('🖼️  PNG to WebP Conversion Script');
    console.log('==================================\n');

    let allFiles = [];

    for (const dir of DIRS_TO_PROCESS) {
        const dirPath = join(PUBLIC_DIR, dir);
        const files = await findPngFiles(dirPath);
        allFiles.push(...files);
    }

    if (allFiles.length === 0) {
        console.log('No PNG files found to convert.');
        return;
    }

    console.log(`Found ${allFiles.length} PNG files to convert.\n`);

    const results = [];
    for (const file of allFiles) {
        const result = await convertPngToWebp(file);
        if (result) results.push(result);
    }

    // Summary
    console.log('\n📊 Summary');
    console.log('----------');
    console.log(`Files converted: ${results.length}/${allFiles.length}`);

    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
    const totalSavings = ((1 - totalNew / totalOriginal) * 100).toFixed(1);

    console.log(`Total savings: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalNew / 1024).toFixed(1)}KB (${totalSavings}% reduction)`);

    console.log('\n✅ Done! Update your imports to use .webp extension.');
    console.log('💡 Tip: Next.js will serve WebP automatically if browser supports it.');
}

main().catch(console.error);
