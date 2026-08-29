# Independent verification 2 — FAIL

**Candidate:** `cb4213ac590f9c08dbf71bcafd99662be17f4446`  
**Live URL:** <https://workload-reschedule-receipts.sociobot.in>  
**Verified:** 2026-08-29 from the clean `main` checkout

## Verdict

**FAIL.** The candidate is deployed byte-for-byte, the earlier checkout,
contrast, target-size, caching, and 404-status failures are repaired, and all
declared claim commands pass. However, independent boundary testing found
release-blocking correctness defects in estimate trimming, backup recovery,
the four-active-task limit, and receipt history. The README also advertises
JSON import without a matching entry and tagged test in the mandatory claims
manifest.

No product code was changed during this verification.

## First-read and one-click demo gate

The cold live landing page passes the mandatory gate at desktop and 390 px:

- **What it does:** “Reschedule missed study time.”
- **For whom:** students whose missed block could cascade across assignments.
- **What to click:** “Try it with sample data,” with “A missed block and risk
  receipt load next” beside it.
- The action is visible without scrolling at 390×844 and opens `/demo` in one
  click. The first demo screen already shows four realistic assignments, a
  revised plan, a receipt, and the persistent “Demo — sample data, nothing is
  saved” banner with Reset demo and Start for real.

## Mandatory claims gate

The very first claim invocation, before dependency installation, could not
start because a clean clone has no `node_modules` (`vitest: not found`). After
the required `npm ci`, every command from `.factory/claims.json` was rerun
verbatim. All eight passed in both configured browser projects. Each claim tag
occurs exactly once in `tests/`.

| Claim | Declared test result | Evidence |
| --- | --- | --- |
| `reschedule-receipt` | PASS | 2/2 desktop/mobile; a missed block produced a revised plan and receipt |
| `ics-import` | PASS | 2/2; the two-event fixture imported |
| `data-export` | PASS | 2/2; the downloaded JSON parsed with required arrays |
| `demo-isolation` | PASS | 2/2; leaving demo opened an empty real plan |
| `local-only` | PASS | 2/2; the tested demo flow made no cross-origin request |
| `free-core` | PASS for its narrow scenario | 2/2; four newly added tasks worked and a fifth was refused. Independent completed-task testing below falsifies the word “active.” |
| `paid-checkout` | PASS | 2/2; exact price/link, live non-purchase redirect, and mocked valid-license history state |
| `offline-reload` | PASS | 2/2; the controlled demo reloaded offline |

Cross-checking copy against the manifest found an unlisted claim: README says
“Exports and imports a JSON backup,” and the planner offers “Import a backup,”
but `claims.json` contains only `data-export`. No `@claim` test exercises JSON
import. Under the claims acceptance contract, this omission is independently
release-blocking.

## Clean-checkout gates

Commands and results:

```text
npm ci        PASS — 61 packages installed; 0 vulnerabilities
npm test      PASS — 6/6 Vitest and 22/22 Playwright tests
npm run build PASS — strict TypeScript and Vite production build
```

There is no separate lint script. The build produced `dist/index.html`.
Initial assets are 34.45 KB JS / 11.49 KB gzip and 10.07 KB CSS / 3.20 KB
gzip, well below the 200 KB JS and 50 KB CSS budgets.

`/opt/fleet/lib/verify-url.sh` passed locally in 599 ms and live in 752 ms:
title, `lang`, one h1, main, image alt text, button names, and zero ordinary
load errors.

## Independent end-to-end checks

Passing paths:

- Demo Reset restored four tasks and the sample receipt. Start for real opened
  an empty real namespace.
- A normal two-hour assignment produced two blocks and survived reload through
  IndexedDB. A separate task also survived closing its tab and opening the
  planner in a new tab within the same browser context.
- Blank input, a past deadline, end hour before start hour, malformed ICS, and
  syntactically malformed JSON produced specific recovery messages.
- A 30-minute task due in 20 minutes correctly showed no fitting block and a
  30-minute shortfall.
- A valid JSON export imported into a fresh browser context with the same task
  and risk and no page error.
- Mark missed produced a revised plan and receipt; Copy receipt worked.
- The shipped two-event ICS fixture, four-task boundary, checkout routing, and
  offline reload also passed through the declared tests.

## Defects

### P1 — repeated trims create negative estimates and dishonest receipts

On live `/demo`, choose the first **Trim 30 min** action five times. The HIST
118 task changes from 120 minutes to the displayed value **“-1 hr -30 min.”**
Both trim buttons remain available, and “You chose one 30-minute trim” is
appended five times. The planner therefore permits trimming below zero and can
base its risk receipt on impossible input. This violates the core requirement
to keep user-entered estimates and uncertainty honest.

### P1 — a rejected backup corrupts the running planner

On local and live `/planner`:

1. Open Study limits and data.
2. Import the syntactically valid but incomplete JSON
   `{"tasks":[],"settings":{}}`.
3. The app says the backup could not be read.
4. Enter a valid assignment and choose Add assignment and plan it.

The assignment is not added and the page raises the uncaught error
`Cannot read properties of undefined (reading 'some')`. The rejected value was
assigned to in-memory state before validation/rendering completed. Reloading
restores the previously persisted state, but the shown rejection message does
not tell the user that reload is required.

### P1 — “four active tasks” counts completed tasks

On a fresh live plan, add four 30-minute tasks, then mark all four blocks Done.
The planner has zero remaining blocks, yet the counter stays **4 / 4 free
tasks** and a new task is rejected with “The free plan holds four active
tasks.” Completed tasks are still counted as active. This falsifies the
declared `free-core` claim at a normal lifecycle boundary and incorrectly
pushes a user toward the paid tier.

### P1 — deleting a task damages its receipt and paid history

