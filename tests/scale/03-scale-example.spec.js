// Plain functional tests - no Evinced code at all.
// Accessibility scanning is added automatically by the fixture import below.
const { test, expect } = require('../../fixtures/evinced.fixture');

test.describe('Scale example (auto Evinced fixture)', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Love & Minter/);
  });

  test('cart page loads', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
