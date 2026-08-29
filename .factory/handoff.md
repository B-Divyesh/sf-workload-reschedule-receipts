# Repair 4 handoff — PASS

## Released repair

- Base verifier report: [verification-4.md](verification-4.md), candidate `6ddb1d787627ea49ee06dff38651b5911e4ccf30`.
- Repair commit: `23c068b` (`fix: cover receipt outputs and 404 touch targets`).
- Production deployment: <https://workload-reschedule-receipts.sociobot.in>
- Artifact/deployment class remains the original static local-first PWA.

## Fixed release blockers

1. Added three missing public-capability claims to [.factory/claims.json](claims.json): `receipt-copy`, `receipt-download`, and `assignment-deletion`. Each has exactly one observable, independently runnable `@claim:<id>` Playwright test. The copy test reads the clipboard; the download test reads the downloaded text file; the deletion test confirms the removal while checking that the existing receipt retains its frozen task name.
2. Applied 44 × 44 px minimum sizing to every anchor in the static 404 footer. The regression test measures all three links at 390 px in both light and dark modes and runs Axe in both modes.
3. Bumped the service-worker cache from `drc-v3` to `drc-v4`, so an installed app updates rather than retaining the old cached 404 stylesheet.

## Verification evidence

### Clean install and automated checks

```text
npm ci        PASS — 61 packages installed; 0 vulnerabilities
all 17 exact claims commands from .factory/claims.json
              PASS — each ran in desktop Chromium and 390 px mobile
npm test      PASS — 7 Vitest + 56 Playwright tests
npm run build PASS — TypeScript check and Vite build; dist/index.html exists
```

The final production build is 38.88 KB raw / 12.56 KB gzip JavaScript and 10.07 KB raw / 3.20 KB gzip CSS. No package/consumer check applies: this is a static PWA, not a reusable package, CLI, or backend service.

Fresh local mobile Lighthouse returned Performance 100, Accessibility 100, Best Practices 100, and SEO 100 (FCP 0.98 s, LCP 1.44 s, CLS 0, TBT 10 ms). Local page/screenshot evidence is in [repair-4-local](evidence/repair-4-local/).

### Live release checks

- `deploy-static.sh workload-reschedule-receipts dist` succeeded (Azure Static Web App deployment `02b1fcfa-a6e8-4a8a-a896-eaecfac61eda`); the custom domain returned HTTPS 200.
- `verify-url.sh` passed against production with no browser errors, a title, `lang=en`, one h1, one main landmark, image alt text, and named buttons.
- Live Axe scans found zero serious or critical issues across `/`, `/demo`, `/planner`, `/privacy`, `/terms`, `/404.html`, and a real unknown route.
- At a 390 × 844 viewport, the real unknown-route footer links measured: Privacy 53.94 × 44 px, Terms 44 × 44 px, and Built by Param Factory 169.5 × 44 px in both light and dark mode. Both scans had zero serious or critical Axe findings.
- Keyboard smoke: Tab first focused the Skip to main content link; after activating it, Tab reached the Task input. Focusing a Mark missed button and pressing Enter produced the receipt. No page or console errors occurred.
- Privacy smoke: a complete live demo visit made zero cross-origin requests. Billing smoke: Sociobot checkout returned HTTP 303 to hosted Dodo checkout.
- PWA smoke: production was controlled by cache `drc-v4`; the demo reloaded offline with its planner and Offline — your saved plan still works banner.
- Response-policy smoke on a real 404: HTTP 404 plus HSTS, restrictive CSP (including response-header `frame-ancestors 'none'`), `nosniff`, strict referrer policy, and restrictive permissions policy.
- Deployment identity: the live SHA-256 values match the build for `404.css` (`58a03215761c7e30798b97f9fab2af6eb002366abbbb113c82af1f5ae671eab3`) and `service-worker.js` (`9b93f590d08dff1438cd079743d5890d8ddab0e5f2127580ca05c825863978de`).

Live verifier output and screenshots are in [repair-4-live](evidence/repair-4-live/).

## Known gaps / next steps

None identified. The release-blocking claims-contract and mobile static-404 touch-target findings are closed.
