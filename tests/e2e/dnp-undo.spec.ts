import { expect, test } from '@playwright/test';

const COACH_EMAIL = 'coach@dynasty.test';
const COACH_PASSWORD = 'Coach123!';
const ACTIVE_SESSION_ID = '40000000-0000-0000-0000-000000000002';
const FREE_THROW_DRILL_ID = '61000000-0000-0000-0000-000000000001';
const RIZKY_PLAYER_ID = '30000000-0000-0000-0000-000000000001';

async function loginCoach(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#email')).toBeVisible();

  await page.locator('#email').fill(COACH_EMAIL);
  await page.locator('#password').fill(COACH_PASSWORD);

  const authResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/auth/v1/token') &&
      response.request().method() === 'POST' &&
      response.ok(),
    { timeout: 90_000 },
  );

  await page.getByRole('button', { name: /Masuk ke dashboard/i }).click();
  await authResponse;
  await page.waitForURL('**/dashboard**', { timeout: 60_000 });
}

test('DNP distinct from 0 and undo stays on drill input', async ({ page }) => {
  await loginCoach(page);
  await page.goto(`/session/${ACTIVE_SESSION_ID}/drill/${FREE_THROW_DRILL_ID}`);
  await expect(page.getByTestId(`drill-made-${RIZKY_PLAYER_ID}`)).toBeVisible({ timeout: 90_000 });

  const madeButton = page.getByTestId(`drill-made-${RIZKY_PLAYER_ID}`);
  const countRoot = page.getByTestId(`drill-count-${RIZKY_PLAYER_ID}`);
  const undoButton = page.getByTestId('drill-undo');

  await madeButton.click();
  await expect(countRoot).toContainText('1');
  await undoButton.click();
  await expect(countRoot).toContainText('0');

  await page.getByTestId(`drill-dnp-${RIZKY_PLAYER_ID}`).click();
  await expect(countRoot).toHaveText('–');
  await expect(page.getByTestId(`drill-dnp-${RIZKY_PLAYER_ID}`)).toHaveAttribute('aria-pressed', 'true');
});
