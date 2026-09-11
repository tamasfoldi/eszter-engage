#!/usr/bin/env node
/* Scans public/assets for image files and writes assets/manifest.json,
   so the page can pick a random one without hardcoding filenames. */

import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg',
]);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'public', 'assets');
const manifestPath = path.join(assetsDir, 'manifest.json');

const entries = await readdir(assetsDir, { withFileTypes: true });

const images = entries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
  .sort();

await writeFile(manifestPath, JSON.stringify({ images }, null, 2) + '\n');

console.log(`manifest.json: ${images.length} image(s)`);
