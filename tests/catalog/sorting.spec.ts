import { expect, test } from "@playwright/test";

// Remove currency symbols before comparing prices.
const priceValue = (price: string) => Number(price.replace(/[$,]/g, ""));

test.beforeEach(async ({ page }) => {
  await page.goto("/inventory.html");
  await expect(page).toHaveURL(/inventory\.html$/);
  await expect(page.getByText("Products", { exact: true })).toBeVisible();
});

test("products sort by name from A to Z", async ({ page }) => {
  const sortControl = page.getByRole("combobox", { name: "Sort products" });

  await expect(sortControl).toBeVisible();
  await sortControl.selectOption("az");
  await expect(sortControl).toHaveValue("az");

  const productNames = page.locator('[data-test="inventory-item-name"]');
  await expect(productNames.first()).toBeVisible();
  // Poll until each name is in ascending order.
  await expect
    .poll(async () => {
      const names = await productNames.allTextContents();
      return names
        .slice(1)
        .every((name, index) => names[index]!.localeCompare(name) <= 0);
    })
    .toBe(true);
});

test("products sort by name from Z to A", async ({ page }) => {
  const sortControl = page.getByRole("combobox", { name: "Sort products" });

  await expect(sortControl).toBeVisible();;
  await sortControl.selectOption("za");
  await expect(sortControl).toHaveValue("za");

  const productNames = page.locator('[data-test="inventory-item-name"]');
  await expect(productNames.first()).toBeVisible();
  // Poll until each name is in descending order.
  await expect
    .poll(async () => {
      const names = await productNames.allTextContents();
      return names
        .slice(1)
        .every((name, index) => names[index]!.localeCompare(name) >= 0);
    })
    .toBe(true);
});

test("products sort by price from low to high", async ({ page }) => {
  const sortControl = page.getByRole("combobox", { name: "Sort products" });
  const productPrices = page.locator('[data-test="inventory-item-price"]');

  await expect(productPrices.first()).toBeVisible();
  const initialPrices = await productPrices.allTextContents();
  // Sort numbers, not price strings.
  const expectedAscending = [...initialPrices].sort(
    (a, b) => priceValue(a) - priceValue(b),
  );

  await expect(sortControl).toBeVisible();
  await sortControl.selectOption("lohi");
  await expect(sortControl).toHaveValue("lohi");
  await expect(productPrices).toHaveText(expectedAscending);
});

test("products sort by price from high to low", async ({ page }) => {
  const sortControl = page.getByRole("combobox", { name: "Sort products" });
  const productPrices = page.locator('[data-test="inventory-item-price"]');

  await expect(productPrices.first()).toBeVisible();
  const initialPrices = await productPrices.allTextContents();
  // Reverse the numeric comparison for high-to-low order.
  const expectedDescending = [...initialPrices].sort(
    (a, b) => priceValue(b) - priceValue(a),
  );

  await expect(sortControl).toBeVisible();
  await sortControl.selectOption("hilo");
  await expect(sortControl).toHaveValue("hilo");
  await expect(productPrices).toHaveText(expectedDescending);
});
