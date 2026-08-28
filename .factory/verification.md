# Independent verification 1 — FAIL

**Candidate:** `138e73f1558ac8a07e54eab526fbe25655ac6cfe`  
**Live URL:** <https://workload-reschedule-receipts.sociobot.in>  
**Verified:** 2026-08-28 (fresh checkout)

## Verdict

**FAIL.** The core local planner works and the shipped public assets match the
candidate build, but the live paid purchase action returns HTTP 404. In
addition, the required dark treatment has six serious axe contrast failures
on every route and the 390 px UI has many controls below the required 44 px
touch target. These are release-blocking acceptance failures.

## First-read and demo gate

Cold-loading the live landing page in a fresh browser context produced:

- **What it does:** “Reschedule missed study time.”
- **For whom:** “For students whose missed work block could turn several
  assignments into one late night.”
- **First action:** visible “Try it with sample data”, with “A missed block
  and risk receipt load next.” alongside it.

This passes the plain-words first-screen gate. The link is one click and opens
`/demo`, which shows the persistent “Demo — sample data, nothing is saved”
banner, Reset demo, Start for real, a plan, and a receipt.

## Clean-checkout tests

Ran `npm ci` from the candidate checkout. `npm test` was invoked; because the
console runner cuts a combined command at 30 seconds, I also ran its exact
constituents to completion:

- `npm run test:unit`: **4/4 passed**.
- `npx playwright test --project=chromium --reporter=line`: **9/9 passed**.
- `npx playwright test --project=mobile --reporter=line`: **9/9 passed**.
- `npm run build`: **passed**. `dist/` was produced. Entry JS: 34.45 KB raw,
  11.49 KB gzip; CSS: 9.86 KB raw, 3.17 KB gzip.

All required claim commands were run verbatim after `npm ci`; each passed in
both configured browser projects:

| Claim | Result |
| --- | --- |
| `reschedule-receipt` | PASS — missed sample block created a revised plan and receipt |
| `ics-import` | PASS — shipped two-event ICS fixture imported |
| `data-export` | PASS — JSON backup downloaded and parsed |
| `demo-isolation` | PASS — Start for real showed an empty real plan |
| `local-only` | PASS — demo flow made only same-origin requests |
| `free-core` | PASS — four tasks accepted; fifth refused with the stated limit |
| `paid-checkout` | PASS in sandbox — exact price/link and mocked verification/history flow |
| `offline-reload` | PASS — demo reloaded offline after service-worker control |

The checkout claim test only asserts the link and mocks verification. It does
not prove that the actual production checkout is live; the independent live
check below found that it is not.

## Independent end-to-end evidence

- Normal demo flow: marked a sample block missed and received a replacement,
  revised blocks, and risk receipt; Start for real loaded an empty real plan.
- Error/recovery paths: empty task/course/deadline, past deadline, malformed
  ICS, malformed JSON backup, and an end hour earlier than start all produced
  specific recovery messages. Normal future task creation and the miss flow
  work.
- Keyboard: Tab reaches the skip link first with a visible 3 px focus outline;
  Enter on a focused Missed control creates the receipt. No console/page errors
  observed.
- PWA: live `/demo` obtained service-worker control (`drc-v3`), then reloaded
  offline with the planner and “Offline — your saved plan still works.” banner.
  The worker source uses `skipWaiting`, `clients.claim`, and an update-found
  notification. Reduced-motion context reports `0.01ms` transitions and
  `scroll-behavior: auto`.
- Privacy/network: complete demo reset/reschedule traffic was same-origin;
  no analytics or third-party font/CDN request was observed. The only allowed
  external product endpoint is the Sociobot billing API when a license is
  verified.
- Deployment identity: live `index.html`, JS, CSS, worker, manifest, icons,
  images, robots, sitemap, and 404 assets byte-match `dist/` from this commit.
  (`staticwebapp.config.json` is deployment configuration, not a public asset.)
- Response policy: live HTML has HTTPS, CSP, `nosniff`, strict-origin referrer
  policy, and a restrictive permissions policy. A rapid burst to
  `GET /api/v1/products/workload-reschedule-receipts/verify?license=qa-invalid-token`
  first returned **429 at request 31**, with `Retry-After: 3` and
  `X-RateLimit-After: 3`.
- `/opt/fleet/lib/verify-url.sh` passed against the live home page: HTTP 200,
  724 ms load, title/lang/one h1/main/alt/button checks present, zero console
  errors.
- Independent axe scan: light scheme has no serious/critical findings on
  `/`, `/demo`, `/planner`, `/privacy`, and `/terms`; dark scheme does not.

## Defects

### P1 — production checkout is dead

The live “Buy the one-time license” link is
`https://api.sociobot.in/api/v1/products/workload-reschedule-receipts/checkout`.
Fresh direct request on 2026-08-28 returned **HTTP 404** with
`{"error":"enabled factory product","status":404}`. This makes the paid
offer’s promised $9 one-time purchase impossible. Register/enable the product
and validate the redirect/return-token path against the live deployment before
release.

### P1 — dark mode has six serious contrast failures on every product route

With `prefers-color-scheme: dark`, axe reports 1.1:1 contrast for the footer
text and links: the product one-liner, Privacy, Terms, Built by Param Factory,
version, and generated-image disclosure. Computed foreground is `#111815` on
`#050a08`; normal text requires at least 4.5:1. This contradicts the design
record’s dark-treatment and contrast commitments.

### P1 — mobile interactive targets violate the 44 px minimum

At 390 px, core planner controls are too short: Done is 54×38 px and Missed
is 69×38 px. The demo controls are 120×37 and 159×37 px, and header navigation
links are as small as 35×16 px. These are direct-touch controls on the primary
PWA flow and do not meet the stated 44×44 px requirement.

### P2 — hashed production assets are not immutable-cached

The live hashed JS and CSS both return
`Cache-Control: public, must-revalidate, max-age=30`, rather than a long-lived
immutable cache policy. This fails the static/PWA caching requirement and
causes unnecessary revalidation after every 30 seconds despite content-hashed
filenames.

### P2 — unknown routes return 200 rather than a real 404

`GET /not-a-route` returns HTTP 200 with the SPA shell. Client-side rendering
does show the designed not-found screen, but the server response is not a real
404 as required for the documented site structure. Configure the deployment
fallback/404 handling so unknown paths deliver the designed page with status
404 without breaking valid SPA routes.

## Release condition

Do not promote this candidate until the P1 defects are fixed and independently
rechecked on the live URL. Recheck the checkout without mocks, dark-mode axe,
and measured 390 px targets; then address the two P2 deployment-policy defects.
