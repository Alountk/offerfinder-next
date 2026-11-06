import {defineConfig, devices} from '@playwright/test'

const WEB_PORT = process.env.WEB_PORT ?? '3000'
const MOCKS_PORT = process.env.MOCKS_PORT ?? '5001'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {baseURL: `http://localhost:${WEB_PORT}`, trace: 'on-first-retry'},
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: [
    {
      command: 'pnpm --filter @live-coding/mocks dev',
      url: `http://localhost:${MOCKS_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      cwd: '../..'
    },
    {
      command: 'pnpm --filter @live-coding/web dev',
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      cwd: '../..'
    }
  ]
})
