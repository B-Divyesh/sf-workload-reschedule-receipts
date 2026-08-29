# Independent verification 4 — FAIL

**Candidate:** `6ddb1d787627ea49ee06dff38651b5911e4ccf30`  
**Live URL:** <https://workload-reschedule-receipts.sociobot.in>  
**Verified:** 2026-08-29 UTC from the clean `main` checkout

## Verdict

**FAIL.** The live PWA byte-matches the candidate, the core recovery workflow
works, all 14 declared claim commands pass after dependency installation, and
the earlier deployment-only checkout failure is not present. Two acceptance
defects remain:

1. The claims manifest omits explicit user-facing receipt copy/download and
   assignment-deletion claims. The supplied claims contract says an unlisted
   claim fails independent verification.
2. The real 404 page has three footer links with 19.2 px-high touch targets,
   below the non-negotiable 44 px accessibility minimum.

No product code was changed during this verification.

## Mandatory first-read and demo gate

The cold first screen passes at 1440 × 900 and 390 × 844 without scrolling:

- **What it does:** “Reschedule missed study time.”
- **For whom:** students whose missed work block could turn several
  assignments into one late night.
- **What to do first:** choose the visible **Try it with sample data** action.
  Its adjacent sentence says that a missed block, revised plan, and deadlines
  at risk load next.

One click opens `/demo`. It immediately shows four realistic assignments, a
revised plan, and a receipt. The persistent banner says “Demo — sample data,
nothing is saved” and provides Reset demo and Start for real.

## Mandatory claims gate

`.factory/claims.json` exists and contains 14 entries. As the first repository
action, every listed command was invoked against the untouched checkout; none
could start because the clean clone had no installed `vitest` binary. After the
required `npm ci`, every command was rerun verbatim. All passed in both the
desktop Chromium and 390 px mobile projects. Each declared `@claim:<id>` tag
occurs exactly once in the test sources.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `reschedule-receipt` | PASS | A missed block produced a revised plan and deadline-risk receipt. |
| `ics-import` | PASS | The shipped calendar fixture imported two timed events. |
| `data-export` | PASS | The JSON backup downloaded and contained the required arrays. |
| `data-import` | PASS | An exported assignment was restored from JSON. |
| `demo-isolation` | PASS | Demo work opened no IndexedDB database; Start for real opened an empty plan. |
| `local-only` | PASS | The complete sample reset/miss flow made only same-origin requests. |
| `free-core` | PASS | Four active tasks worked, completion released the limit, and a fifth active task was explained. |
| `paid-checkout` | PASS | Price, checkout redirect, and mocked paid receipt history passed. |
| `offline-reload` | PASS | A controlled demo reloaded offline with its planner and offline banner. |
| `manual-estimate-trims` | PASS | Estimates changed only after an explicit trim. |
| `uncertainty-visible` | PASS | Rough estimates remained marked in the receipt. |
| `indexeddb-storage` | PASS | A real plan survived reload in `deadline-reality-check:real`. |
| `license-token-privacy` | PASS | Only the token was sent by GET to the Sociobot verifier. |
| `billing-terms` | PASS | Terms name Sociobot/Dodo and link to Sociobot checkout. |

The declared tests pass, but the manifest is incomplete; see the P1 defect.

## Clean-checkout quality gates

```text
npm ci        PASS — 61 packages installed; 0 vulnerabilities
npm test      PASS — 7/7 Vitest and 50/50 Playwright checks
npm run build PASS — tsc --noEmit and Vite; dist/index.html produced
```

There is no separate lint script. The exact build performs the available
typecheck. `/opt/fleet/lib/verify-url.sh` passed locally in 738 ms and live in
662 ms, finding a title, `lang=en`, one h1, one main, image alt text, named
buttons, and no load errors.

## Independent product exercise

Passing evidence beyond the repository suite:

- A two-hour assignment produced two study blocks. Marking the first missed
  produced a replacement one hour later, a revised plan, and a receipt. The
  plan and receipt survived reload through IndexedDB.
- A 30-minute task due in 20 minutes produced no false block and reported a
  30-minute shortfall.
- Blank task input, a past deadline, an end hour before the start hour,
  malformed ICS, and malformed JSON each produced a specific recovery message.
  Adding valid work after rejection still succeeded.
- Three 30-minute trims stopped a two-hour rough estimate at 30 minutes; the
  trim action then disappeared and no negative duration appeared.
- Demo reset/miss/trim opened no IndexedDB database. Start for real changed to
  `/planner` with zero tasks.
- Copy receipt put the full 231-character receipt on the clipboard. Download
  receipt produced `deadline-reality-check.txt` with the same content.
- The live checkout returned HTTP 303 to hosted Dodo checkout. No payment was
  made. A real invalid-license check sent one GET with a null body and showed
  the inactive notice.

## Deployment identity, privacy, headers, and rate limiting

- Fresh-build SHA-256 hashes match production for all 18 public artifacts:
  index, hashed JS/CSS and source map, service worker, manifest, 404 HTML/CSS,
  favicon, robots, sitemap, three images, and four PWA icons. The live product
  therefore matches candidate `6ddb1d7` byte-for-byte.
