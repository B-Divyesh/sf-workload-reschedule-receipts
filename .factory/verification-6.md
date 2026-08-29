# Independent verification 6 — PASS

**Candidate:** `4d8b37cdb4f9f6145f01ae1b825ffc54afa46601`

**Verified URL:** <https://workload-reschedule-receipts.sociobot.in>

**Date:** 2026-08-29

**Scope:** independent clean-checkout and production QA against the researched brief and factory acceptance contract. Product code was not changed.

## Verdict

**PASS.** Deadline Reality Check completes the real recovery job: a student can enter assignments and estimates, protect imported calendar time, mark a study block missed, and receive a constrained revised plan with explicit deadline risk. The isolated one-click demo, local persistence, backup ownership, paid boundary, accessibility baseline, production deployment, and offline behavior all work.

One low-severity timing observation is recorded below. It did not reproduce in five focused reruns or the final complete production run and is not release-blocking.

## Mandatory first-read and demo gate

The cold live first screen answers all three required questions in plain words:

- **What:** “Reschedule missed study time.”
- **For whom:** “For students whose missed work block could turn several assignments into one late night.”
- **First action:** **Try it with sample data**, beside “A missed block, revised plan, and deadlines at risk load next.”

The action is visible without scrolling at 1440 × 900 and 390 × 844. One click opens `/?demo=1` with four realistic assignments, two calendar events, eleven study blocks, a risk receipt, and the persistent “Demo — sample data, nothing is saved” banner. Reset demo and Start for real are present. After the real-plan transition finishes, the real plan has zero sample assignments.

Evidence: `verification-artifacts/live/first-read-desktop.png`, `verification-artifacts/live/landing-mobile-390.png`, `verification-artifacts/live/first-click-demo-desktop.png`, `verification-artifacts/live/demo-mobile-390.png`, `verification-artifacts/functional-live.txt`, and `verification-artifacts/demo-isolation-live.txt`.

## Clean-checkout gates

The checkout began clean and exactly at the requested commit. The first literal claim invocation before dependency installation could not resolve `vitest`; after the required `npm ci`, every claim command ran independently and passed. This was a missing local prerequisite, not a claim assertion failure.

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 61 packages installed, 0 vulnerabilities |
| Every command in `.factory/claims.json` | PASS — all 17, desktop Chromium and 390 px mobile |
| `npm test` | PASS — 9 unit tests and 62 Playwright tests |
| TypeScript | PASS — `tsc --noEmit` through the build command |
| Lint | N/A — no lint script or lint configuration exists |
| `npm run build` | PASS — exact production build produced `dist/` |

Initial production payload: JavaScript 39.29 KB raw / 12.57 KB gzip; CSS 10.08 KB raw / 3.22 KB gzip; no fonts; mobile hero 8.70 KB and wide hero 26.66 KB. All are comfortably inside the contract budgets.

## Claims contract

Each manifest entry has one tagged browser test. Each exact command passed against the local demo on both configured projects.

| Claim | Result | Evidence |
| --- | --- | --- |
| `reschedule-receipt` | PASS | `verification-artifacts/claims/reschedule-receipt.log` |
| `receipt-copy` | PASS | `verification-artifacts/claims/receipt-copy.log` |
| `receipt-download` | PASS | `verification-artifacts/claims/receipt-download.log` |
| `assignment-deletion` | PASS | `verification-artifacts/claims/assignment-deletion.log` |
| `ics-import` | PASS | `verification-artifacts/claims/ics-import.log` |
| `data-export` | PASS | `verification-artifacts/claims/data-export.log` |
| `data-import` | PASS | `verification-artifacts/claims/data-import.log` |
| `demo-isolation` | PASS | `verification-artifacts/claims/demo-isolation.log` |
| `local-only` | PASS | `verification-artifacts/claims/local-only.log` |
| `free-core` | PASS | `verification-artifacts/claims/free-core.log` |
| `paid-checkout` | PASS | `verification-artifacts/claims/paid-checkout.log` |
| `offline-reload` | PASS | `verification-artifacts/claims/offline-reload.log` |
| `manual-estimate-trims` | PASS | `verification-artifacts/claims/manual-estimate-trims.log` |
| `uncertainty-visible` | PASS | `verification-artifacts/claims/uncertainty-visible.log` |
| `indexeddb-storage` | PASS | `verification-artifacts/claims/indexeddb-storage.log` |
| `license-token-privacy` | PASS | `verification-artifacts/claims/license-token-privacy.log` |
| `billing-terms` | PASS | `verification-artifacts/claims/billing-terms.log` |

Landing-page and README claim-like statements map to the manifest; no unlisted product claim was found.

## Independent end-to-end checks

- Demo miss: PASS — the populated plan remains usable and a new receipt is produced.
- Real-plan isolation: PASS — leaving demo loads an empty real IndexedDB plan; sample assignments are not copied.
- Normal input: PASS — a 90-minute rough-estimate calculus assignment with a future deadline is added and scheduled.
- Empty input: PASS — announced inline error says to add assignment, course, and a valid deadline.
- Past deadline: PASS — announced inline error says the deadline passed and asks for a future time.
- Recovery: PASS — correcting the deadline adds the assignment normally.
- Invalid ICS: PASS — rejected with a specific message; valid shipped ICS then imports two timed events.
- Invalid JSON backup: PASS — rejected without changing the current plan.
- Export: PASS — downloaded JSON parses and contains the assignment and two busy events.
- Four-assignment boundary, completion releasing capacity, paid five-assignment behavior, delete confirmation, copy/download receipt, manual trim floor, import restoration, and license failure recovery: PASS in the claim and regression suites.
- Link crawl: PASS — all internal and external links resolve; checkout returns 303 to `checkout.dodopayments.com`; mail links are explicit.
- Unknown route: PASS — HTTP 404 with the designed product shell and a route home.