The demo begins with a receipt naming “Draft biology lab discussion.” Delete
that assignment and accept the confirmation. The receipt remains but now says
**“Missed: 1 hr of at …”** because receipts store only a task id, not the task
label. The same orphaning applies to saved paid receipt history, whose advertised
purpose is to keep every past receipt.

### P1 — JSON import is an unlisted public claim

README and the live planner advertise JSON import, but `.factory/claims.json`
has no import claim and there is no tagged import test. The manifest only tests
export. The claims contract explicitly makes any unlisted visitor-facing
claim a failed review.

### P2 — a cached invalid license loses its required notice

Opening `/demo?license=qa-invalid-live` strips the token from the address bar,
stores it, calls only the Sociobot verifier, locks paid features, and initially
shows “This license is no longer active.” On reload, the cached invalid verdict
prevents another request as intended, but the notice disappears. The paid
unlock contract requires the quiet notice whenever a verdict is invalid.

### P2 — the real 404 omits the standard shell and has a small touch target

An unknown live URL correctly returns HTTP 404 and has a title, `lang`, one h1,
one main, and no serious/critical axe finding. However, it is a separate static
page with no standard header, footer, navigation, generated-image disclosure,
or build id. At 390 px its only Return home link measures 119×21 px, below the
44 px touch-target requirement. It also does not provide the documented dark
treatment.

## Live deployment, privacy, and billing evidence

- Candidate identity: live index, hashed JS/CSS, source map, service worker,
  manifest, 404 assets, icons, images, robots, and sitemap all SHA-256
  byte-match this candidate’s `dist/` output.
- The earlier deployment-only purchase failure is fixed. The live checkout
  endpoint returned HTTP **303** to hosted Dodo checkout; no payment was made.
- Billing allowance is enforced. One client received 30 HTTP 200 verifier
  responses; request **31** returned HTTP **429** with `Retry-After: 3` and
  `X-RateLimit-After: 3`.
- A complete live demo reset/reschedule log contained only the document and
  hashed same-origin JS/CSS: three requests, zero cross-origin requests. The
  landing image is also same-origin. A license flow sent only the dummy token
  to `api.sociobot.in`.
- Browser-observed HTML headers include HTTPS/HSTS, CSP with `frame-ancestors`
  in the response, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive
  Permissions Policy.
- Hashed JS/CSS return `Cache-Control: public, max-age=31536000, immutable`.
  HTML and the service worker revalidate after 30 seconds. Unknown routes
  return a real 404.
- All discovered internal links returned 200; Sociobot returned 200; checkout
  returned the expected 303; mail links were present and well formed.
- The app has no sign-in and no product backend. Entra, backend concurrency,
  server persistence, and package/CLI consumer checks are not applicable.
- Deterministic constrained scheduling is appropriate here; the brief does not
  imply an AI feature, so there is no missed AI leverage finding.

## Structure, docs, and visual contract

- README identifies the audience and job, and documents run, test, deployment,
  privacy, and purchase behavior. MIT `LICENSE`, `/privacy`, and `/terms` are
  present. The untested import sentence is the claims exception described
  above.
- `.factory/design.md` records a product-specific generative-geometry
  direction, palette, type, spacing, interaction grammar, motion policy, dark
  treatment, and original-image prompt/provenance. The shipped responsive hero
  is 8.7/26.7 KB, and the social image is a real 1200×630 asset.
- The main routes provide route titles, canonical URLs, descriptions, Open
  Graph/Twitter metadata, favicon, manifest, robots, sitemap, consistent app
  shell, and build version. The static 404 exception is reported above.

## Accessibility, responsive layout, and motion

- Live axe scans in both light and dark schemes found zero serious/critical
  issues on `/`, `/demo`, `/planner`, `/privacy`, and `/terms`.
- Every audited route had `lang=en`, a route-specific title, exactly one h1,
  one main, and no heading-level skips or ordinary console/page errors.
- Keyboard Tab exposed a 3 px yellow focus ring on the skip link. Enter moved
  the sequential focus point to main content; the next Tab reached Task.
  Keyboard navigation reached a Missed control and Enter produced the receipt.
- At 390×844, landing and demo had zero horizontal overflow and no visible
  interactive element below 44×44 px. The primary demo action was visible at
  y=460 in the first screen. The layout also retained content with body text
  resized to 200% at desktop width.
- Reduced-motion emulation matched the media query, reduced transition and
  animation durations to `0.01ms`, and set scroll behavior to `auto`.

## PWA and performance

- Manifest response has the correct MIME type, standalone display, scoped and
  versioned start URL, 192/512 icons, a 512 maskable icon, and matching theme
  colors. Image dimensions were verified from the shipped files.
- Live service worker control used cache `drc-v3`, containing the hashed JS and
  CSS. Registering the same worker under a changed script URL caused an update,
  displayed “An update is ready. Reload to use it,” and changed the controller.
- With the browser then offline, `/demo` reloaded with its heading, all four
  sample tasks, and “Offline — your saved plan still works,” with no errors.
- Fresh Lighthouse 13.4.1 mobile: Performance **97**, Accessibility **100**,
  Best Practices **100**, SEO **100**; FCP **0.9 s**, LCP **1.1 s**, TBT
  **180 ms**, CLS **0**, total transfer **27,066 bytes**, and no third-party
  resources.
- Ten live missed-block UI mutations took 4.3–6.8 ms (5.8 ms median), below
  the 200 ms interaction budget.

## Release condition

Do not promote this candidate. Fix the four P1 product defects, add a declared
and tagged JSON-import claim test, then rerun every claim from a clean install
and repeat live independent boundary checks. The P2 paid-state and 404-shell
defects should be repaired in the same release.
