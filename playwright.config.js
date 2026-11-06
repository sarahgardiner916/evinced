// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120_000, // Evinced analysis + screenshots add time
  globalSetup: require.resolve('./global.setup.js'),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://a11y-audits.com',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
