// Step 5 example: a normal end-to-end test with NO Evinced code in it.
// Accessibility scanning is added automatically by importing the Evinced fixture
// instead of '@playwright/test'. That one-line change is what makes this approach scale.
const { test, expect } = require('../../fixtures/evinced.fixture');

const BASE = 'https://blazedemo.com';

// BlazeDemo is a free public demo site. When it gets too many requests it replaces
// the page with plain text "Rate exceeded." This helper waits and reloads
// (up to 3 times) so the test doesn't fail just because the server is busy.
async function waitPastRateLimit(page) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const body = (await page.locator('body').innerText()).trim();
    if (!/^Rate exceeded\.?$/i.test(body)) return;
    console.log(`BlazeDemo rate limit hit - waiting and reloading (attempt ${attempt}/3)`);
    await page.waitForTimeout(3000 * attempt);
    await page.reload();
  }
  throw new Error('BlazeDemo is still returning "Rate exceeded." - wait a minute and run the test again.');
}

// If the site is still busy, run the whole test again (up to 2 more times).
test.describe.configure({ retries: 2 });

test('BlazeDemo - book a flight from search to confirmation', async ({ page }) => {
  await test.step('Open home page', async () => {
    await page.goto(`${BASE}/`);
    await waitPastRateLimit(page);
    await expect(page).toHaveTitle(/BlazeDemo/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome to the Simple Travel Agency!');
  });

  await test.step('Choose departure and destination cities', async () => {
    await page.locator('select[name="fromPort"]').selectOption('Boston');
    await page.locator('select[name="toPort"]').selectOption('London');
    await page.getByRole('button', { name: 'Find Flights' }).click();
  });

  await test.step('Pick a flight from the results', async () => {
    await expect(page).toHaveURL(/reserve\.php/);
    await waitPastRateLimit(page);
    await expect(page.getByRole('heading', { level: 3 })).toContainText('Flights from Boston to London');
    const chooseButtons = page.getByRole('button', { name: 'Choose This Flight' });
    await expect(chooseButtons.first()).toBeVisible();
    await chooseButtons.first().click();
  });

  await test.step('Fill in passenger and payment details', async () => {
    await expect(page).toHaveURL(/purchase\.php/);
    await waitPastRateLimit(page);
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Your flight from TLV to SFO has been reserved');

    await page.locator('#inputName').fill('Jane Tester');
    await page.locator('#address').fill('123 Main St');
    await page.locator('#city').fill('Boston');
    await page.locator('#state').fill('MA');
    await page.locator('#zipCode').fill('02101');
    await page.locator('#cardType').selectOption('amex');
    await page.locator('#creditCardNumber').fill('4111111111111111');
    await page.locator('#nameOnCard').fill('Jane Tester');
    await page.locator('#rememberMe').check();

    // Validate the form kept what we typed before submitting.
    await expect(page.locator('#inputName')).toHaveValue('Jane Tester');
    await expect(page.locator('#rememberMe')).toBeChecked();

    await page.getByRole('button', { name: 'Purchase Flight' }).click();
  });

  await test.step('Verify the confirmation page', async () => {
    await expect(page).toHaveURL(/confirmation\.php/);
    await waitPastRateLimit(page);
    await expect(page).toHaveTitle('BlazeDemo Confirmation');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thank you for your purchase today!');
    await expect(page.getByRole('cell', { name: 'PendingCapture' })).toBeVisible();
  });
});
