# Playwright + TypeScript test scaffold

This repository is prepared for browser end-to-end tests with Playwright and
TypeScript. Test files belong in `tests/`; no application-specific tests are
included yet.

## Requirements

- Node.js 20 or newer
- npm

## Setup

```sh
npm install
npx playwright install chromium
```

The local `.env` file contains the SauceDemo URL and credentials and is ignored
by Git. If setting up a fresh checkout, copy `.env.example` to `.env` and set
the credentials there. Do not commit `.env` or put credentials in test code.
Playwright signs in once during global setup before each test run and saves an
ignored storage state for authenticated tests to reuse. Login tests run in a
separate unauthenticated Chromium project.

## Running tests

Browser tests run only in Chromium. API tests run separately against the
[Restful Booker API](https://restful-booker.herokuapp.com/apidoc/).

Run the complete suite in Chromium:

```sh
npm run test:chromium
```

Override `BASE_URL` in `.env` (or in the command environment) when targeting a
different deployment.

Useful commands:

```sh
npm run test:list   # List discovered tests without running them
npm run test:chromium # Run tests in Chromium only
npm run test:api      # Run Restful Booker API tests
npm run test:ui     # Open Playwright's interactive test runner
npm run test:headed # Run with a visible browser
npm run test:debug  # Debug tests with the Playwright inspector
npm run test:report # Open the latest HTML report
npm run typecheck   # Type-check the config and tests
npm test -- --grep @negative # Run negative tests
npm test -- --grep @boundary # Run boundary tests
```

## GitHub Actions

Tests run on every push. Add the `SAUCEDEMO_PASSWORD` repository secret under
**Settings → Secrets and variables → Actions** for the browser tests. Download
the browser and API reports from the workflow run's artifacts.

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
Preconditions: I am signed in as a standard user.
Steps: Open Settings and change the display name to "Alex".
Expected result: The new display name is shown in the account menu.
Application URL: http://localhost:3000
```

## Adding tests

Create `*.spec.ts` files under `tests/` and import `test` and `expect` from
`@playwright/test`. Prefer user-visible locators and independent tests. Use
Playwright fixtures for shared setup, retrieve credentials through
`getRequiredEnv` from `config/env.ts`, and keep credentials out of source control.
Configuration and environment conventions are documented in [`config/`](config/).
