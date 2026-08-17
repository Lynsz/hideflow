import { defineConfig, devices } from "@playwright/test";

const localBaseUrl = "http://127.0.0.1:3100";
const externalBaseUrl =
  process.env.PLAYWRIGHT_TEST_BASE_URL?.trim() || undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: externalBaseUrl ?? localBaseUrl,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: process.env.CI
          ? "npm run start -- --hostname 127.0.0.1 --port 3100"
          : "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
        env: {
          ...process.env,
          NEXT_PUBLIC_SUPABASE_URL:
            process.env.NEXT_PUBLIC_SUPABASE_URL ??
            "https://e2e-placeholder.supabase.co",
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "e2e-public-key",
          SITE_URL: process.env.SITE_URL ?? localBaseUrl,
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: localBaseUrl,
      },
});
