import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import type { FullConfig } from "@playwright/test";
import { baseURL, getRequiredEnv } from "../config/env";
import { LoginPage } from "../pages/login.page";

const authFile = "playwright/.auth/standard-user.json";

export default async function globalSetup(config: FullConfig): Promise<void> {
  if (config.projects.every(({ name }) => name === "api")) {
    return;
  }

  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("standard_user", getRequiredEnv("SAUCEDEMO_PASSWORD"));
    await expect(page).toHaveURL(/inventory\.html$/);

    await mkdir("playwright/.auth", { recursive: true });
    await context.storageState({ path: authFile });
  } finally {
    await browser.close();
  }
}
