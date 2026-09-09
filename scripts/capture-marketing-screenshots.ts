/**
 * Capture real app screenshots for marketing posters.
 * Prerequisite: production server on :3001 (pnpm build && pnpm start -p 3001), pnpm seed:dev done.
 * Dev server (:3000) often fails drill hydration due to HMR in headless Playwright.
 * Usage: MARKETING_BASE_URL=http://127.0.0.1:3001 pnpm tsx scripts/capture-marketing-screenshots.ts
 */
import fs from 'node:fs';
import { chromium, type BrowserContext, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DEV_DEFAULT_PLAYER } from '../src/lib/constants/dev-seed';
import { authenticateCoach } from '../tests/e2e/helpers/auth';

function loadEnvLocal() {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'docs/marketing/posters/screenshots');
/** Must match cookie domain in tests/e2e/helpers/auth.ts (127.0.0.1) */
const BASE = process.env.MARKETING_BASE_URL ?? 'http://127.0.0.1:3001';
const SESSION = '40000000-0000-0000-0000-000000000002';
const DRILL_FT = '61000000-0000-0000-0000-000000000001';
const PLAYER_RIZKY = '30000000-0000-0000-0000-000000000001';
const MOBILE = { width: 390, height: 844 };

async function loginCoach(context: BrowserContext, page: Page) {
  await authenticateCoach(page.request, context);
  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState('networkidle');
}

async function waitForDrillReady(page: Page) {
  await page.getByTestId(`drill-made-${PLAYER_RIZKY}`).waitFor({ timeout: 90_000 });
  await page.getByTestId('drill-input-screen').waitFor({ timeout: 15_000 });
}

async function waitForPlayerCardReady(page: Page) {
  await page.getByRole('heading', { name: DEV_DEFAULT_PLAYER.nickname }).waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    () => document.body.innerText.length > 400,
    undefined,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1500);
}

async function shot(page: Page, filename: string) {
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, filename), type: 'png' });
  console.log(`  ✓ ${filename}`);
}

async function loginPlayer(page: Page) {
  await page.goto(`${BASE}/player-login`);
  await page.waitForLoadState('networkidle');
  await page.locator('#username').fill(DEV_DEFAULT_PLAYER.username);
  const authResponse = page.waitForResponse(
    (r) => r.url().includes('/api/auth/player') && r.request().method() === 'POST',
    { timeout: 60_000 },
  );
  const digits = DEV_DEFAULT_PLAYER.pin.split('');
  const pinInputs = page.locator('[aria-label^="Digit"]');
  for (let i = 0; i < digits.length; i++) {
    await pinInputs.nth(i).fill(digits[i]!);
  }
  await page.getByRole('button', { name: /Masuk ke kartu|Sign in to card|Go to card/i }).click();
  const res = await authResponse;
  if (!res.ok()) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Player login gagal: ${JSON.stringify(body)}`);
  }
  await page.waitForURL('**/card**', { timeout: 60_000 });
  await waitForPlayerCardReady(page);
}

async function main() {
  await import('node:fs/promises').then((fs) => fs.mkdir(outDir, { recursive: true }));

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 });
  const page = await context.newPage();

  await loginCoach(context, page);

  await page.goto(`${BASE}/session/${SESSION}/attendance`);
  await page.waitForLoadState('networkidle');
  await shot(page, '01-absensi-main.png');

  await page.goto(`${BASE}/session/${SESSION}/drill/${DRILL_FT}`);
  await page.waitForLoadState('networkidle');
  await waitForDrillReady(page);
  const madeBtn = page.getByTestId(`drill-made-${PLAYER_RIZKY}`);
  for (let i = 0; i < 5; i++) await madeBtn.click({ force: true });
  await shot(page, '02-drill-grid.png');
  await shot(page, '02-drill-player.png');
  await shot(page, '03-offline-drill.png');

  await page.goto(`${BASE}/session/${SESSION}/stations`);
  await page.waitForLoadState('networkidle');
  await shot(page, '04-stations.png');

  await page.goto(`${BASE}/session/${SESSION}/review`);
  await page.waitForLoadState('networkidle');
  await shot(page, '05-review.png');

  await page.goto(`${BASE}/session/${SESSION}/rubric`);
  await page.waitForLoadState('networkidle');
  await shot(page, '06-rubric.png');

  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.getByText(/Beranda|Dashboard|Pemain|Players/i).first().waitFor({ timeout: 15_000 }).catch(() => {});
  await shot(page, '07-dashboard.png');

  await page.goto(`${BASE}/players`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('heading', { name: /Pemain|Players/i }).waitFor({ timeout: 30_000 });
  await shot(page, '08-profil.png');
  await page.goto(`${BASE}/players/${PLAYER_RIZKY}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await shot(page, '08-profil-detail.png');

  await page.goto(`${BASE}/reports`);
  await page.waitForLoadState('networkidle');
  await page.getByText(/Rapor|Reports/i).first().waitFor({ timeout: 15_000 }).catch(() => {});
  await shot(page, '09-rapor.png');

  await context.clearCookies();
  await loginPlayer(page);
  await shot(page, '10-kartu.png');

  await browser.close();
  console.log('\nDone. Screenshots in docs/marketing/posters/screenshots/');
}

async function capturePlayerCardOnly() {
  await import('node:fs/promises').then((fs) => fs.mkdir(outDir, { recursive: true }));
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await loginPlayer(page);
  await shot(page, '10-kartu.png');
  await browser.close();
}

const runner = process.argv.includes('--only=player-card') ? capturePlayerCardOnly : main;
runner().catch((err) => { console.error(err); process.exit(1); });
