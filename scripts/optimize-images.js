#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'assets', 'posters');
const OUT_DIR = path.resolve(process.cwd(), 'public', 'posters');
const SIZES = [300, 600]; // generate multiple sizes
const QUALITY = 80;

async function ensureOut() {
  await fs.promises.mkdir(OUT_DIR, { recursive: true });
}

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);
  const inPath = path.join(SRC_DIR, file);

  for (const w of SIZES) {
    const outName = `${base}-${w}.webp`;
    const outPath = path.join(OUT_DIR, outName);
    try {
      await sharp(inPath)
        .resize({ width: w })
        .webp({ quality: QUALITY })
        .toFile(outPath);
      console.log('wrote', outPath);
    } catch (err) {
      console.error('failed', inPath, err.message || err);
    }
  }
}

async function run() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Source directory not found: ${SRC_DIR}`);
    console.error('Place your poster images in assets/posters and re-run this script.');
    process.exitCode = 1;
    return;
  }

  await ensureOut();

  const files = await fs.promises.readdir(SRC_DIR);
  const images = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  if (images.length === 0) {
    console.log('No images found in', SRC_DIR);
    return;
  }

  for (const f of images) await processFile(f);
}

run();
