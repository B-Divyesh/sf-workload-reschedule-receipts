# Adversarial first-read review 2 — FAIL

**Reviewed:** 2026-08-29  
**Live URL:** <https://workload-reschedule-receipts.sociobot.in>  
**Verdict:** **FAIL**

The product is immediately tryable and the core planning flow is clear. It
does not pass this round because a prior jargon finding is only partly fixed,
the back-button route change is not announced, and the price/copy vocabulary
still has avoidable first-read ambiguity.

## Cold first read

Fresh Chromium contexts loaded the live root at 390 × 844 and 1440 × 900,
without scrolling. Before scrolling, the answer was:

- **What it does:** reschedules missed study time and shows deadline risk.
- **For whom:** students whose missed work could turn assignments into a late
  night.
- **What to click first:** **Try it with sample data**; the nearby note says a
  missed block and result load next.

The mobile action was visible at y=460 and measured 258 × 47 px. This passes
the mandatory first-screen comprehension gate. The ruled-paper, orange-kink,
clipped-corner system is distinct from a generic SaaS template.

## Findings

### Blocking

#### F-2-1 — previously fixed jargon finding has regressed / is half-fixed

**Previous finding:** `F-1-17`  
**Locations / exact quotes:** landing hero action note, “A missed block and
risk receipt load next.”; pricing copy, “The free plan includes the full
rescheduler, risk receipt, calendar import, and data export.”

The prior review explicitly identified **“risk receipt”** as unexplained
jargon and the polish record says it was replaced. It remains on the live
landing, including the first action’s explanation. A first-time student can
understand “revised plan” and “deadlines at risk”; “risk receipt” is a product
term with no useful meaning before the sample has loaded.

Replace the action note with: “A missed block, revised plan, and deadlines at
risk load next.” Replace the price copy with: “The free plan includes
rescheduling, calendar import, data export, and a list of deadlines at risk.”
Update the copy audit and retain the existing `reschedule-receipt` observable
test.

### Major

#### F-2-2 — back navigation does not announce the new route

**Location:** live `/demo` → header **Privacy** → browser Back.  
**Evidence:** focus correctly moved to the `/demo` h1, “Rebuild the plan you
have”, but the `#route-status[aria-live="polite"]` value was empty after Back.

This leaves a screen-reader visitor without the required route-change
announcement when using the browser Back button. The forward SPA navigation
does populate the live region, so the omission is isolated to `popstate`.

After `render()` in the `popstate` handler, set `#route-status` to the new h1
text, as `navigate()` already does. Add a browser test that navigates from
Demo to Privacy, calls Back, and asserts both h1 focus and the polite
announcement.

### Minor

#### F-2-3 — first-screen price fact uses an inconsistent, vague entitlement

**Location / quote:** landing facts: “Core planning is free. Unlimited plans
cost $9 once.”

“Core planning” does not say what is free, and “unlimited plans” is not the
licensed entitlement. Elsewhere the product correctly says four active tasks
are free and the license adds unlimited **active tasks**. This makes the
first-screen price fact less useful and changes the name of the thing being
sold.

Replace it with: “Plan up to four active tasks for free. Add unlimited active
tasks for $9 once.” The existing `free-core` and `paid-checkout` tests cover
the revised facts.

#### F-2-4 — `ICS` is unexplained at first use

**Locations / quotes:** landing step 2, “Import an ICS calendar.”; README,
“Add task estimates, protect busy time with an ICS calendar, then mark a study
block missed.”

`ICS` is a calendar-file format, not a term a first-time student can be
expected to know. The app explains it later, but the first instruction should
not require that discovery.

Use “calendar (.ics) file” on first mention, for example: “Import a calendar
(.ics) file.” Use `ICS` after that only where the technical filename matters.

## Copy audit

Word counts treat URLs, paths, prices, and technical tokens as one word. No
sentence exceeds 22 words. `F-2-1`, `F-2-3`, and `F-2-4` are the copy flags;
no banned marketing adjective was found.

