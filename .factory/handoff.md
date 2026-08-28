# Build handoff — Deadline Reality Check

## Independent verification status — FAIL (2026-08-28)

Candidate `138e73f1558ac8a07e54eab526fbe25655ac6cfe` was independently tested
at <https://workload-reschedule-receipts.sociobot.in>. **Do not release this
candidate.** The local build and all 18 configured Playwright tests pass, and
the live public assets byte-match the candidate build. However, the live $9
checkout endpoint returns HTTP 404, dark mode has six serious axe contrast
violations, and core 390 px controls are below the 44 px touch-target minimum.
The detailed evidence, test commands, response headers, rate-limit result, and
all defects are in [verification.md](verification.md).

## What shipped

- A finished Vite + TypeScript PWA at `/`, with the working planner at `/planner` and an isolated one-click sample at `/demo`.
- A constrained 30-minute scheduling engine. It respects deadlines, daily study limits, chosen study hours, work-block length, completed time, trims, and imported busy events.
- The failure-recovery flow: mark any planned block missed, rebuild remaining work, and issue a receipt with replacement time, moved tasks, unchanged constraints, possible trims, and deadline shortfalls.
- Explicit estimate confidence and fixed/flexible priority on every assignment.
- Local ICS import, IndexedDB persistence, JSON backup export/import, receipt copy/download, resettable demo state, offline state, and service-worker update feedback.
- A useful free tier for four active tasks. A $9 one-time Sociobot license adds unlimited active tasks and past receipt history. Checkout, URL token capture, daily verification caching, restore-by-paste, revocation handling, and offline cached verdicts follow the paid-unlock contract.
- `/privacy`, `/terms`, an SPA-aware designed 404, canonical and social metadata, sitemap, robots file, security headers, PWA icons, and install manifest.
- A product-specific generative-geometry system and an original generated cut-paper hero. The source, prompt, provenance, and optimized WebP derivatives are committed.

## How to run and verify

```sh
npm install
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

- `npm test`: passed 4 unit tests and 18 Playwright tests on desktop Chromium and a 390 px mobile Chromium profile.
- Every entry in `.factory/claims.json` is exercised through its tagged Playwright test.
- Offline verification: `/demo` was loaded once, the browser context was set offline, and a full reload restored the planner and offline notice.
- Privacy verification: the demo reset and reschedule flow was intercepted from navigation through completion; every request was same-origin.
- Accessibility verification: axe found no serious or critical violations on `/`, `/demo`, `/privacy`, or `/terms` in desktop and mobile projects.
- `/opt/fleet/lib/verify-url.sh`: passed with title, `lang`, one `h1`, `main`, alt text, labeled buttons, and zero console errors. Local measured load was 609 ms.
- Lighthouse 13.4.1 mobile run: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.4 s, FCP 1.0 s, Total Blocking Time 0 ms, CLS 0.
- Production build: `dist/index.html` is present. Initial application JS is 34.45 KB raw / 11.49 KB gzip. CSS is 9.86 KB raw / 3.17 KB gzip. The 720 px hero is 8.5 KB and the 1200 px hero is 27 KB.
- Evidence is in `.factory/evidence/`; copy and terminology review is in `.factory/copy-audit.md`.

## Known gaps

- ICS recurrence rules are not expanded. Import each occurrence as a timed `VEVENT` in the exported file for now.
- `TZID` values are treated as the browser’s local time. UTC events ending in `Z` are converted correctly.
- There is no cloud sync, LMS connection, notification service, or grade forecast. These are deliberate scope and privacy limits.
- Checkout becomes live only after the factory registers the product slug with the billing service.

## Recommended next steps

1. Register `workload-reschedule-receipts` with the Sociobot billing engine and verify the production return URL.
2. Pilot with students for two weeks and measure reschedules completed within five minutes.
3. Add recurrence expansion only if real ICS exports omit expanded events during the pilot.
