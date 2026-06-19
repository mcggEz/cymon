import { defineConfig, devices } from '@playwright/test'

// E2E tests run against the already-running dev servers
// (frontend :5173 proxies /api to the backend :4000).
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 10000 },
  // Serial: the local dev backend + Supabase /me can't take many concurrent
  // logins at once (transient /me failures would sign the session out).
  // Production (serverless backend) is unaffected.
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
