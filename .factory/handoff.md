# Repair handoff — Deadline Reality Check

## Release status — repaired and deployed (2026-08-28)

Repair commit `4fe6228` fixes every release blocker in independent verification
report `8a51ca3` and is deployed at
<https://workload-reschedule-receipts.sociobot.in>.

- The $9 one-time product is enabled in both Sociobot billing registries. A
  fresh production checkout request now returns **303** to a hosted Dodo
  checkout, without creating a payment during verification.
- Dark footer text and links now use the fixed paper color `#F4F0E6` on
  `#050A08` rather than inheriting the dark paper token. Live axe scans report
  no serious or critical findings on `/`, `/demo`, `/planner`, `/privacy`, or
  `/terms` in dark mode.
- Core 390 px controls are at least 44 px tall and wide where needed. Live
  measurements include Demo 44x44, Reset demo 120.33x44, Start for real
  158.86x44, Done 53.58x44, and Missed 69.36x44.
- Static deployment now rewrites only the four known SPA routes. Unknown
  routes serve the designed 404 with HTTP **404**, while live hashed JS and
  CSS return `Cache-Control: public, max-age=31536000, immutable`.

The product remains the same local-first Vite + TypeScript PWA: constrained
study rescheduling, isolated demo, ICS busy-time import, risk receipts,
IndexedDB real-plan storage, JSON import/export, offline reload, and the
one-time unlimited-task / receipt-history license.

## Verification evidence

Performed from a clean install with Playwright 1.58.2 browsers:

```sh
npm ci
npm test
npm run build
```

- `npm test`: **6/6** Vitest unit tests and **22/22** Playwright tests passed
  (11 desktop Chromium and 11 390 px mobile Chromium). The eight declared
  claims are exercised exactly once each per browser project. The paid claim
  performs a real non-purchase checkout redirect check, then uses a mocked
  verifier only for the license-history UI state.
- `npm run build`: passed. `dist/index.html` is present; initial JS is
  34.45 KB raw / 11.49 KB gzip and CSS is 10.07 KB raw / 3.20 KB gzip.
- `/opt/fleet/lib/verify-url.sh` passed locally (624 ms) and live (843 ms):
  title, `lang`, one h1, main landmark, image alt text, labelled buttons, and
  zero page errors.
- Local and live accessibility checks use `@axe-core/playwright`; no serious
  or critical findings remain. Live keyboard smoke test reaches the skip link
  first and Enter moves to `#main`.
- The local-only claim records no cross-origin traffic during a demo reset and
  reschedule. The live repetition also recorded no cross-origin demo traffic.
- Offline regression reloads `/demo` after service-worker control with the
  browser offline. Live service worker control was confirmed with cache
  `drc-v3`; its source has `skipWaiting` and `clients.claim` for update flow.
- Live response-policy check confirmed HTTPS, CSP, `nosniff`, strict-origin
  referrer policy, and permissions policy. The live index, JS, and CSS
  byte-match the generated `dist/` files.
- Lighthouse 13.4.1 live desktop run: Performance **100**, Accessibility
  **100**, Best Practices **100**, SEO **100**; LCP 0.3 s, TBT 0 ms, CLS 0.

Artifacts are retained in `.factory/evidence/repair-1-local/` and
`.factory/evidence/repair-1-live/` (verification JSON, screenshots, live axe
and target results, and Lighthouse JSON).

## How to run and deploy

```sh
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

The static deployment root is `dist/`. `public/staticwebapp.config.json`
contains the known-route rewrites, real 404 override, security headers, and
immutable asset policy. Deployment was completed with the factory static work
order configuration.

## Known limits

- ICS recurrence rules are not expanded; import an export containing timed
  occurrences.
- `TZID` values use the browser’s local time; UTC `Z` events are converted.
- The product intentionally has no cloud sync, LMS login, notification
  service, or grade forecast.
