import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const systemChromium = '/usr/bin/chromium';
const browserPath = process.env.CHROMIUM_PATH || (existsSync(systemChromium) ? systemChromium : undefined);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321/comarc-exam-lab/',
    trace: 'retain-on-failure',
    launchOptions: browserPath ? { executablePath: browserPath } : undefined,
  },
  webServer: {
    command: 'npm run dev',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    url: 'http://127.0.0.1:4321/comarc-exam-lab/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
