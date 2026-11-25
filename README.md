# Playwright + TypeScript test suite

This repository contains browser end-to-end tests for SauceDemo and API tests
for the separate Restful Booker demo service.

## Requirements

- Node.js 20 or newer
- npm

## Setup

```sh
npm ci
npx playwright install chromium
cp .env.example .env
```

Edit `.env` and replace the `SAUCEDEMO_PASSWORD` placeholder with the password
for the SauceDemo test accounts. `BASE_URL` defaults to
`https://www.saucedemo.com`; set it in `.env` only when testing another
deployment. `.env` is ignored by Git. Never commit it or paste credentials into
test code.

The usernames are test data, not environment variables:
`standard_user`, `problem_user`, `performance_glitch_user`, `error_user`, and
`visual_user` are tested as successful logins. `locked_out_user` has a separate
test that expects login to be blocked. All use `SAUCEDEMO_PASSWORD`.

### How browser login is shared

The authenticated browser tests (catalog, sorting, cart, and checkout) need a
signed-in user. Before a browser test run, Playwright runs
[`tests/global.setup.ts`](tests/global.setup.ts). It opens Chromium, signs in
as `standard_user` using `SAUCEDEMO_PASSWORD`, checks that the inventory page
opened, and saves the browser session to the ignored file
`playwright/.auth/standard-user.json`. The authenticated project loads this
saved state, so its tests do not each repeat the login steps.

The login tests use a separate, unauthenticated browser project. Each login
test starts without a saved session and performs its own login, so it can check
the different usernames and login errors. Both the setup and login tests use
the [`LoginPage`](pages/login.page.ts) page object for login actions and
locators.

Locally, the password is read from `.env`. GitHub Actions reads it from the
repository secret named `SAUCEDEMO_PASSWORD`.

The standalone API command (`npm run test:api`) uses
[`playwright.api.config.ts`](playwright.api.config.ts), so it does not run the
SauceDemo global setup or require the SauceDemo password.

## Page objects and helpers

### Page object model (POM)

A page object keeps selectors and common actions for a page in one class, so
tests can use readable methods instead of repeating locator details. This
project currently has one page object:

- [`LoginPage`](pages/login.page.ts) contains the username, password, login
  button, error-message, close-button, and field-icon locators. It also
  provides methods such as `goto()`, `login()`, and `submit()`.

The login tests and global setup use this class. Catalog, sorting, cart, and
checkout tests currently use Playwright locators directly; they do not have
separate page objects yet.

### Shared cart helper

[`tests/helpers/cart.ts`](tests/helpers/cart.ts) exports
`addFirstProductAndOpenCart(page)`. It opens the inventory, adds the first
product, checks the cart badge and item, opens the cart, and returns the
selected item's locator and price. The cart and checkout tests reuse this
helper so they start with the same known cart setup without duplicating those
steps.

## Running tests

