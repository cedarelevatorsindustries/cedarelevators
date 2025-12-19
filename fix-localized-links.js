const fs = require('fs');
const path = require('path');

function getAllTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      getAllTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixLocalizedLinks() {
  const files = getAllTsxFiles('./src');
  let fixedCount = 0;
  
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      // Replace import statements
      if (content.includes('LocalizedClientLink')) {
        // Replace import from @components/ui/localized-client-link
        content = content.replace(
          /import LocalizedClientLink from "@components\/ui\/localized-client-link"/g,
          'import Link from "next/link"'
        );
        
        // Replace import from @/components/ui/localized-client-link
        content = content.replace(
          /import LocalizedClientLink from "@\/components\/ui\/localized-client-link"/g,
          'import Link from "next/link"'
        );
        
        // Replace JSX tags
        content = content.replace(/<LocalizedClientLink/g, '<Link');
        content = content.replace(/<\/LocalizedClientLink>/g, '</Link>');
        
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        fixedCount++;
        console.log(`Fixed: ${file}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });
  
  console.log(`\nFixed ${fixedCount} files`);
}

fixLocalizedLinks();