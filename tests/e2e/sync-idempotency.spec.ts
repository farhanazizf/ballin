import { expect, test } from '@playwright/test';

// Placeholder gate: idempotensi client_event_id sudah dicover unit test outbox.
// Spec ini memastikan hook sync tersedia di layout field.

test('sync hook tersedia setelah login coach ke drill', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('coach@dynasty.test');
  await page.locator('#password').fill('Coach123!');
  await page.getByRole('button', { name: /Masuk ke dashboard/i }).click();
  await page.waitForURL('**/dashboard**', { timeout: 60_000 });

  await page.goto('/session/40000000-0000-0000-0000-000000000002/drill/61000000-0000-0000-0000-000000000001');
  await expect(page.getByTestId('drill-made-30000000-0000-0000-0000-000000000001')).toBeVisible({ timeout: 90_000 });

  const hasHook = await page.evaluate(() => typeof (window as Window & { __ballinSyncNow?: unknown }).__ballinSyncNow === 'function');
  expect(hasHook).toBe(true);
});
