#!/usr/bin/env node
/* Turns the full-size originals in images/ into a ladder of small,
   web-sized variants in public/assets/, plus a manifest the page uses
   to download only the size the visiting device actually needs. */

import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

// Rungs of the ladder, in CSS-pixel widths. The page picks the smallest
// rung that still covers the viewport, so a phone never pulls a 4K photo.
const WIDTHS = [640, 960, 1280, 1600, 1920, 2560];

const FORMATS = [
  { ext: "webp", options: { quality: 65 } },
  // JPEG fallback for the rare browser without WebP support.
  { ext: "jpg", options: { quality: 70, mozjpeg: true, progressive: true } },
];

const SOURCE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".tif",
  ".tiff",
  ".heic",
]);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "images");
const outDir = path.join(root, "public", "assets");

function slugify(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const sources = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => SOURCE_EXTENSIONS.has(path.extname(name).toLowerCase()))
  .sort();

// Rebuild from scratch so deleted originals do not leave orphans behind.
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const images = [];

for (const name of sources) {
  const slug = slugify(name);
  // .rotate() with no argument applies the EXIF orientation, so photos
  // taken sideways on a phone do not come out rotated.
  const source = sharp(path.join(sourceDir, name)).rotate();
  const meta = await source.metadata();

  // Never upscale: cap the ladder at the original's own width.
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (!widths.length) widths.push(meta.width);

  for (const width of widths) {
    for (const format of FORMATS) {
      const resized = source
        .clone()
        .resize({ width, withoutEnlargement: true })
        .toFormat(format.ext === "jpg" ? "jpeg" : format.ext, format.options);

      const info = await resized.toFile(
        path.join(outDir, `${slug}-${width}.${format.ext}`),
      );

      if (format.ext === "webp") {
        console.log(
          `  ${slug}-${width}.webp  ${(info.size / 1024).toFixed(0)} KB`,
        );
      }
    }
  }

  images.push({
    slug,
    // Aspect ratio lets the page work out how wide the image must be to
    // cover the viewport, which on a tall phone screen is not the same
    // thing as the viewport's own width.
    aspect: Number((meta.width / meta.height).toFixed(4)),
    widths,
  });
}

await writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ formats: FORMATS.map((f) => f.ext), images }, null, 2) + "\n",
);

console.log(`${images.length} image(s) ready in public/assets`);
