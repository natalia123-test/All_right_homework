import { expect, test } from "@playwright/test";
import { addFirstProductAndOpenCart } from "../helpers/cart";

test("user can add the first product to the cart", async ({ page }) => {
  await addFirstProductAndOpenCart(page);
});

test(
  "user can remove a product from the cart",
  { tag: "@boundary" },
  async ({ page }) => {
    const { cartItem } = await addFirstProductAndOpenCart(page);
    await cartItem.getByRole("button", { name: "Remove", exact: true }).click();

    await expect(cartItem).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(
      0,
    );
  },
);
