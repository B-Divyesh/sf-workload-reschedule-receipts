# Polish 2 handoff — Deadline Reality Check

## Released repair

- Application repair: `7b46c10f75cd16c011838d2abb8a912aa87d8ffa` (`fix: close second adversarial review`).
- Static deployment: `d83cd692-01e0-4b40-b481-d6111caa2000`.
- Live URL: <https://workload-reschedule-receipts.sociobot.in>.
- Demo URL: <https://workload-reschedule-receipts.sociobot.in/demo> and
  <https://workload-reschedule-receipts.sociobot.in/?demo=1>.

## What changed

- Removed the residual `risk receipt` jargon from the first-screen action,
  paid copy, and public claim. The sample now deterministically exposes a
  real deadline-risk list, so the promise is observable.
- Rewrote the mobile first-screen price fact with the real four-active-task
  free limit and $9 unlimited-active-task entitlement. The paid heading now
  uses the same entitlement name.
- Introduced calendar imports in plain words as a “calendar (.ics) file” on
  landing, README, direct planner entry, and parse errors.
- Announced Back/Forward route changes through the polite live region after
  moving focus to the new h1.
- Expanded the browser regression suite for plain first-screen language,
  Back announcement, all route Axe scans, and the real deadline-risk list.
- Updated claims, copy audit, catalog description, and the complete cumulative
  finding map in `.factory/polish-2.md`.

## Exact verification evidence

From a fresh clone at `/tmp/drc-clean-HCbFjJ` of
`7b46c10f75cd16c011838d2abb8a912aa87d8ffa`:

- `npm ci` PASS — 61 packages, 0 vulnerabilities.
- All 14 declared commands in `.factory/claims.json` passed verbatim:
  `reschedule-receipt`, `ics-import`, `data-export`, `data-import`,
  `demo-isolation`, `local-only`, `free-core`, `paid-checkout`,
  `offline-reload`, `manual-estimate-trims`, `uncertainty-visible`,
  `indexeddb-storage`, `license-token-privacy`, and `billing-terms`.
- `npm test` PASS — 7 Vitest tests and 50 Playwright checks across desktop
  Chromium and the 390 px mobile project (`test-results/.last-run.json`:
  `{"status":"passed","failedTests":[]}`).
- `npm run build` PASS — `dist/index.html` is present; initial JS is 38.88 KB
  (12.56 KB gzip) and CSS is 10.07 KB (3.20 KB gzip).
- Local mobile Lighthouse PASS — Performance 100, Accessibility 100, FCP
  0.90 s, LCP 1.36 s, and CLS 0. Report:
  `/tmp/drc-polish-2-local/lighthouse.json`.

Local verification:

- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ /tmp/drc-polish-2-local`
  PASS — title, `lang=en`, one h1, main landmark, image alt text, named
  controls, and no console/page errors. Evidence:
  `/tmp/drc-polish-2-local/verify.json`.

Cold production verification after deployment:

- `/opt/fleet/lib/verify-url.sh https://workload-reschedule-receipts.sociobot.in/ /tmp/drc-polish-2-live`
  PASS with the same semantic and console checks. Evidence:
  `/tmp/drc-polish-2-live/verify.json`.
- Fresh 390 px Playwright pass confirmed the fixed first-screen text,
  `?demo=1` banner/reset/start-for-real controls, Demo → Privacy → browser
  Back focus and live announcement, and a real HTTP 404.
- Axe found zero serious or critical violations on `/`, `/demo`, `/planner`,
  `/privacy`, `/terms`, and `/404.html`. Ordinary routes had no console/page
  errors. Screenshots: `/tmp/drc-polish-2-live/landing-mobile.png` and
  `/tmp/drc-polish-2-live/404-mobile.png`.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh workload-reschedule-receipts /work/repo/dist
```

## Known gaps / next steps

None. The static PWA remains local-first, offline-capable after first visit,
and intentionally uses deterministic scheduling rather than an unnecessary AI
feature or backend.
