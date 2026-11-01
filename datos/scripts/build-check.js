import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const requiredFiles = [
  'package.json',
  '2-faker/generar-datos.js',
  '2-faker/catalogo.json',
  '3-anomizar/1-generar-dump-real.js',
  '3-anomizar/2-anonimizar.js'
];

const missing = requiredFiles.filter((relative) => !fs.existsSync(path.join(repoRoot, relative)));

if (missing.length > 0) {
  console.error('Build failed: missing required files');
  console.error(missing.join('\n'));
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
if (!pkg.name || !pkg.version) {
  console.error('Build failed: invalid package metadata');
  process.exit(1);
}

console.log(`Build OK: ${pkg.name}@${pkg.version}`);
console.log('Required data and scripts are present.');
