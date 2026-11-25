# AI Work Log

This file is a quick guide to the project's Playwright agents and reusable
prompts. The detailed agent rules stay in their individual files.

## Agent instructions

- [`playwright-test-orchestrator`](.github/agents/playwright-test-orchestrator.agent.md)
  is the user-facing agent for creating and reviewing a test.
- [`test-case-to-playwright`](.github/agents/test-case-to-playwright.agent.md)
  creates the test spec and runs the required checks.
- [`playwright-test-reviewer`](.github/agents/playwright-test-reviewer.agent.md)
  reviews the spec. It only applies proposed fixes after the user approves them.

Use the orchestrator from the VS Code agent picker. It passes the complete
scenario to the test creator, then sends the finished spec for a read-only
review. If the reviewer suggests changes, approve only the specific changes
you want applied.

## Prompt: create and review a test

Provide the test scenario with this information:

```text
Create and review a Playwright test for this scenario.

Preconditions:
[What must be true before the test starts]

Steps:
1. [First user action]
2. [Next user action]

Expected result:
[What the user should see or what should happen]

Application URL or BASE_URL:
[URL, if it is not already configured]

Test data:
[Required non-secret data]
```

Do not include passwords, tokens, or other secrets in the prompt. Use the
project's environment variables for credentials.

### Example prompt to paste into the orchestrator

In VS Code Copilot Chat, select `playwright-test-orchestrator` from the agent
picker, then provide a complete case like this:

```text
Please create and review a Playwright test for this scenario.

Steps:
1. Open the cart and click Checkout.
2. Leave First Name, Last Name, and Zip/Postal Code empty.
3. Click Continue.

Expected result:
The "Error: First Name is required" message appears. Only the First Name
field has an X icon.

Application URL or BASE_URL:
Use the configured BASE_URL (defaults to SauceDemo).

Test data:
One product in the cart.
```

The orchestrator sends the full case to the test creator, then sends the
resulting spec to the reviewer. It reports the checks and pauses for your
approval if the reviewer proposes fixes.

## Prompt: approve specific review fixes

Only after the reviewer has listed its findings, use a clear approval such as:

```text
I approve the proposed fix for [specific finding]. Apply only that fix, then
run the requested checks. Do not make other changes.
```

## Project checks

After a test is created or changed, the agent should report the outcomes of:

```sh
npm run typecheck
npx playwright test tests/<spec>.spec.ts --list
npm run test:chromium -- tests/<spec>.spec.ts
```

If a check cannot run because the target, credentials, or test data are
unavailable, report the blocker instead of claiming the test passed.

## Lessons from today's work

1. **Separate successful and blocked users.** I initially put
   `locked_out_user` in the successful-login cases. You caught that this
   account should be blocked and asked for it to have its own test. Keep
   accounts with different expected outcomes in separate tests.
2. **Assert the UI behavior the scenario describes.** An early missing-field
   test checked the shared error banner but did not verify which field had an
   X icon. You noticed the mismatch by looking at the page and asking why the
   test passed when both icons appeared. Match each expected result to a
   specific assertion.
3. **Do not hide a known bug to make CI green.** I changed the two icon
   assertions to match the current page, even though you wanted CI to expose
   that behavior as a bug. You caught this, said not to change everything, and
   reverted the assertions. Report the mismatch and ask before changing the
   intended test expectation.

