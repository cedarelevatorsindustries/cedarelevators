import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const baseDir = 'backups/storage';
const buckets = ['banners', 'categories', 'avatars'];

function getFilesRecursively(dir, prefix = '') {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(prefix, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, relPath));
    } else if (entry.isFile() && entry.name !== 'storage_manifest.json') {
      const stats = fs.statSync(fullPath);
      const buffer = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      results.push({
        path: relPath,
        size: stats.size,
        sha256: hash,
        fullPath
      });
    }
  }
  return results;
}

const allFiles = [];
let totalBytes = 0;

for (const b of buckets) {
  const bucketDir = path.join(baseDir, b);
  if (fs.existsSync(bucketDir)) {
    const files = getFilesRecursively(bucketDir);
    console.log(`Bucket "${b}": ${files.length} files`);
    files.forEach(f => {
      totalBytes += f.size;
      allFiles.push({
        bucket: b,
        objectPath: f.path,
        size: f.size,
        sha256: f.sha256
      });
    });
  }
}

console.log('\nTotal downloaded storage files:', allFiles.length);
console.log('Total bytes:', totalBytes, `(${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`);

// Check for zero-size files
const zeroSizeFiles = allFiles.filter(f => f.size === 0);
console.log('Zero size files count:', zeroSizeFiles.length);

// Save comprehensive storage_manifest.json
const manifest = {
  timestamp: new Date().toISOString(),
  totalFiles: allFiles.length,
  totalBytes: totalBytes,
  buckets: {
    banners: allFiles.filter(f => f.bucket === 'banners').length,
    categories_root: allFiles.filter(f => f.bucket === 'categories' && !f.objectPath.startsWith('applications/')).length,
    categories_applications: allFiles.filter(f => f.bucket === 'categories' && f.objectPath.startsWith('applications/')).length,
    avatars: allFiles.filter(f => f.bucket === 'avatars').length
  },
  files: allFiles
};

fs.writeFileSync(path.join(baseDir, 'storage_manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Updated backups/storage/storage_manifest.json successfully!');

// Also mirror to brain directory
const brainStorage = 'C:/Users/manikandan/.gemini/antigravity/brain/07104594-f5c2-499b-8c4f-a5cfb47e7956/backups/storage';
if (fs.existsSync(brainStorage)) {
  fs.writeFileSync(path.join(brainStorage, 'storage_manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Updated brain storage_manifest.json successfully!');
}
