import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const isDebug = process.env.DEBUG === 'true';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : isDebug ? 2 : 0,
  workers: isCI ? 1 : 8,
  reporter: isDebug ? 'html' : 'line',
  timeout: isDebug ? 60000 : 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: isDebug ? 'on-first-retry' : 'off',
    video: isDebug ? 'retain-on-failure' : 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120000,
    env: {
      NEXT_PUBLIC_TEST_MODE: 'true',
    },
  },
});
