import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  outputDir: './screenshots/artifacts',
  snapshotDir: './screenshots/snapshots',
  timeout: 15_000,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'screenshots/report', open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:1422',
    viewport: { width: 1100, height: 720 },
    colorScheme: 'dark',
    screenshot: 'only-on-failure',
    actionTimeout: 5_000,
  },

  projects: [
    {
      name: 'bastionorbit',
      testMatch: 'tests/screenshots.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'interactions',
      testMatch: 'tests/interactions.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 1422,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
