import { expect, test } from "@playwright/test";
import { addFirstProductAndOpenCart } from "../helpers/cart";

test("user can complete checkout and review order details", async ({
  page,
}) => {
  const { cartItem, productPrice } = await addFirstProductAndOpenCart(page);

  await page.getByRole("button", { name: "Checkout", exact: true }).click();
  await expect(page).toHaveURL(/checkout-step-one\.html$/);
  await expect(
    page.getByText("Checkout: Your Information", { exact: true }),
  ).toBeVisible();

  const firstName = page.getByPlaceholder("First Name");
  const lastName = page.getByPlaceholder("Last Name");
  const postalCode = page.getByPlaceholder("Zip/Postal Code");
  await firstName.fill("Alex");
  await lastName.fill("Taylor");
  await postalCode.fill("12345");
  await expect(firstName).toHaveValue("Alex");
  await expect(lastName).toHaveValue("Taylor");
  await expect(postalCode).toHaveValue("12345");

  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/checkout-step-two\.html$/);
  await expect(
    page.getByText("Checkout: Overview", { exact: true }),
  ).toBeVisible();

  await expect(cartItem).toHaveCount(1);
  await expect(
    cartItem.locator('[data-test="inventory-item-price"]'),
  ).toHaveText(productPrice);
  await expect(page.getByText("Payment Information:")).toBeVisible();
  await expect(page.getByText("SauceCard #31337")).toBeVisible();
  await expect(page.getByText("Shipping Information:")).toBeVisible();
  await expect(page.getByText("Free Pony Express Delivery!")).toBeVisible();

  // Check the item total, 8% tax, and final total.
  const itemTotal = Number(productPrice.replace(/[$,]/g, ""));
  const tax = (itemTotal * 0.08).toFixed(2);
  const total = (itemTotal + Number(tax)).toFixed(2);
  await expect(page.getByText(`Item total: ${productPrice}`)).toBeVisible();
  await expect(page.getByText(`Tax: $${tax}`)).toBeVisible();
  await expect(page.getByText(`Total: $${total}`)).toBeVisible();

  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(page).toHaveURL(/checkout-complete\.html$/);
  await expect(page.locator('[data-test="complete-header"]')).toHaveText(
    "Thank you for your order!",
  );
  await expect(page.locator('[data-test="complete-text"]')).toHaveText(
    "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
  );
  const backHomeButton = page.getByRole("button", {
    name: "Back Home",
    exact: true,
  });
  await expect(backHomeButton).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Generate PDF order", exact: true }),
  ).toBeVisible();

  await backHomeButton.click();
  await expect(page).toHaveURL(/inventory\.html$/);
  await expect(page.getByText("Products", { exact: true })).toBeVisible();
});

test(
  "checkout requires a first name when continuing with empty fields",
  { tag: ["@negative", "@boundary"] },
  async ({ page }) => {
    await addFirstProductAndOpenCart(page);
    await page.getByRole("button", { name: "Checkout", exact: true }).click();
    await expect(
      page.getByText("Checkout: Your Information", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.locator('[data-test="error"]')).toHaveText(
      "Error: First Name is required",
    );

    for (const field of ["firstName", "lastName", "postalCode"]) {
      await expect(
        page.locator(
          `input[data-test="${field}"] + svg[data-icon="circle-xmark"]`,
        ),
      ).toBeVisible();
    }
  },
);
