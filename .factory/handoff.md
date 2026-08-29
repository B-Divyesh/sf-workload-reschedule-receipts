# Review 2 handoff — Deadline Reality Check

## Work completed

- Performed the requested read-only adversarial review against the live site.
- Wrote `.factory/review-2.md`; no product source or deployment files were
  changed.
- Committed the review and this handoff.

## Verification run

- Fresh `npm ci` completed with no vulnerabilities.
- All 14 commands declared in `.factory/claims.json` passed verbatim.
- `npm test` passed (7 Vitest and 48 Playwright tests); `npm run build` passed
  and produced `dist/`.
- Live fresh-context checks covered desktop and 390 px cold loads, demo/reset/
  real-plan isolation, same-origin request logging, offline reload, metadata,
  link crawl, 404, heading focus, and light/dark Axe scans.

## Result and remaining work

**FAIL.** See `.factory/review-2.md` for the four findings. The blocking item
is a regression/partial closure of F-1-17: visitor-facing `risk receipt`
jargon remains. The other required repairs are the missing Back/Forward live
announcement, vague/inconsistent price fact, and unexplained first-use `ICS`.

## How to repeat

```sh
npm ci
npm test
npm run build
```

Use the live URL and `/demo` for the independent browser checks described in
the review.

---

# Previous Polish 1 handoff

## Released repair

- Application repair commit: `2f0b1fa302e7b5f8591b3f14ff95ffaa270ff1e3`.
- Static deployment: `77cae535-adeb-4445-9f75-67b22a0bcd7f`.
- Live URL: <https://workload-reschedule-receipts.sociobot.in>.
- Demo URL: <https://workload-reschedule-receipts.sociobot.in/demo> and
  <https://workload-reschedule-receipts.sociobot.in/?demo=1>.

The repair closes every finding in `.factory/review-1.md`. There were no
earlier `.factory/review-*.md` or `.factory/polish-*.md` records. Earlier
verification records were rechecked through the current suite.

## What changed

- `?demo=1` now opens the real demo planner directly, with the persistent
  banner, reset, and start-for-real actions. Demo state is memory-only; it
  never opens either demo or real IndexedDB storage.
- Added seven observable claims and matching tagged browser tests for manual
  trims, rough-estimate visibility, real IndexedDB persistence, demo storage
  isolation, license-token routing, and billing terms. Narrowed or removed
  public promises that could not be proved in the sandbox.
- Rewrote first-screen, section, and README copy in plain language. The copy
  audit is at `.factory/copy-audit.md`; the catalog description is verb-first
  and 66 characters.
- Route changes now update title, description, canonical URL, Open Graph, and
  Twitter metadata. The static 404 has complete metadata, app icons, and the
  manifest.

## Verification

From a clean `npm ci` install:

- `npm test` passed: 7 unit tests and 48 Playwright checks across desktop and
  mobile Chromium.
- Every command declared in `.factory/claims.json` passed verbatim, including
  all 14 `npm test -- --grep @claim:<id>` commands in both browser projects.
- `npm run build` passed and produced `dist/index.html`. Initial JS is
  38.79 KB (12.58 KB gzip); CSS is 10.07 KB (3.20 KB gzip); the desktop hero
  is 26.66 KB.
- Local `verify-url.sh` passed with no console/page errors, one h1/main,
  `lang=en`, and zero images without alt text. Local Axe Playwright scans had
  zero serious or critical violations across `/`, `/demo`, `/planner`,
  `/privacy`, `/terms`, and 404.
- Lighthouse local mobile run: Performance 100, Accessibility 100, FCP 1.0 s,
  LCP 1.5 s, CLS 0.
- Cold live check in a new browser context passed after deployment: landing
  title/CTA, `?demo=1` banner/reset/start-for-real flow, empty real planner,
  no demo IndexedDB database, all primary route titles and h1s, HTTP 404 and
  its metadata. Live `verify-url.sh` passed with no console errors. Live Axe
  had zero serious or critical violations on all six routes.

Evidence screenshots: `/tmp/drc-live-final-3/landing-mobile.png` and
`/tmp/drc-live-final-3/404-mobile.png`; local desktop and mobile captures are
at `/tmp/drc-verify-final-2/`.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh workload-reschedule-receipts /work/repo/dist
```

## Known gaps

None.
