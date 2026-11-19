import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2 && !line.trim().startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const inventoryPath = 'backups/cedar_storage_inventory.json';
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

const LOCAL_STORAGE_DIR = 'd:/web development/cedarelevators/backups/storage';
const EXTERNAL_STORAGE_DIR = 'C:/Users/manikandan/.gemini/antigravity/brain/07104594-f5c2-499b-8c4f-a5cfb47e7956/backups/storage';

console.log('[STORAGE DOWNLOADER] Starting asset backup...');

const downloadedManifest = [];
let totalBytes = 0;

for (const [bucket, bucketData] of Object.entries(inventory.files || {})) {
  if (!bucketData.files || bucketData.files.length === 0) continue;

  const localBucketDir = path.join(LOCAL_STORAGE_DIR, bucket);
  const extBucketDir = path.join(EXTERNAL_STORAGE_DIR, bucket);

  if (!fs.existsSync(localBucketDir)) fs.mkdirSync(localBucketDir, { recursive: true });
  if (!fs.existsSync(extBucketDir)) fs.mkdirSync(extBucketDir, { recursive: true });

  console.log(`\nBucket [${bucket}]: ${bucketData.files.length} files to download`);

  for (const file of bucketData.files) {
    const filename = file.name;
    const localFilePath = path.join(localBucketDir, filename);
    const extFilePath = path.join(extBucketDir, filename);

    try {
      const { data, error } = await supabase.storage.from(bucket).download(filename);
      if (error) {
        console.error(`  FAIL [${bucket}/${filename}]:`, error.message);
        continue;
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      fs.writeFileSync(localFilePath, buffer);
      fs.writeFileSync(extFilePath, buffer);

      const hashSum = crypto.createHash('sha256');
      hashSum.update(buffer);
      const sha256 = hashSum.digest('hex');

      totalBytes += buffer.length;
      downloadedManifest.push({
        bucket,
        filename,
        size: buffer.length,
        sha256,
        mimetype: file.metadata?.mimetype || 'application/octet-stream'
      });

      console.log(`  OK [${bucket}/${filename}]: ${buffer.length} bytes | sha256: ${sha256.slice(0, 12)}...`);
    } catch (err) {
      console.error(`  EXCEPTION [${bucket}/${filename}]:`, err.message);
    }
  }
}

const manifestPathLocal = path.join(LOCAL_STORAGE_DIR, 'storage_manifest.json');
const manifestPathExt = path.join(EXTERNAL_STORAGE_DIR, 'storage_manifest.json');
const summary = {
  timestamp: new Date().toISOString(),
  totalFiles: downloadedManifest.length,
  totalBytes,
  files: downloadedManifest
};

fs.writeFileSync(manifestPathLocal, JSON.stringify(summary, null, 2));
fs.writeFileSync(manifestPathExt, JSON.stringify(summary, null, 2));

console.log(`\n[STORAGE DOWNLOADER] Complete! Downloaded ${downloadedManifest.length} files (${(totalBytes / 1024 / 1024).toFixed(2)} MB).`);
