/**
 * Export marketing poster HTML to PNG.
 * Usage: pnpm tsx scripts/export-posters.ts
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { MARKETING_FEATURES } from './marketing/features';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postersDir = path.join(root, 'docs/marketing/posters');
const featuresDir = path.join(postersDir, 'features');
const outDir = path.join(postersDir, 'export');

type ExportItem = { html: string; png: string; width: number; height: number; dir: string };

async function buildExportList(): Promise<ExportItem[]> {
  const items: ExportItem[] = [
    { html: 'story.html', png: 'ballin-instagram-story-9x16.png', width: 1080, height: 1920, dir: postersDir },
    { html: 'post.html', png: 'ballin-instagram-post-1x1.png', width: 1080, height: 1080, dir: postersDir },
  ];

  let featureFiles: string[] = [];
  try {
    featureFiles = await readdir(featuresDir);
  } catch {
    featureFiles = [];
  }

  for (const file of featureFiles.filter((f) => f.endsWith('.html'))) {
    const base = file.replace('.html', '');
    const isStory = base.endsWith('-story');
    items.push({
      html: file,
      png: `${base}.png`,
      width: 1080,
      height: isStory ? 1920 : 1080,
      dir: featuresDir,
    });
  }

  return items;
}

async function main() {
  await import('node:fs/promises').then((fs) => fs.mkdir(outDir, { recursive: true }));
  const exports = await buildExportList();

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const item of exports) {
    const fileUrl = `file://${path.join(item.dir, item.html)}`;
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, item.png), type: 'png' });
    console.log(`Exported ${item.png}`);
  }

  await browser.close();
  console.log(`\n${exports.length} posters → docs/marketing/posters/export/`);
  console.log(`Features: ${MARKETING_FEATURES.length} × 2 formats (story + post)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