- A fresh Playwright request log for the complete live demo flow contained only
  `/demo` and the same-origin hashed JS/CSS: three requests, zero cross-origin
  requests, console errors, or page errors.
- An explicit license action made exactly one external request:
  `GET https://api.sociobot.in/api/v1/products/workload-reschedule-receipts/verify?license=...`
  with no request body. Its response was HTTP 200 and `Cache-Control: no-store`.
- Browser-observed HTML headers include HSTS, CSP with response-header
  `frame-ancestors 'none'`, `nosniff`, strict-origin referrer policy, and a
  restrictive permissions policy. CSP permits only this origin plus the
  Sociobot billing connection.
- Hashed JS/CSS use `public, max-age=31536000, immutable`. HTML, manifest,
  service worker, and 404 revalidate after 30 seconds. Unknown paths return the
  designed page with HTTP 404.
- The billing verifier allowed 30 rapid requests from one client. Request 31
  returned HTTP 429 with `Retry-After: 3` and body “Too Many Requests! Wait for
  3s”.
- Every discovered internal route and the Param Factory link returned HTTP
  200. The checkout returned the expected 303. The two `mailto:` links are
  well formed.
- There is no sign-in or product backend. Entra, backend concurrency/server
  persistence, health/build-identity endpoints, and library/CLI consumer
  installation are not applicable.

## Accessibility, responsive behavior, and motion

- 28 live Axe scans covered `/`, `/demo`, `/planner`, `/privacy`, `/terms`,
  `/404.html`, and a real unknown route across desktop/mobile and light/dark.
  They found zero serious or critical violations.
- All audited pages have `lang=en`, route-specific titles, one h1, one main,
  ordered headings, and zero horizontal overflow. Ordinary routes had no
  console or page errors. The browser's expected failed-resource message for
  the HTTP 404 document was the only console line on an unknown route.
- Keyboard Tab first focuses the 216.7 × 48.8 px skip link with a 3 px yellow
  outline. Enter moves the sequence to Task. Continued Tab reached “Mark Draft
  biology lab discussion missed”; Enter produced the receipt. No trap was
  observed.
- At 200% root text size on desktop, the demo retained all content with zero
  horizontal overflow.
- With reduced motion enabled, the media query matched, animation and
  transition duration fell to `0.01ms`, and scroll behavior was `auto`.
- The 390 px landing and planner have no overflow and their primary controls
  meet the 44 px target. The static 404 footer exception is reported below.

## PWA and performance

- The live manifest has `display: standalone`, scope `/`, versioned start URL
  `/planner?v=1`, matching theme/background colors, correct MIME type, 192 and
  512 px icons, and a 512 px maskable icon.
- In an isolated live browser profile, `/demo` became controlled by the service
  worker. Cache `drc-v3` contained the shell plus hashed JS/CSS. Registering a
  new worker URL triggered the visible “An update is ready” toast and changed
  the controller. The controlled demo then reloaded offline with its planner
  and offline-state banner.
- Initial JS is 38.88 KB raw / 12.56 KB gzip; CSS is 10.07 KB raw / 3.20 KB
  gzip; there are no font downloads; the mobile hero is 8.70 KB. All are under
  budget.
- Fresh mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.00 s, LCP 1.15 s, CLS 0, TBT 73.5 ms. Lighthouse lab
  mode does not report field INP.

## Defects

### P1 — the mandatory claims manifest omits public capability claims

The live demo exposes **Copy receipt** and **Download receipt** actions. The
privacy page also explicitly says, “You can delete assignments.” None has a
corresponding entry in `.factory/claims.json`, and no uniquely tagged
`@claim:receipt-copy`, `@claim:receipt-download`, or assignment-deletion claim
exists. The existing `reschedule-receipt` test proves receipt creation, not
copying or downloading. A non-claim regression test covers one deletion edge,
but that does not satisfy the required manifest/tag contract.

The actions worked in this one independent run, but the supplied claims skill
requires every user-facing capability claim to be listed and tested in the
sandbox. It explicitly treats an unlisted claim as a failed review. Add the
missing manifest entries and one observable tagged test per claim, or remove
those public claims/actions.

### P2 — the real 404 has undersized footer touch targets

At 390 × 844 on a real unknown live URL, the footer links measured:

- Privacy: 53.9 × 19.2 px
- Terms: 38.5 × 19.2 px
- Built by Param Factory: 169.5 × 19.2 px

The header links, skip link, and Return home action on the same page are at
least 44 px high. The three footer links alone miss the required 44 × 44 px
touch-target baseline because `public/404.css` does not apply the main app's
minimum target rule to footer anchors.

## Release condition

Do not promote this candidate. Add complete claim manifest/test coverage for
the public receipt-output and deletion capabilities, and make every 404 footer
link at least 44 × 44 CSS px. Then rerun the exact claim commands and the 390 px
real-404 measurement.
