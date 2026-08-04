const fs = require('fs');
const path = require('path');

function walk(d, a = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, a);
    else if (/\.(html|ts)$/.test(f)) a.push(p);
  }
  return a;
}

const files = walk('src/app');
const used = new Set();
const patterns = [
  /['"]([a-zA-Z0-9_.]+)['"]\s*\|\s*translate/g,
  /translate\.instant\(['"]([^'"]+)['"]\)/g,
  /translationKey:\s*['"]([^'"]+)['"]/g,
  /header:\s*['"]([^'"]+)['"]/g,
  /label:\s*['"]([^'"]+)['"]/g,
  /placeholder:\s*['"]([^'"]+)['"]/g,
  /tooltip:\s*['"]([^'"]+)['"]/g,
];

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  for (const re of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(c))) {
      if (m[1].includes('.') && !m[1].startsWith('http')) used.add(m[1]);
    }
  }
}

function loadJson(dir) {
  const keys = new Set();
  for (const rel of JSON.parse(fs.readFileSync('public/i18n/manifest.json', 'utf8'))) {
    const fp = path.join(dir, rel);
    if (!fs.existsSync(fp)) continue;
    const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
    function flat(o, p = '') {
      for (const k of Object.keys(o)) {
        const np = p ? `${p}.${k}` : k;
        if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) flat(o[k], np);
        else keys.add(np);
      }
    }
    flat(obj);
  }
  return keys;
}

const vi = loadJson('public/i18n/vi');
const en = loadJson('public/i18n/en');
const missing = [...used].filter((k) => !vi.has(k) || !en.has(k)).sort();
console.log(`Used: ${used.size}, VI: ${vi.size}, Missing: ${missing.length}`);
missing.forEach((k) => console.log(k));