Browser tests run in Chromium. API tests use Playwright's HTTP request fixture
and run separately against the [Restful Booker API](https://restful-booker.herokuapp.com/apidoc/).

Run the browser suite:

```sh
npm run test:chromium
```

This runs the authenticated browser tests and the unauthenticated login tests.
No manual browser login is needed.

Run the API suite:

```sh
npm run test:api
```

API tests do not use SauceDemo login or `SAUCEDEMO_PASSWORD`. The lifecycle
test uses Restful Booker's public demo credentials (`admin` / `password123`)
with `POST /auth`, which returns a token. The test sends that token as the
`Cookie: token=...` header for the protected booking update and delete
requests. This token is only for Restful Booker; it is unrelated to SauceDemo
login. The test creates a booking, updates it, deletes it, and checks that it
is no longer found. A `finally` cleanup attempts to delete the booking if an
earlier step fails. The other API tests check invalid authentication
credentials and a request for a nonexistent booking.

Useful commands:

```sh
npm run test:list                          # List discovered tests
npm run test:chromium                      # Run browser tests
npm run test:api                           # Run API tests
npm run test:chromium -- --grep @negative  # Run negative browser tests
npm run test:api -- --grep @negative       # Run negative API tests
npm run test:ui                            # Open Playwright's interactive runner
npm run test:headed                        # Run browser tests with a visible browser
npm run test:debug                         # Open the Playwright inspector
npm run test:report                        # Open the browser HTML report
npx playwright show-report playwright-api-report # Open the API HTML report
npm run typecheck                          # Type-check configs and tests
```

## Current test coverage

The current specs contain **17 browser tests** and **3 API tests**:

| Area | Covered now |
| --- | --- |
| Login | Five successful users; blocked `locked_out_user`; missing username and missing password |
| Catalog | Product names, descriptions, price format, loaded images, and Add to Cart buttons |
| Sorting | Names A–Z and Z–A; prices low–high and high–low |
| Cart | Add the first product and verify the cart; remove the product and verify the empty-cart badge |
| Checkout | Complete checkout with one product, verify order details and totals, finish and return home; empty-form first-name validation |
| Booking API | Authenticate, create, update, and delete a booking; reject bad credentials; return 404 for a nonexistent booking |

The latest browser CI run on 2026-11-25 had **15 passing tests and 2 failing
login tests**. Those two tests expect the X icon on the filled field to be
hidden, but the current SauceDemo page shows an X beside both fields after a
missing-field error. This is a behavior mismatch for review; do not change the
assertions just to make CI green without deciding whether the UI behavior or
test expectation should change. The checkout icon issue below is not currently
reported as a test failure: its existing test expects all three icons.

## Known bug reports

### Bug 1: Login marks the username field invalid when the password is missing

- **Steps:**
  1. Open the SauceDemo login page.
  2. Enter `standard_user` as the username and leave the password empty.
  3. Click **Login**.
- **Expected result:** The password-required message appears, and only the
  password field has an X icon.
- **Actual result:** The password-required message appears, but both username
  and password fields have X icons.

### Bug 2: Login marks the password field invalid when the username is missing

- **Steps:**
  1. Open the SauceDemo login page.
  2. Leave the username empty and enter the SauceDemo password.
  3. Click **Login**.
- **Expected result:** The username-required message appears, and only the
  username field has an X icon.
- **Actual result:** The username-required message appears, but both username
  and password fields have X icons.

### Bug 3: Checkout marks every field invalid when the first name is missing

- **Summary:** Submitting the empty checkout form shows X icons beside the
  first name, last name, and postal code fields, although the error identifies
  the first name as required.
- **Steps:**
  1. Add a product to the cart and open the cart.
  2. Click **Checkout**.
  3. Leave the first name, last name, and postal code empty.
  4. Click **Continue**.
- **Expected result:** The “First Name is required” error appears, and only the
  first name field has an X icon.
- **Actual result:** The “First Name is required” error appears, and all three
  fields have X icons.
- **Test note:** The current checkout test expects all three icons, so it does
  not currently detect this bug.

### Useful next coverage

These are gaps in the current specs, not a requirement to test every possible
combination:

- **Login:** wrong username/password combinations and both fields empty at once.
- **Catalog/navigation:** product detail pages and menu/logout flows.
- **Cart:** add multiple products, remove one while another remains, and verify
  cart contents after navigating away or reloading.
- **Checkout:** validate missing last name and postal code independently; test
  checkout with multiple products and verify the combined totals.
- **Booking API:** retrieve an existing booking, test booking filters, validate
  invalid create/update payloads, and check that update/delete requests without
  a token are rejected.

## GitHub Actions

1. Add the `SAUCEDEMO_PASSWORD` repository secret under **Settings → Secrets
   and variables → Actions**. The browser tests need it; API tests do not.
2. Push a commit to GitHub. The **Tests** workflow runs the browser and API
   jobs. To start it manually, open **Actions → Tests → Run workflow**.
3. Check job results under **Actions → Tests**. When the run finishes, download
   `browser-test-report` and `api-test-report` from its **Artifacts** section.
   Reports upload even if tests fail.

## Generate and review a test from a written case

In VS Code Copilot Chat, select the `playwright-test-orchestrator` agent from
the agent picker and describe your scenario and expected result. Include the
preconditions, steps, application URL (or `BASE_URL`), and any required test
data. The orchestrator first delegates creation to `test-case-to-playwright`,
then delegates a read-only review to `playwright-test-reviewer`.

The helper agents are intentionally hidden from the picker; the orchestrator
invokes them as subagents. If review finds proposed fixes, the orchestrator
shows them and waits for your explicit approval before applying any changes.
After test-code changes, it runs type-checking, test discovery, and the focused
Chromium test when the target and required data are available; otherwise it
reports what prevented execution.

For example:

```text
Preconditions: I am signed in as standard_user.
Steps: Add one product to the cart, open the cart, and start checkout.
Expected result: The checkout overview shows the selected product and its price.
Application URL: Use the configured BASE_URL (defaults to SauceDemo).
Test data: Use the existing test product; no personal data is needed.
```

## Adding tests

Create `*.spec.ts` files under `tests/` and import `test` and `expect` from
`@playwright/test`. Prefer user-visible locators and independent tests. Use
Playwright fixtures for shared setup, retrieve credentials through
`getRequiredEnv` from `config/env.ts`, and keep credentials out of source control.
Configuration and environment conventions are documented in [`config/`](config/).
