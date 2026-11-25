import { expect, test } from "@playwright/test";

// Matches prices like "$12.34".
const usdPricePattern = /^\$\d+\.\d{2}$/;

test("standard user can view a correctly populated product catalog", async ({
  page,
}) => {
  await page.goto("/inventory.html");
  await expect(page).toHaveURL(/inventory\.html$/);
  await expect(page.getByText("Products", { exact: true })).toBeVisible();

  const productCards = page.locator('[data-test="inventory-item"]');
  await expect(productCards.first()).toBeVisible();
  const productCount = await productCards.count();

  // Check every product card.
  for (let index = 0; index < productCount; index += 1) {
    const card = productCards.nth(index);

    await expect(card.locator('[data-test="inventory-item-name"]')).not.toHaveText("");
    await expect(card.locator('[data-test="inventory-item-desc"]')).not.toHaveText("");
    await expect(
      card.locator('[data-test="inventory-item-price"]'),
    ).toHaveText(usdPricePattern);
    const image = card.locator("img");
    await expect(image).toBeVisible();
    // Wait for the image to load.
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      )
      .toBeGreaterThan(0);
    await expect(
      card.getByRole("button", { name: "Add to cart", exact: true }),
    ).toBeVisible();
  }
});


