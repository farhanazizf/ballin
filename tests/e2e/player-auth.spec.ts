import { expect, test } from '@playwright/test';
import { DEV_DEFAULT_PLAYER } from '@/lib/constants/dev-seed';

test.setTimeout(120_000);

async function loginPlayer(page: import('@playwright/test').Page) {
  await page.goto('/player-login');
  await page.waitForLoadState('domcontentloaded');

  await page.locator('#username').fill(DEV_DEFAULT_PLAYER.username);
  const digits = DEV_DEFAULT_PLAYER.pin.split('');
  const pinInputs = page.locator('[aria-label^="Digit"]');
  for (let i = 0; i < digits.length; i += 1) {
    await pinInputs.nth(i).fill(digits[i]!);
  }

  const authResponse = page.waitForResponse(
    (response) => response.url().includes('/api/auth/player') && response.request().method() === 'POST' && response.ok(),
    { timeout: 60_000 },
  );

  await page.getByRole('button', { name: /Masuk ke kartu/i }).click();
  await authResponse;
  await page.waitForURL('**/card**', { timeout: 60_000 });
}

test('player login, logout, dan perbarui sesi', async ({ page }) => {
  await loginPlayer(page);

  await expect(page.getByRole('heading', { name: DEV_DEFAULT_PLAYER.nickname })).toBeVisible({
    timeout: 60_000,
  });

  await page.getByRole('button', { name: 'Perbarui' }).click();
  await expect(page.getByRole('heading', { name: DEV_DEFAULT_PLAYER.nickname })).toBeVisible();

  await page.getByRole('button', { name: 'Keluar' }).click();
  await page.waitForURL('**/player-login**', { timeout: 60_000 });

  await loginPlayer(page);
  await expect(page.getByRole('heading', { name: DEV_DEFAULT_PLAYER.nickname })).toBeVisible();
});
