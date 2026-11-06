// Test 2 - Complex flow with validations.
// Mode: evStart/evStop (Continuous) - the SDK records every DOM change and
// navigation, so menus, popovers, and new pages opened during the flow are all analyzed.
//
// NOTE: a11y-audits.com is a Shopify demo store. If a locator below doesn't match,
// run `npx playwright codegen https://a11y-audits.com` to pick the right one.
const { test, expect } = require('@playwright/test');
const { existsSync } = require('node:fs');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');

test('Browse -> product -> add to cart - continuous accessibility scan', async ({ page }) => {
  const evReport = './evincedReports/02-shopping-flow-continuous.html';
  const evinced = new EvincedSDK(page);

  await evinced.evStart({ scan: { screenshots: { enabled: true } } });

  await test.step('Open home page', async () => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Love & Minter/);
  });

  await test.step('Browse the product catalog', async () => {
    // Note: the /search page exposes no accessible search input (an a11y bug on
    // this demo site), so we browse the catalog instead.
    await page.goto('/collections/all');
    await expect(page).toHaveURL(/\/collections\/all/);
    await expect(page.locator('a[href*="/products/"]').first()).toBeVisible();
  });

  await test.step('Open the first product', async () => {
    const firstProduct = page.locator('a[href*="/products/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\//);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  await test.step('Add to cart and validate the cart', async () => {
    const addToCart = page.getByRole('button', { name: /add to cart/i }).first();
    await expect(addToCart).toBeEnabled();
    await addToCart.click();
    await page.goto('/cart');
    await expect(page.locator('a[href*="/products/"]').first()).toBeVisible();
  });

  const issues = await evinced.evStop();
  await evinced.evSaveFile(issues, 'html', evReport);

  console.log(`Evinced found ${issues.length} issues across the shopping flow`);
  expect(existsSync(evReport)).toBeTruthy();
});
