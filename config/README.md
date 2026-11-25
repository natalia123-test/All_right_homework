# Test configuration

Shared Playwright settings live in [`../playwright.config.ts`](../playwright.config.ts).
Set `BASE_URL` when running tests to target the application under test, for example:

```sh
BASE_URL=http://localhost:3000 npm test
```

Add environment-specific test configuration here once the target application's
environments and requirements are known. Do not commit credentials or secrets.
