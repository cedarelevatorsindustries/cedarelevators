import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else if (/\.(ts|tsx|js|mjs)$/.test(file)) {
      results.push(full);
    }
  }
  return results;
}

const allFiles = walk('src');
const packages = ['icons', 'lucid', 'razorpay', 'pusher', 'pusher-js'];

for (const pkg of packages) {
  const matches = allFiles.filter(f => {
    const content = fs.readFileSync(f, 'utf8');
    const regex = new RegExp(`['"]${pkg}['"]`);
    return regex.test(content);
  });
  console.log(`Package "${pkg}": used in ${matches.length} files`);
  if (matches.length > 0 && matches.length < 5) {
    console.log('  Files:', matches);
  }
}
