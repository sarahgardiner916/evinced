// Test 1 - Simple navigation to the home page.
// Mode: evAnalyze (Single Run) - the page is static, so one snapshot scan is enough.
const { test, expect } = require('@playwright/test');
const { existsSync } = require('node:fs');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');

test('Home page - single-run accessibility scan', async ({ page }) => {
  const evReport = './evincedReports/01-home-evAnalyze.html';
  const evinced = new EvincedSDK(page);

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/Love & Minter/);

  const issues = await evinced.evAnalyze({ scan: { screenshots: { enabled: true } } });
  await evinced.evSaveFile(issues, 'html', evReport);

  console.log(`Evinced found ${issues.length} issues on the home page`);
  expect(existsSync(evReport)).toBeTruthy();
});