The final complete production run passed 62/62 tests on desktop and mobile. An earlier production run passed 61/62 when one desktop free-limit test lost the fourth form fill during four immediate consecutive submissions. The focused scenario then passed 5/5 and the final full run passed. Evidence is retained in `verification-artifacts/live-e2e.log`, `verification-artifacts/live-free-core-repeat.log`, and `verification-artifacts/live-e2e-rerun.log`.

## Privacy, security, and billing

- A cold landing and the complete demo/real planning flow made only same-origin requests. No analytics, beacons, external fonts, or third-party page assets were observed. No console or page errors occurred.
- Browser-observed responses include HTTPS/HSTS, `nosniff`, strict referrer policy, restrictive permissions policy, and CSP with response-header `frame-ancestors 'none'`. CSP permits only self-hosted page assets and the documented Sociobot API connection.
- HTML, manifest, and service worker use `public, must-revalidate, max-age=30`. Hashed JavaScript/CSS use `public, max-age=31536000, immutable`.
- The explicit license verifier is the only product server endpoint. Fresh rate testing observed **30** consecutive invalid-token responses with status 200; request **31** returned **429** with `Retry-After: 3`.
- Checkout starts at Sociobot and redirects to hosted Dodo checkout. No raw payment-provider integration or Azure key exists in the product.
- The product has no sign-in flow, backend persistence, AI runtime, or institutional credentials, so those checks are not applicable.

Evidence: `verification-artifacts/browser-response-headers.txt`, `verification-artifacts/headers.txt`, `verification-artifacts/rate-limit.txt`, `verification-artifacts/link-crawl.txt`, and `verification-artifacts/functional-live.txt`.

## Accessibility and responsive behavior

- `/opt/fleet/lib/verify-url.sh` passes on `/` and `/?demo=1`: title, `lang=en`, one h1, main landmark, image alt text, labelled buttons, and zero console errors.
- Axe reports zero violations, including zero serious/critical findings, on `/`, `/demo`, `/planner`, `/privacy`, `/terms`, and the 404 route in desktop/mobile and light/dark coverage.
- Keyboard-only smoke test: first Tab exposes the skip link with a 3 px yellow focus ring; activating it makes the next Tab land on the first main action. Tabbing to a missed-block control shows the same visible focus and Enter produces a new receipt.
- Route changes focus their h1 and announce the route. Forms have visible labels and announced errors.
- At 390 px the landing and demo have no horizontal overflow; demo receipt and revised plan precede inputs; core controls meet the 44 px target tests.
- Reduced-motion emulation matches and collapses transitions/animations to `0.00001s`; scroll behavior is `auto`.

Evidence: `verification-artifacts/verify-url-root/`, `verification-artifacts/verify-url-demo/`, `verification-artifacts/keyboard-live.txt`, and the live Playwright logs.

## PWA, deployment identity, and performance

- Service worker controls the demo with cache `drc-v5`; the cache contains the shell, demo/planner routes, manifest, both heroes, favicon, JS, and CSS.
- `registration.update()` completes with the current worker active and no stale waiting/installed worker.
- With the browser offline, `/demo` reloads with HTTP 200 from the worker, keeps four sample assignments, and shows both offline and demo banners.
- Live `index.html` matches `dist/index.html`. Candidate and live JS, CSS, service worker, and 404 CSS match byte-for-byte:

| Asset | SHA-256 |
| --- | --- |
| `assets/index-BP1PtUv1.js` | `f517e3027d3ff75cf823ae76a9c7a60739e7081a32a833d2ede44d85ae94dd41` |
| `assets/index-CUqIz0lL.css` | `2d52a32c7de0beceb541841397d60381b0e0f976e6ba1fb11dcd062bd1285c57` |
| `service-worker.js` | `c3c313f2b43c8cc7fb6d629d03dbece180246a52af4cb06f606fb0d233e4cff6` |
| `404.css` | `58a03215761c7e30798b97f9fab2af6eb002366abbbb113c82af1f5ae671eab3` |

- Live Lighthouse mobile: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 945 ms, LCP 1,095 ms, TBT 140 ms, CLS 0.
- Manifest name, standalone display, versioned start URL, 192/512/maskable icons, colors, and scope are valid. The 1200 × 630 social image and icon dimensions match their metadata.

Evidence: `verification-artifacts/pwa-live.txt`, `verification-artifacts/lighthouse-summary.txt`, and `verification-artifacts/lighthouse-live-2.json`.

## Visual and product fit

The shipped interface follows the recorded product-specific “plan bends, truth stays square” system: graph paper, cut-paper scheduling path, moss/orange risk palette, square receipt geometry, monospace working copy, and a responsive receipt-first demo. The original image provenance, prompt, derivative sizes, type, spacing, dark treatment, and reduced-motion policy are documented in `.factory/design.md`. This is recognizably an interruption-recovery tool, not a generic task-dashboard skin.

No AI feature is needed for this deterministic constrained-rescheduling job. Calendar import/export and backup ownership provide the useful implied integrations without sending coursework or schedules to a model.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** one transient rapid-entry automation timing failure occurred in the first production suite. It did not reproduce in five focused reruns or the final complete run. A future maintenance change could serialize/disable the add form while IndexedDB persistence and rerender complete.

## Known gaps / next steps

No release-blocking gap. Consider eliminating the recorded rapid-submit timing window in a future maintenance change.
