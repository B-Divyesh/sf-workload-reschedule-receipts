# Polish 3 repair handoff

**Work order:** `workload-reschedule-receipts-polish-3-retry1`

**Reviewed candidate:** `e2f7952af39f4bfbf755f8aa5296534bca95e5a8`

**Review commit:** `0ccfd30172ee771bfec444a97c9c328e660066c9`

**Repair commits:** `0c51982`, `700a661`

**Deployment:** `fbfcb674-bf7b-4678-b3dd-7cd8e7976487`

**Live URL:** <https://workload-reschedule-receipts.sociobot.in>

## What changed

- Closed every `F-1-*`, `F-2-*`, and `F-3-*` finding. The complete mapping is in `.factory/polish-3.md`.
- Made the first action open `/?demo=1` directly. Query and `/demo` entry now share the same isolated in-memory sample, banner, reset, and clean exit.
- Removed the nested complementary landmark and require zero Axe violations across all supported routes in light and dark modes.
- Replaced “task” with “assignment” in visitor-facing copy, claims, and tests. Rewrote every flagged vague or metaphorical heading.
- Strengthened six deficient claim tests to prove schedule changes, busy-time avoidance, full backup restoration, privacy, paid capacity, and the Dodo redirect.
- Added a manifest integrity test that requires one and only one tagged browser test for every claim.
- Kept real SPA routes, Back/Forward focus and announcements, route metadata, legal links, and the styled HTTP 404 under regression coverage.
- Made the mobile order intentional: the empty real planner starts with inputs, while the populated demo starts with its receipt and revised plan.
- Updated the service-worker cache version, README, demo record, copy audit, visual thesis, and catalog description.

## Exact verification

- Fresh clone: `/tmp/tmp.PPgYEp8nnf/repo` at `700a661`.
- `npm ci`: PASS, 61 packages, 0 vulnerabilities.
- Every one of the 17 literal `.factory/claims.json` commands: PASS in desktop Chromium and 390 px mobile Chromium.
- `npm test`: PASS, 9 unit tests and 62 browser tests.
- `npm run build`: PASS; `dist/index.html` exists.
- Initial bundle: 39.29 KB JavaScript / 12.62 KB gzip; 10.08 KB CSS / 3.21 KB gzip.
- Local Playwright Axe integration: zero violations on `/`, `/demo`, `/planner`, `/privacy`, `/terms`, and `/404.html`, including dark mode.
- Local `verify-url.sh`: PASS on `/` and `/?demo=1`; title, `lang=en`, one h1, main, alt text, labelled controls, and zero console errors.
- Local mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 903 ms, LCP 1,355 ms, TBT 0 ms, CLS 0.
- Deployment command: `/opt/fleet/lib/deploy-static.sh workload-reschedule-receipts dist`: PASS.
- Cold production `verify-url.sh`: PASS on `/` and `/?demo=1`; zero console errors and zero unlabeled controls.
- Cold production Playwright suite: PASS, 62/62 in desktop and mobile.
- Cold production Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 902 ms, LCP 1,052 ms, TBT 0 ms, CLS 0.
- Cold production unknown route: `GET /no-such-polish-3-route` returned HTTP 404 with the correct title, metadata, and “This page was not found” h1.
- Live checkout: Sociobot returned a 3xx redirect whose host was `checkout.dodopayments.com`.
- Live/local artifact comparison: JavaScript, CSS, service worker, and 404 CSS matched byte-for-byte. SHA-256: `f517e3027d3ff75cf823ae76a9c7a60739e7081a32a833d2ede44d85ae94dd41`, `2d52a32c7de0beceb541841397d60381b0e0f976e6ba1fb11dcd062bd1285c57`, `c3c313f2b43c8cc7fb6d629d03dbece180246a52af4cb06f606fb0d233e4cff6`, and `58a03215761c7e30798b97f9fab2af6eb002366abbbb113c82af1f5ae671eab3`.

Evidence is under `.factory/evidence/polish-3-local/` and `.factory/evidence/polish-3-live/`. The live mobile landing, demo, and 404 screenshots were visually inspected after deployment.

## Run and verify

```sh
npm ci
npm test
npm run build
BASE_URL=https://workload-reschedule-receipts.sociobot.in npm run test:e2e
```

## Known gaps and next steps

None. No review finding or known product gap remains in this work order.
