// Authenticates the Evinced SDK once, before any test runs.
// Credentials are read from environment variables (.env) - never hard-coded.
require('dotenv').config();
const { setCredentials } = require('@evinced/js-playwright-sdk');

module.exports = async function globalSetup() {
  // evSaveFile does not create missing folders, so make sure the output dir exists.
  require('node:fs').mkdirSync('./evincedReports', { recursive: true });

  const { EVINCED_SERVICE_ID, EVINCED_API_KEY } = process.env;
  if (!EVINCED_SERVICE_ID || !EVINCED_API_KEY) {
    throw new Error('Missing EVINCED_SERVICE_ID / EVINCED_API_KEY. Copy .env.example to .env and fill them in.');
  }
  try {
    await setCredentials({ serviceId: EVINCED_SERVICE_ID, secret: EVINCED_API_KEY });
  } catch (error) {
    throw new Error(`Evinced SDK authorization failure: ${error.message}`);
  }
};