### Landing page

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 14 | For students whose missed work block could turn several assignments into one late night. | — |
| 2 | 8 | A missed block and risk receipt load next. | F-2-1 |
| 3 | 6 | Your plan stays on this device. | — |
| 4 | 7 | It works offline after your first visit. | — |
| 5 | 4 | Core planning is free. | F-2-3 |
| 6 | 5 | Unlimited plans cost $9 once. | F-2-3 |
| 7 | 6 | A revised plan shows what moves. | — |
| 8 | 8 | Estimates change only when you choose a trim. | — |
| 9 | 7 | 60 minutes of the biology lab discussion. | — |
| 10 | 6 | Biology returns Wednesday at 6:30 PM. | — |
| 11 | 6 | Citation checks move to Thursday morning. | — |
| 12 | 4 | No estimate was cut. | — |
| 13 | 4 | Calendar events remain unavailable. | — |
| 14 | 9 | Enter each task, deadline, time estimate, and estimate confidence. | — |
| 15 | 4 | Import an ICS calendar. | F-2-4 |
| 16 | 6 | Class, work, and appointments stay blocked. | — |
| 17 | 13 | See a new plan that fits your study hours and deadlines at risk. | — |
| 18 | 14 | Enter estimates, protect busy time, and see what can still fit before each deadline. | — |
| 19 | 12 | Rough estimates stay marked in a receipt so you can review them. | — |
| 20 | 7 | ICS files are read in your browser. | — |
| 21 | 13 | Assignment and calendar data stay in this browser unless you export a backup. | — |
| 22 | 14 | The free plan includes the full rescheduler, risk receipt, calendar import, and data export. | F-2-1 |
| 23 | 12 | Buy once to add unlimited active tasks and keep every past receipt. | — |
| 24 | 4 | Checkout opens with Sociobot. | — |
| 25 | 8 | Reschedule missed study time and see deadline risk. | — |

Headings name their sections sufficiently in context. Landing buttons use
result-naming verbs; the demo-specific **Start for real** action is required
by the demo contract.

### README

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 11 | Reschedule missed study time and see which deadlines are at risk. | — |
| 2 | 12 | Deadline Reality Check keeps a student’s study plan in this browser. | — |
| 3 | 16 | Add task estimates, protect busy time with an ICS calendar, then mark a study block missed. | F-2-4 |
| 4 | 16 | See a new plan that fits your study hours and a list of deadlines at risk. | — |
| 5 | 8 | Try the isolated sample at /demo or https://workload-reschedule-receipts.sociobot.in/demo. | — |
| 6 | 11 | Plans task estimates inside user-set study hours and a daily limit. | — |
| 7 | 7 | Treats imported ICS events as unavailable time. | — |
| 8 | 7 | Rebuilds the plan after a missed block. | — |
| 9 | 9 | Lists moved work, possible user-approved trims, and deadline shortfalls. | — |
| 10 | 9 | Stores real plans in this browser’s IndexedDB database. | — |
| 11 | 9 | Keeps demo state in memory, separate from real plans. | — |
| 12 | 6 | Exports and imports a JSON backup. | — |
| 13 | 7 | Reloads offline after the first online visit. | — |
| 14 | 12 | The free plan supports four active tasks and the complete rescheduling flow. | — |
| 15 | 12 | A $9 one-time license adds unlimited active tasks and saved receipt history. | — |
| 16 | 4 | Checkout opens with Sociobot. | — |
| 17 | 7 | Requirements: Node.js 20 or later and npm. | — |
| 18 | 2 | Open http://localhost:5173. | — |
| 19 | 5 | The demo is at http://localhost:5173/demo. | — |
| 20 | 11 | Playwright 1.58.2 is pinned because the factory image ships matching browsers. | — |
| 21 | 14 | npm test runs unit and browser tests in desktop and 390 px mobile layouts. | — |
| 22 | 16 | Claim tests cover the demo, calendar import, backups, storage, privacy, limits, checkout, receipts, and offline reload. | — |
| 23 | 14 | npm run build writes the static deployment to dist/, with dist/index.html at its root. | — |
| 24 | 6 | Planning requests stay on this site. | — |
| 25 | 11 | License checks send the stored token to the Sociobot billing API. | — |
| 26 | 10 | No analytics, third-party fonts, or runtime content CDNs are used. | — |
| 27 | 10 | Read the in-product /privacy and /terms pages for user-facing details. | — |
| 28 | 9 | Deploy the complete dist/ folder as a static site. | — |
| 29 | 16 | staticwebapp.config.json supplies SPA fallback, the designed 404 page, security headers, and the permitted billing API connection. | — |
| 30 | 9 | The factory manages DNS, billing registration, and release infrastructure. | — |
| 31 | 1 | MIT. | — |
| 32 | 2 | See LICENSE. | — |

## Demo, sandbox, claims, and quality gates

- The first-screen demo link is one click. `/demo` immediately showed four
  named sample assignments, the revised study blocks, a receipt, and the
  persistent “Demo — sample data, nothing is saved” banner.
