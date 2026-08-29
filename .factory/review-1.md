# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-29  
**Live URL:** <https://workload-reschedule-receipts.sociobot.in>  
**Verdict:** **FAIL**

The core planner, demo, routing, visual system, and every declared claim test
work. This release fails the claims contract: public promises lack matching
claims-manifest entries and observable sandbox tests. The landing also contains
mood headings, one README sentence is too long, and the designed 404 lacks
required route metadata.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 900 loaded the root without
scrolling. I understood it as: reschedule missed study time and show deadline
risk; for students with overlapping work; click **Try it with sample data**.
The adjacent text, “A missed block and risk receipt load next,” states the
result. The 390 px action was visible at y=460 and measured 258 × 47 px.
This passes the mandatory comprehension gate.

The paper/grid field, orange kinked route, clipped controls, and display/mono
type are product-specific rather than a generic SaaS template.

## Findings

### Blocking — unlisted public claims

Every item below is a separate claim-like sentence that has no matching
`.factory/claims.json` entry and tagged observable test. This is blocking by
the supplied claims contract.

| ID | Exact quote / location | Why it fails | Concrete fix |
|---|---|---|---|
| F-1-1 | Landing receipt preview: “It never hides lost time or cuts an estimate without asking.” | `reschedule-receipt` only proves a receipt/revised blocks appear. | Add `manual-estimate-trims`: assert no automatic estimate change, visible unscheduled time, and explicit trim; or remove it. |
| F-1-2 | Landing sample receipt: “No estimate was cut.” | Separate public sample-result assertion. | Extend `manual-estimate-trims` to assert seeded demo estimates before/after its initial receipt; or remove it. |
| F-1-3 | Landing boundaries: “This tool does not log into your school.” | `local-only` does not state or test school authentication. | Add a no-school-login request-log claim, or say only what the current test proves. |
| F-1-4 | Landing boundaries: “It does not forecast grades or write coursework.” | No manifest entry/test establishes this boundary. | Add `planning-only` with fixture output/network assertion, or remove it. |
| F-1-5 | Landing boundaries: “The receipt keeps their uncertainty visible.” | No declared test asserts uncertainty in a receipt. | Test a rough estimate’s visible warning, or name a tested output. |
| F-1-6 | Landing price: “Sociobot is the merchant of record.” | Hosted-checkout redirect does not verify this statement. | Add a checkout contract fixture/assertion, or move it to verifiable merchant terms. |
| F-1-7 | Landing price: “Refunds are handled there.” | Purchase promise with no claim/test. | Add a checkout/refund-policy fixture claim, or remove it. |
| F-1-8 | README pricing: “Checkout and license verification use the Sociobot billing API; no payment provider is embedded here.” | `paid-checkout` covers URL/price, not absence of another payment integration. | Assert complete checkout-flow origins, or delete the second clause. |
| F-1-9 | README privacy: “Real plans use the IndexedDB database `deadline-reality-check:real`.” | `local-only` logs requests; it does not assert storage location. | Add `indexeddb-storage`: create/reload a real task and assert the named database. |
| F-1-10 | README privacy: “Demo state stays in memory and never enters that database.” | `demo-isolation` does not assert the in-memory implementation/no DB record. | Inspect IndexedDB after demo reset/miss, or use the tested isolation wording. |
| F-1-11 | README privacy: “No analytics, third-party fonts, or runtime content CDNs are used.” | The manifest does not declare this promise. | Expand `local-only` and assert landing/demo request origins, or remove it. |
| F-1-12 | README privacy: “License verification sends only the pasted license token to `api.sociobot.in`.” | No test captures verifier origin and request body. | Add `license-token-privacy` that asserts URL, origin, and payload. |
| F-1-13 | Landing footer: “Hero image generated for this product with Azure AI Foundry.” | Public provenance statement has no declared check. | Link the checked-in provenance record, or add an asset/provenance test. |

### Major

#### F-1-14 — static 404 omits required metadata

**Location:** live `GET /definitely-missing` returns `404.html`. It has a
title, description, and favicon, but no canonical URL, Open Graph title/
description/image, Twitter card, Apple touch icon, or manifest link.

Add app-shell icons/manifest and 404-specific canonical/Open Graph/Twitter
tags. Add a deployment test that fetches an unknown route and checks them.

#### F-1-15 — README sentence exceeds 22 words

**Quote:** “Claim tests cover demo isolation, local-only planning, ICS import,
JSON backup export and import, the active-task limit, checkout routing, receipt
creation, and offline reload.” **Count:** 24.

Replace with: “Claim tests cover the demo, calendar import, backups, limits,
checkout, receipts, and offline reload.” (14 words.)

