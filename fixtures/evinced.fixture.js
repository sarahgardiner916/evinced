// Part 5 - Integrating Evinced into ALL tests at scale.
//
// An "auto" Playwright fixture wraps every test in evStart()/evStop() automatically.
// Teams just change one import line:
//   - const { test, expect } = require('@playwright/test');
//   + const { test, expect } = require('../fixtures/evinced.fixture');
// ...and every existing test gets continuous accessibility scanning + a per-test
// HTML report attached to the Playwright HTML report. No test logic changes needed.
const base = require('@playwright/test');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');

const test = base.test.extend({
  evinced: [
    async ({ page }, use, testInfo) => {
      const evinced = new EvincedSDK(page);
      await evinced.evStart({ scan: { screenshots: { enabled: true } } });

      await use(evinced); // the test runs here

      const issues = await evinced.evStop();
      const safeName = testInfo.titlePath.join('-').replace(/[^a-z0-9]+/gi, '_');
      const reportPath = testInfo.outputPath(`evinced-${safeName}.html`);
      await evinced.evSaveFile(issues, 'html', reportPath);

      // Attach to the Playwright HTML report so everything is in one place.
      await testInfo.attach('Evinced accessibility report', { path: reportPath, contentType: 'text/html' });
      testInfo.annotations.push({ type: 'evinced-issues', description: String(issues.length) });

      // Optional quality gate - fail on critical issues when EVINCED_FAIL_ON_CRITICAL=true.
      if (process.env.EVINCED_FAIL_ON_CRITICAL === 'true') {
        const critical = issues.filter((i) => i?.severity?.name === 'Critical');
        base.expect(critical, `${critical.length} critical a11y issues`).toHaveLength(0);
      }
    },
    { auto: true },
  ],
});

module.exports = { test, expect: base.expect };