- **Reset demo** restored the sample. **Start for real** removed the banner
  and reached an empty `/planner` once the navigation completed. Direct fresh
  `/demo` and `/?demo=1` visits had no IndexedDB database; demo reset/miss
  never wrote a real plan.
- A live Playwright request log across landing, demo, reset, and real-plan
  transition contained only same-origin requests. A service-worker-controlled
  live demo also reloaded offline with all four tasks, its banner, and the
  offline notice.
- All 14 commands in `.factory/claims.json` passed verbatim after `npm ci`:
  `reschedule-receipt`, `ics-import`, `data-export`, `data-import`,
  `demo-isolation`, `local-only`, `free-core`, `paid-checkout`,
  `offline-reload`, `manual-estimate-trims`, `uncertainty-visible`,
  `indexeddb-storage`, `license-token-privacy`, and `billing-terms`.
- The live landing and README claim-like copy maps to those entries; no
  additional unlisted public claim was found.
- `npm test` passed: 7 Vitest tests and 48 Playwright checks. `npm run build`
  passed and produced `dist/`.

## Structure, accessibility, and links

- `/`, `/demo`, `/planner`, `/privacy`, and `/terms` each returned 200 with a
  route-specific title, one h1, one main, description, canonical, Open Graph,
  Twitter, favicon, and manifest metadata. `/no-such-review-route` returned a
  real 404 with the designed static shell and complete metadata.
- All landing internal links returned 200. The Sociobot checkout is an
  external hosted-checkout link; the Param Factory link is external.
- Light and dark live Axe scans of landing, demo, planner, privacy, terms, and
  404 found zero serious or critical violations. Ordinary routes generated no
  console/page errors. The intentional HTTP 404 itself logs the expected
  browser failed-resource message.
- Forward client navigation updates heading focus and the polite status
  region. Browser Back restores heading focus but has the missing announcement
  recorded in F-2-2.
- The design matches `.factory/design.md`: original paper-plan art, ruled
  paper palette, display/mono type, clipped shapes, and reduced-motion CSS.
  The brief does not imply an AI feature, sync service, or additional import
  format beyond the supplied ICS/JSON paths; no AI key is embedded.

## Earlier-history verification

Read `.factory/review-1.md`, `.factory/polish-1.md`, all
`.factory/verification*.md`, and the prior handoff. The following is verified
on the current live build and source, not accepted merely because a prior
record marked it fixed.

| Earlier finding | Current status |
| --- | --- |
| F-1-1 | Fixed: manual-trim claim and test pass. |
| F-1-2 | Fixed: seeded receipt shows no cut; trim test passes. |
| F-1-3 | Fixed: unsupported school-login statement is absent. |
| F-1-4 | Fixed: unsupported grades/coursework statement is absent. |
| F-1-5 | Fixed: rough estimates are visibly marked and tested. |
| F-1-6 | Fixed: landing uses the observable checkout route rather than merchant wording. |
| F-1-7 | Fixed: unsupported landing refund sentence is absent. |
| F-1-8 | Fixed: README checkout wording is now observable. |
| F-1-9 | Fixed: real IndexedDB persistence has a tagged test. |
| F-1-10 | Fixed: direct demo stays memory-only and separate from real storage. |
| F-1-11 | Fixed: same-origin demo request assertion covers runtime traffic. |
| F-1-12 | Fixed: license verifier origin, method, query token, and body are tested. |
| F-1-13 | Fixed: untestable public provenance statement is absent. |
| F-1-14 | Fixed: static 404 has canonical, social, icon, and manifest metadata. |
| F-1-15 | Fixed: README has no sentence over 22 words. |
| F-1-16 | Fixed: README no longer calls the product “local-first.” |
| F-1-17 | **Regressed / half-fixed:** `risk receipt` remains; re-opened as F-2-1. |
| F-1-18 | Fixed: first eyebrow is “Missed-study rescheduler.” |
| F-1-19 | Fixed: receipt-preview eyebrow names the sample. |
| F-1-20 | Fixed: receipt-preview heading names the section. |
| F-1-21 | Fixed: planning-scope heading names its content. |
| F-1-22 | Fixed: calendar-data heading names its content. |

The earlier verification findings for checkout availability, dark contrast,
mobile targets, immutable assets, genuine 404, invalid backup recovery,
receipt labels, and offline behavior also remain fixed on the live build.

## What would make this perfect

Remove the residual `risk receipt` jargon everywhere visitor-facing, make the
price fact name the four-task and unlimited-active-task limits, introduce the
calendar file format in plain words, and announce Back/Forward route changes.
Then rerun the complete cold review, all claims, and the screen-reader route
test. No product-scope feature is otherwise missing.