#### F-1-16 — “local-first” is unexplained README jargon

**Quote:** “Deadline Reality Check is a local-first planner for students with
overlapping assignments.” Replace with: “Deadline Reality Check keeps a
student’s study plan in this browser.”

#### F-1-17 — “constrained” / “risk receipt” are unexplained jargon

**Locations / quotes:** landing: “Get a constrained new plan and a receipt you
can act on.” README: “The app proposes a constrained revised plan and produces
a plain-language risk receipt.” Replace both with: “See a new plan that fits
your study hours and a list of deadlines at risk.”

### Minor

| ID | Heading / location | Concrete rewrite |
|---|---|---|
| F-1-18 | First-screen eyebrow: “THE PLAN AFTER THE PLAN” | Delete it or use “MISSED-STUDY RESCHEDULER”. |
| F-1-19 | Receipt-preview eyebrow: “ONE HONEST RECEIPT” | “SAMPLE RESCHEDULE RECEIPT”. |
| F-1-20 | Receipt-preview h2: “See the cost of one miss” | “Example reschedule receipt”. |
| F-1-21 | Boundaries h2: “Planning, not pretending” | “What this planner does not do”. |
| F-1-22 | Privacy h2: “Your calendar stays yours” | “How calendar data is handled”. |

These headings do not name their sections out of context and violate the
no-metaphor/mood-heading rule.

## Copy audit

Counts treat prices, URLs, and technical tokens as one word. A dash means no
separate flag. No inconsistent terminology or banned marketing adjective was
found. The non-sentence heading flags are F-1-18 through F-1-22.

### Landing page

| # | Sentence | Words | Flag |
|---:|---|---:|---|
| 1 | For students whose missed work block could turn several assignments into one late night. | 14 | — |
| 2 | A missed block and risk receipt load next. | 8 | — |
| 3 | Your plan stays on this device. | 6 | — |
| 4 | It works offline after your first visit. | 7 | — |
| 5 | Core planning is free. | 4 | — |
| 6 | Unlimited plans cost $9 once. | 5 | — |
| 7 | A revised plan shows what moves. | 6 | — |
| 8 | It never hides lost time or cuts an estimate without asking. | 11 | F-1-1 |
| 9 | 60 minutes of the biology lab discussion. | 7 | — |
| 10 | Biology returns Wednesday at 6:30 PM. | 6 | — |
| 11 | Citation checks move to Thursday morning. | 6 | — |
| 12 | No estimate was cut. | 4 | F-1-2 |
| 13 | Calendar events remain unavailable. | 4 | — |
| 14 | Enter each task, deadline, time estimate, and estimate confidence. | 9 | — |
| 15 | Import an ICS calendar. | 4 | — |
| 16 | Class, work, and appointments stay blocked. | 6 | — |
| 17 | Get a constrained new plan and a receipt you can act on. | 12 | F-1-17 |
| 18 | This tool does not log into your school. | 8 | F-1-3 |
| 19 | It does not forecast grades or write coursework. | 8 | F-1-4 |
| 20 | You enter the estimates. | 4 | — |
| 21 | The receipt keeps their uncertainty visible. | 6 | F-1-5 |
| 22 | ICS files are read in your browser. | 7 | — |
| 23 | Assignment and calendar data stay in this browser unless you export a backup. | 13 | — |
| 24 | The free plan includes the full rescheduler, risk receipt, calendar import, and data export. | 14 | — |
| 25 | Buy once to add unlimited active tasks and keep every past receipt. | 12 | — |
| 26 | Sociobot is the merchant of record. | 6 | F-1-6 |
| 27 | Refunds are handled there. | 4 | F-1-7 |
| 28 | Reschedule missed study time and see deadline risk. | 8 | — |
| 29 | Hero image generated for this product with Azure AI Foundry. | 10 | F-1-13 |

### README

