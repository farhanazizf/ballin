import { expect, test } from '@playwright/test';

const COACH_EMAIL = 'coach@dynasty.test';
const COACH_PASSWORD = 'Coach123!';

async function loginCoach(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('#email').fill(COACH_EMAIL);
  await page.locator('#password').fill(COACH_PASSWORD);
  await page.getByRole('button', { name: /Masuk ke dashboard/i }).click();
  await page.waitForURL('**/dashboard**', { timeout: 60_000 });
}

test('coach dapat membuat sesi benchmark dari form', async ({ page }) => {
  await loginCoach(page);
  await page.goto('/sessions/new');
  await page.locator('#sessionType').selectOption('benchmark');
  await page.locator('#teamId').selectOption({ index: 0 });
  await page.getByRole('button', { name: /Simpan sesi/i }).click();
  await page.waitForURL('**/sessions**', { timeout: 60_000 });
  await expect(page.getByText('Benchmark', { exact: false }).first()).toBeVisible({ timeout: 30_000 });
});
