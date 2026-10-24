// Zips dist/ into mta-live-<version>.zip for upload to the Chrome Web Store.
// Run with `npm run package`, which builds first. The version comes from the manifest.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { zipSync } from 'fflate';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const { version } = JSON.parse(readFileSync(resolve(dist, 'manifest.json'), 'utf8'));

const files: Record<string, Uint8Array> = {};
for (const entry of readdirSync(dist, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || entry.name === '.DS_Store') continue;
  const path = resolve(entry.parentPath, entry.name);
  // Zip paths must be relative to dist/ so manifest.json sits at the zip's root
  files[relative(dist, path)] = readFileSync(path);
}

const out = resolve(root, `mta-live-${version}.zip`);
writeFileSync(out, zipSync(files));
console.log(`Wrote ${out} (${Object.keys(files).length} files)`);
