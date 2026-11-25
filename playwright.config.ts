import { defineConfig, devices } from "@playwright/test";
import { baseURL } from "./config/env";

const authFile = "playwright/.auth/standard-user.json";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global.setup.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-authenticated",
      testIgnore: ["**/auth/**/*.spec.ts", "**/api/**/*.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
    },
    {
      name: "chromium-login",
      testMatch: "**/auth/**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: "api",
      testMatch: "**/api/**/*.spec.ts",
      use: {
        baseURL: "https://restful-booker.herokuapp.com",
        extraHTTPHeaders: {
          Accept: "application/json",
        },
      },
    },
  ],
});
