import { expect, test } from "@playwright/test";
import { getRequiredEnv } from "../../config/env";
import { successfulSauceDemoUsernames } from "../../config/test-data/saucedemo-users";
import { LoginPage } from "../../pages/login.page";

for (const username of successfulSauceDemoUsernames) {
  test(`${username} signs in and sees the inventory products heading`, async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(username, getRequiredEnv("SAUCEDEMO_PASSWORD"));

    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(page.getByText("Products", { exact: true })).toBeVisible();
  });
}

test(
  "locked_out_user is blocked from signing in",
  { tag: ["@negative"] },
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(
      "locked_out_user",
      getRequiredEnv("SAUCEDEMO_PASSWORD"),
    );

    await expect(loginPage.loginError).toHaveText(
      "Epic sadface: Sorry, this user has been locked out.",
    );
  },
);

test(
  "password is required when only username is entered",
  { tag: ["@negative", "@boundary"] },
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.enterUsername("standard_user");
    await loginPage.submit();

    await expect(loginPage.loginError).toHaveText(
      "Epic sadface: Password is required",
    );
    await expect(loginPage.loginErrorCloseButton).toBeVisible();
    await expect(loginPage.passwordFieldIcon).toBeVisible();
    await expect(loginPage.usernameFieldIcon).toBeHidden();
  },
);

test(
  "username is required when only password is entered",
  { tag: ["@negative", "@boundary"] },
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.enterPassword(getRequiredEnv("SAUCEDEMO_PASSWORD"));
    await loginPage.submit();

    await expect(loginPage.loginError).toHaveText(
      "Epic sadface: Username is required",
    );
    await expect(loginPage.loginErrorCloseButton).toBeVisible();
    await expect(loginPage.usernameFieldIcon).toBeVisible();
    await expect(loginPage.passwordFieldIcon).toBeHidden();
  },
);
