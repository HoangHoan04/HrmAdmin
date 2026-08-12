const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const viDir = path.join(projectRoot, 'public', 'i18n', 'vi');
const manifestPath = path.join(projectRoot, 'public', 'i18n', 'manifest.json');

function getJsonFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsonFiles(filePath, baseDir));
    } else if (file.endsWith('.json')) {
      const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
      results.push(relativePath);
    }
  });
  return results;
}

try {
  if (fs.existsSync(viDir)) {
    const files = getJsonFiles(viDir);
    fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2), 'utf8');
    console.log(`Generated i18n manifest with ${files.length} files.`);
  } else {
    console.error(`Directory not found: ${viDir}`);
  }
} catch (err) {
  console.error('Error generating i18n manifest:', err);
}
