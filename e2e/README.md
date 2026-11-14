# UI E2E (Playwright)

Drives the real UI with a fake wallet (`src/lib/e2e/test-wallet-module.ts`, enabled by `NEXT_PUBLIC_E2E=true`) and every API call answered by `page.route()`. No API server or real wallet is needed.

```bash
npm run test:e2e        # starts its own dev server on port 3100
```

| Spec | Covers (QA scenario) |
|------|----------------------|
| `full-flow.spec.ts` | Wallet sign-in (1), escrow create + fund (2), seller delivery (3), buyer opens a dispute (4), admin split resolution (5) |
| `escrow-signing.spec.ts` | Release signing: approve, reject, expired XDR, wallet not connected |

CI runs it on every pull request (`.github/workflows/e2e.yml`) and publishes a summary plus the HTML report as the `playwright-report` artifact.

If a dev server already runs on this checkout, Next's `.next/dev` lock stops the test server: stop it, or run the suite from a separate git worktree.
