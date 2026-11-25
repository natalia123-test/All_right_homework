import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export async function addFirstProductAndOpenCart(page: Page) {
  await page.goto("/inventory.html");

  const firstProduct = page.locator('[data-test="inventory-item"]').first();
  const productName = await firstProduct
    .locator('[data-test="inventory-item-name"]')
    .innerText();
  const productPrice = await firstProduct
    .locator('[data-test="inventory-item-price"]')
    .innerText();

  await firstProduct
    .getByRole("button", { name: "Add to cart", exact: true })
    .click();

  await expect(
    firstProduct.getByRole("button", { name: "Remove", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(
    "1",
  );
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL(/cart\.html$/);

  const cartItem = page.locator('[data-test="inventory-item"]').filter({
    has: page.getByText(productName, { exact: true }),
  });
  await expect(cartItem).toHaveCount(1);
  await expect(
    cartItem.locator('[data-test="inventory-item-name"]'),
  ).toHaveText(productName);

  return { cartItem, productPrice };
}
