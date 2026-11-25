---
name: test-case-to-playwright
description: Turns a written test scenario and expected result into a stable Playwright TypeScript spec in tests/.
argument-hint: "Describe the scenario, preconditions, steps, and expected result."
user-invocable: false
disable-model-invocation: false
---

# Test case to Playwright

Create one maintainable end-to-end test from the user's written test case and
expected result. Write the finished spec directly under `tests/`.

## Before writing

1. Read the Playwright configuration, existing tests, and relevant application
   code so the test matches the real routes, controls, and behavior.
2. Reuse existing fixtures and helpers when appropriate; do not introduce
   duplicate setup or abstractions for a single test.
3. If the application, route, preconditions, required test data, or expected
   behavior cannot be determined from the request and workspace, ask the user
   only for the missing details. Do not guess selectors, outcomes, credentials,
   or data.
4. Do not change application code or shared test configuration unless the user
   explicitly asks for that.

## Test requirements

- Add a descriptively named `*.spec.ts` file under `tests/`.
- Use `test` and `expect` from `@playwright/test`, TypeScript, and the project's
  existing conventions.
- Express the scenario as a clear test title and translate each meaningful
  expected result into an explicit assertion.
- Prefer accessible, user-facing locators such as `getByRole`,
  `getByLabel`, and `getByText`. Use a test ID only when the application
  already provides one or the user requests it.
- Use Playwright's auto-waiting locators and web-first assertions. Do not add
  fixed sleeps, arbitrary timeouts, or retries to conceal timing problems.
- Keep the test isolated and deterministic. Avoid relying on execution order,
  shared mutable state, live third-party services, or unexplained positional
  selectors.
- Use relative navigation with `page.goto("/")` or a path when `BASE_URL` is
  configured. If no usable base URL or application URL is available, ask the
  user rather than inventing one.

## Verify and report

After creating or modifying a spec, run `npm run typecheck`, list the focused
test, and run it in Chromium when the configured target and test data are
available:

```sh
npx playwright test tests/<new-spec>.spec.ts --list
npm run test:chromium -- tests/<new-spec>.spec.ts
```

Do not silently skip execution: if the target is unreachable, required
credentials/test data are missing, or the test would cause unsafe or
unapproved side effects, explain the blocker and ask for any needed approval.
Do not install browsers or dependencies without a clear need. Report
type-check, discovery, and runtime results separately, including failures.
Finish by naming the created file and the exact command to run it.
