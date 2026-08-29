# Independent verification 5 — PASS

**Candidate:** `b86f0a567bf5d51b4f3b34db2832c087d6d2ac2d`  
**Verified URL:** <https://workload-reschedule-receipts.sociobot.in>  
**Date:** 2026-08-29  
**Scope:** independent production and clean-checkout QA against the researched brief and factory contract. Product source was not changed.

## Verdict

**PASS.** This is a working local-first PWA for students recovering after a missed study block: it accepts assignments and local ICS busy time, produces a constrained reschedule and explicit risk receipt, preserves estimate uncertainty, exports/imports data, and works from the one-click isolated demo.

The live deployment is the tested candidate build. SHA-256 values match the freshly built files:

| Asset | SHA-256 |
| --- | --- |
| `assets/index-CiArBUok.js` | `12b5eeef0ebe58db3c062d15a2f573263269d842c553a158b59c14434bf8cc27` |
| `assets/index-DZTrEn9U.css` | `2b4c173bc7cb9798e447d6abfa2a8da2d0c2d2a5a0960ca2f23345a494b21883` |
| `service-worker.js` | `9b93f590d08dff1438cd079743d5890d8ddab0e5f2127580ca05c825863978de` |
| `404.css` | `58a03215761c7e30798b97f9fab2af6eb002366abbbb113c82af1f5ae671eab3` |

## First-read and demo result

Cold production load answers all required questions in the first screen:

- **What:** “Reschedule missed study time.”
- **For whom:** “For students whose missed work block could turn several assignments into one late night.”
- **First action:** the visible one-click **Try it with sample data** link, with the adjacent explanation that the missed block, revised plan, and risk load next.

The demo URL `/demo` loads realistic assignments, calendar blocks, a receipt, and the persistent “Demo — sample data, nothing is saved” banner with Reset demo and Start for real. A demo miss produced the revised-plan receipt and confirmation toast. Demo requests were same-origin only.

## Clean-checkout commands

```text
npm ci          PASS — 61 packages installed; 0 vulnerabilities
npm test        PASS — 7 Vitest tests + 56 Playwright tests
npm run build   PASS — TypeScript check and Vite build; dist/ produced
```

The first literal claim command before `npm ci` correctly could not resolve the project dependency (`vitest: not found`) because this was a clean clone without `node_modules`; after the required clean install, every exact command in `.factory/claims.json` passed. The final full suite’s Playwright result is `passed` with no failed tests.

### Claims contract

All 17 exact claim commands passed against the local demo entry point in Chromium desktop and 390px mobile:

`reschedule-receipt`, `receipt-copy`, `receipt-download`, `assignment-deletion`, `ics-import`, `data-export`, `data-import`, `demo-isolation`, `local-only`, `free-core`, `paid-checkout`, `offline-reload`, `manual-estimate-trims`, `uncertainty-visible`, `indexeddb-storage`, `license-token-privacy`, and `billing-terms`.

## Independent functional checks

- Representative demo miss: PASS — receipt and revised blocks were present before and after marking a block missed.
- Normal real-plan flow: PASS — an assignment with task, course, and future deadline was saved and planned in IndexedDB.
- Boundary/recovery: PASS — empty form says “Add a task, course, and valid deadline”; a past deadline says “The deadline has passed. Choose a future time”; a valid future deadline then adds the task. Malformed JSON backup and invalid ICS are rejected without breaking the plan.
- ICS, backup import/export, receipt copy/download, explicit trims, task deletion, free four-task boundary, and paid receipt-history behavior: PASS via the independently rerun claim suite.
- All crawled internal routes returned 200; checkout returned a Sociobot `303` to hosted Dodo checkout; `mailto:` links were explicit. The intentional unknown-route 404 remained 404 and offered a way home.

## Production privacy, PWA, accessibility, and performance

- Cold landing load: only same-origin document, JavaScript, stylesheet, and hero-image requests; no console/page errors.
- Full live demo flow: zero cross-origin requests. The only runtime external destination in source is the explicit Sociobot billing verification/checkout path, documented in privacy and allowed by the response CSP.
- Response headers: HTTPS/HSTS, restrictive CSP including response-header `frame-ancestors 'none'`, `nosniff`, strict referrer policy, and restrictive permissions policy are present. Hashed JS/CSS receive `public, max-age=31536000, immutable`; HTML, manifest, and service worker revalidate in 30 seconds.
- Rate allowance: 30 consecutive bogus-license verification requests returned 200 invalid responses; request **31** returned **429** with `Retry-After: 4`. This meets the server-side allowance requirement.
- PWA: controlled by cache `drc-v4`; `registration.update()` completed with no stale waiting worker; offline `/demo` reload kept the planner and displayed the offline banner.
- Keyboard: first Tab reaches Skip to main content; focused missed-block button activated with Enter and yielded the recovery toast. Designed visible focus is present before activation.
- Mobile: `/demo` at 390 × 844 had no horizontal overflow; responsive planner is usable. The detected 14px import control is deliberately visually hidden and is activated by its adjacent full-size “Import a backup” label.
- Reduced motion: receipt transition and animation durations are `0.00001s` with `prefers-reduced-motion: reduce`.
- Axe: desktop and 390px scans of `/`, `/demo`, `/planner`, `/privacy`, `/terms`, and the 404 route found **zero serious or critical violations**. `/demo` has one moderate `landmark-complementary-is-top-level` advisory from the nested risk aside.
- Live Lighthouse (mobile emulation): Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9 s, LCP 1.1 s, CLS 0, TBT 90 ms.
- Production build budget: initial JS 38.88 KB raw / **12.56 KB gzip**; CSS 10.07 KB raw / **3.20 KB gzip**; both are within the static-PWA budgets.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low / non-blocking: Axe reports the demo risk `<aside>` as a nested complementary landmark (`landmark-complementary-is-top-level`, moderate impact). There are no serious/critical Axe results and no observed keyboard or screen-reader smoke-test failure.

## Known gaps / next steps

None release-blocking. The low-severity landmark advisory can be cleaned up in a future maintenance change by using a section/div with an accessible heading for inline risk content.
