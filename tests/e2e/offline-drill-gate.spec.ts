import { expect, test } from '@playwright/test';

const COACH_EMAIL = 'coach@dynasty.test';
const COACH_PASSWORD = 'Coach123!';
const ACTIVE_SESSION_ID = '40000000-0000-0000-0000-000000000002';
const FREE_THROW_DRILL_ID = '61000000-0000-0000-0000-000000000001';
const RIZKY_PLAYER_ID = '30000000-0000-0000-0000-000000000001';
const REP_COUNT = 100;

test.setTimeout(180_000);

async function loginCoach(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#email')).toBeVisible();

  await page.locator('#email').fill(COACH_EMAIL);
  await page.locator('#password').fill(COACH_PASSWORD);

  const authResponse = page.waitForResponse(
    (response) => response.url().includes('/auth/v1/token') && response.request().method() === 'POST' && response.ok(),
    { timeout: 90_000 },
  );

  await page.getByRole('button', { name: /Masuk ke dashboard/i }).click();
  await authResponse;
  await page.waitForURL('**/dashboard**', { timeout: 60_000 });
}

test('offline drill gate: 100 rep tersimpan dan tersinkron tanpa duplikat', async ({ page, context }) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  await loginCoach(page);

  await page.goto(`/session/${ACTIVE_SESSION_ID}/drill/${FREE_THROW_DRILL_ID}`);
  await expect(page.getByTestId(`drill-made-${RIZKY_PLAYER_ID}`)).toBeVisible({ timeout: 90_000 });

  const madeButton = page.getByTestId(`drill-made-${RIZKY_PLAYER_ID}`);
  const countRoot = page.getByTestId(`drill-count-${RIZKY_PLAYER_ID}`);

  await context.setOffline(true);

  for (let i = 0; i < REP_COUNT; i += 1) {
    await madeButton.click();
  }

  await expect(countRoot).toContainText(String(REP_COUNT));

  // Playwright tidak bisa reload saat offline tanpa service worker cache.
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByTestId(`drill-made-${RIZKY_PLAYER_ID}`)).toBeVisible({ timeout: 90_000 });
  await expect(countRoot).toContainText(String(REP_COUNT));
  await page.waitForFunction(() => navigator.onLine);

  await page.evaluate(async () => {
    const sync = (window as Window & { __ballinSyncNow?: () => Promise<{ sent: number; failed: number }> })
      .__ballinSyncNow;
    if (!sync) throw new Error('Sync hook tidak tersedia');
    await sync();
  });

  await page.waitForFunction(async () => {
    const pendingFn = (window as Window & { __ballinGetOutboxPending?: () => Promise<number> })
      .__ballinGetOutboxPending;
    if (!pendingFn) return false;
    const pending = await pendingFn();
    return pending === 0;
  }, undefined, { timeout: 60_000 });

  await page.evaluate(async () => {
    const sync = (window as Window & { __ballinSyncNow?: () => Promise<{ sent: number; failed: number }> })
      .__ballinSyncNow;
    if (sync) await sync();
  });

  await expect(countRoot).toContainText(String(REP_COUNT));
});
