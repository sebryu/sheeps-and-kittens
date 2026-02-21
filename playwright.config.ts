import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration for Sheeps & Kittens.
 *
 * Tests run against the Expo web build served locally.
 * Works in: Claude Cloud, GitHub Actions, Expo EAS, local dev.
 *
 * Usage:
 *   bun run test:e2e          # build web + run tests
 *   bunx playwright test      # run tests (assumes web server running)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile viewport for a realistic React Native Web experience
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'bunx expo start --web --no-dev --port 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