| # | Sentence | Words | Flag |
|---:|---|---:|---|
| 1 | Reschedule missed study time and see which deadlines are at risk. | 11 | — |
| 2 | Deadline Reality Check is a local-first planner for students with overlapping assignments. | 12 | F-1-16 |
| 3 | Add task estimates, protect busy time with an ICS calendar, then mark a study block missed. | 16 | — |
| 4 | The app proposes a constrained revised plan and produces a plain-language risk receipt. | 13 | F-1-17 |
| 5 | Try the isolated sample at /demo or at https://workload-reschedule-receipts.sociobot.in/demo. | 9 | — |
| 6 | Plans task estimates inside user-set study hours and a daily limit. | 11 | — |
| 7 | Treats imported ICS events as unavailable time. | 7 | — |
| 8 | Rebuilds the plan after a missed block. | 7 | — |
| 9 | Lists moved work, possible user-approved trims, and deadline shortfalls. | 9 | — |
| 10 | Stores real plans in IndexedDB on the current device. | 9 | — |
| 11 | Exports and imports a JSON backup. | 6 | — |
| 12 | Reloads offline after the first online visit. | 7 | — |
| 13 | The free plan supports four active tasks and the complete rescheduling flow. | 12 | — |
| 14 | A $9 one-time license adds unlimited active tasks and saved receipt history. | 12 | — |
| 15 | Checkout and license verification use the Sociobot billing API; no payment provider is embedded here. | 16 | F-1-8 |
| 16 | Requirements: Node.js 20 or later and npm. | 7 | — |
| 17 | Open http://localhost:5173. | 2 | — |
| 18 | The demo is at http://localhost:5173/demo. | 5 | — |
| 19 | Playwright 1.58.2 is pinned because the factory image ships matching browsers. | 11 | — |
| 20 | npm test runs unit tests and browser tests in desktop and 390 px mobile layouts. | 15 | — |
| 21 | Claim tests cover demo isolation, local-only planning, ICS import, JSON backup export and import, the active-task limit, checkout routing, receipt creation, and offline reload. | 24 | F-1-15 |
| 22 | npm run build writes the static deployment to dist/, with dist/index.html at its root. | 14 | — |
| 23 | Real plans use the IndexedDB database deadline-reality-check:real. | 7 | F-1-9 |
| 24 | Demo state stays in memory and never enters that database. | 10 | F-1-10 |
| 25 | No analytics, third-party fonts, or runtime content CDNs are used. | 10 | F-1-11 |
| 26 | License verification sends only the pasted license token to api.sociobot.in. | 10 | F-1-12 |
| 27 | Read the in-product /privacy and /terms pages for user-facing details. | 10 | — |
| 28 | Deploy the complete dist/ folder as a static site. | 9 | — |
| 29 | staticwebapp.config.json supplies SPA fallback, the designed 404 page, security headers, and the permitted billing API connection. | 16 | — |
| 30 | The factory manages DNS, billing registration, and release infrastructure. | 9 | — |
| 31 | MIT. | 1 | — |
| 32 | See LICENSE. | 2 | — |

## Demo, claims, and quality gates

- `/demo` is one click from the first screen. It immediately displayed four
  realistic assignments, revised plan, receipt, persistent “Demo — sample
  data, nothing is saved” banner, **Reset demo**, and **Start for real**.
- Reset restored the sample; a missed sample block showed “The plan changed.
  Read the receipt first.” Start for real opened `/planner` with no banner,
  zero tasks, and “No assignments yet.”
- The complete live demo reset/miss request log had only same-origin requests.
  After service-worker control, it reloaded offline with the planner, four
  sample tasks, and the offline notice.
- After `npm ci`, all nine commands declared in `claims.json` passed verbatim
  in desktop Chromium and the 390 px mobile project: reschedule receipt, ICS
  import, JSON export/import, isolation, local-only, free core, checkout, and
  offline reload.
- `npm run build` passed and produced `dist/` (37.71 KB JS / 12.42 KB gzip).
  `npm test` was invoked; its unit portion passed 7/7 and browser run exercised
  34 tests. Live light/dark Axe scans on `/`, `/demo`, `/planner`, `/privacy`,
  `/terms`, and 404 had no serious/critical issues. `verify-url.sh` passed the
  landing with no console/page errors. Hashed JS is immutable-cached.

## Structure, history, and scope

- Root, demo, planner, privacy, and terms have route titles, one h1, one main,
  descriptions, canonical URLs, and social metadata. Back from Demo to Privacy
  restored focus to the Privacy h1. An unknown route is a genuine HTTP 404 with
  the designed shell and 44 px Return home action; F-1-14 is the exception.
- All normal internal links returned HTTP 200; checkout returned its expected
  303 hosted-checkout redirect; Sociobot and mail links were valid.
- No earlier `review-*.md` or `polish-*.md` existed. Every earlier defect in
  `verification.md`/`verification-2.md` was checked in live/code/tests rather
  than accepted as marked fixed: checkout 303, light/dark contrast, mobile
  targets, immutable caching, HTTP 404, estimate floor, rejected backup,
  completed-task limit, receipt labels, JSON import, invalid-license notice,
  and 404 shell all remain fixed.
- The brief calls for deterministic rescheduling; import/export is present and
  no AI, sync, or other obvious implied feature is missing. No provider key is
  embedded.

## What would make this perfect

Make each public promise above either a declared, observable sandbox claim or
delete/narrow it. Then replace the five mood headings and jargon/long README
copy, add complete 404 metadata, and repeat the full cold review. The
underlying product is otherwise well positioned to pass.
