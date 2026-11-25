import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByPlaceholder("Username");
    this.passwordInput = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  get loginError(): Locator {
    return this.page.locator('[data-test="error"]');
  }

  get loginErrorCloseButton(): Locator {
    return this.loginError.locator('[data-test="error-button"]');
  }

  get usernameFieldIcon(): Locator {
    return this.page.locator(
      'input[data-test="username"] + svg[data-icon="circle-xmark"]',
    );
  }

  get passwordFieldIcon(): Locator {
    return this.page.locator(
      'input[data-test="password"] + svg[data-icon="circle-xmark"]',
    );
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }
}
