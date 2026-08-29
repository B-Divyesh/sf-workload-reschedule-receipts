# Adversarial first-read review 4 — PASS

**Reviewed:** 2026-08-29  
**Candidate:** `5f203c5ce39d9f57273d9712360c93be861a316b`  
**Live URL:** <https://workload-reschedule-receipts.sociobot.in>  
**Verdict:** **PASS**

This review found zero blocking, major, or minor findings. The product is
clear in a cold first read, the sample path is isolated and usable, all public
claims have executable evidence, and prior defects remain fixed in both the
deployed product and the source.

## Cold first read

Fresh Chromium contexts, with no prior storage or cookies, opened the root at
390 × 844 and 1440 × 900. No scrolling occurred before answering the three
required questions.

| Viewport | What it does | For whom | First action | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | Reschedules missed study time and shows deadlines at risk. | Students whose missed work could make several assignments turn into one late night. | **Try it with sample data**. | PASS |
| 1440 × 900 | Same. | Same. | **Try it with sample data**. | PASS |

The evidence was the visible first-screen text: “Reschedule missed study
time”; “For students whose missed work block could turn several assignments
into one late night.”; and “A missed block, revised plan, and deadlines at risk
load next.” At 390 px the primary action was fully above the fold at `y=460`,
measured 258 × 47 CSS px, and there was no horizontal overflow. The same action
was visible on desktop. This passes the first-read blocking gate.

The ruled paper, orange detour, clipped receipt panels, system display/mono
type, and restrained motion match `design.md` and are recognisably specific to
an honest rescheduling tool. This is not a generic SaaS template.

## Copy audit

Counts treat URLs, paths, prices, and technical tokens as one word. The audit
includes every landing/README sentence, including the image alternative text
and metadata description where those are visitor-facing. No sentence exceeds
22 words. No banned marketing adjective, unexplained first-use jargon,
inconsistent work-item term, empty slogan, or non-result-naming action was
found.

### Landing page

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 14 | For students whose missed work block could turn several assignments into one late night. | — |
| 2 | 11 | A missed block, revised plan, and deadlines at risk load next. | — |
| 3 | 6 | Your plan stays on this device. | — |
| 4 | 7 | It works offline after your first visit. | — |
| 5 | 8 | Plan up to four active assignments for free. | — |
| 6 | 7 | Add unlimited active assignments for $9 once. | — |
| 7 | 6 | A revised plan shows what moves. | — |
| 8 | 8 | Estimates change only when you choose a trim. | — |
| 9 | 7 | 60 minutes of the biology lab discussion. | — |
| 10 | 6 | Biology returns Wednesday at 6:30 PM. | — |
| 11 | 6 | Citation checks move to Thursday morning. | — |
| 12 | 4 | No estimate was cut. | — |
| 13 | 4 | Calendar events remain unavailable. | — |
| 14 | 9 | Enter each assignment, deadline, time estimate, and estimate confidence. | — |
| 15 | 5 | Import a calendar (.ics) file. | — |
| 16 | 6 | Class, work, and appointments stay blocked. | — |
| 17 | 14 | See a new plan that fits your study hours and lists deadlines at risk. | — |
| 18 | 14 | Enter estimates, protect busy time, and see what can still fit before each deadline. | — |
| 19 | 12 | Rough estimates stay marked in a receipt so you can review them. | — |
| 20 | 8 | Calendar (.ics) files are read in your browser. | — |
| 21 | 13 | Assignment and calendar data stay in this browser unless you export a backup. | — |
| 22 | 16 | The free plan includes rescheduling, calendar import, data export, and a list of deadlines at risk. | — |
| 23 | 12 | Buy once to add unlimited active assignments and keep every past receipt. | — |
| 24 | 4 | Checkout opens with Sociobot. | — |
| 25 | 8 | Reschedule missed study time and see deadline risk. | — |
| 26 | 17 | An orange paper path bends around a missed block, then rejoins a row of green work blocks. | — |
| 27 | 15 | Reschedule missed study time and get a plain receipt of moved work and deadline risk. | — |

Headings name their content: “Example reschedule receipt,” “Reschedule missed
work in three steps,” “What this planner does,” “How calendar data is handled,”
and “Free and paid limits.” The primary and secondary actions name their
result: **Try it with sample data**, **Start with your assignments**, **Read the
privacy details**, **Buy the one-time license**, and **Verify my license**.

### README

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 11 | Reschedule missed study time and see which deadlines are at risk. | — |
| 2 | 11 | Deadline Reality Check keeps a student’s study plan in this browser. | — |
| 3 | 17 | Add assignment estimates, protect busy time with a calendar (.ics) file, then mark a study block missed. | — |
| 4 | 16 | See a new plan that fits your study hours and a list of deadlines at risk. | — |
| 5 | 8 | Try the isolated sample at /?demo=1 or https://workload-reschedule-receipts.sociobot.in/?demo=1. | — |
| 6 | 11 | Plans assignment estimates inside user-set study hours and a daily limit. | — |
| 7 | 7 | Treats imported ICS events as unavailable time. | — |
| 8 | 7 | Rebuilds the plan after a missed block. | — |
| 9 | 9 | Lists moved work, possible user-approved trims, and deadline shortfalls. | — |
| 10 | 9 | Stores real plans in this browser’s IndexedDB database. | — |
| 11 | 9 | Keeps demo state in memory, separate from real plans. | — |
| 12 | 6 | Exports and imports a JSON backup. | — |
| 13 | 7 | Reloads offline after the first online visit. | — |
| 14 | 12 | The free plan supports four active assignments and the complete rescheduling flow. | — |
| 15 | 12 | A $9 one-time license adds unlimited active assignments and saved receipt history. | — |
| 16 | 4 | Checkout opens with Sociobot. | — |
| 17 | 7 | Requirements: Node.js 20 or later and npm. | — |
| 18 | 2 | Open http://localhost:5173. | — |
| 19 | 5 | The demo is at http://localhost:5173/?demo=1. | — |
| 20 | 11 | Playwright 1.58.2 is pinned because the factory image ships matching browsers. | — |
| 21 | 14 | npm test runs unit and browser tests in desktop and 390 px mobile layouts. | — |
| 22 | 16 | Claim tests cover the demo, calendar import, backups, storage, privacy, limits, checkout, receipts, and offline reload. | — |
| 23 | 14 | npm run build writes the static deployment to dist/, with dist/index.html at its root. | — |
| 24 | 9 | Assignments and calendar data stay in this browser. | — |
| 25 | 10 | License checks send the stored token to the Sociobot billing API. | — |
| 26 | 10 | The app uses no analytics, external fonts, or externally hosted page assets. | — |
| 27 | 10 | Read the in-product /privacy and /terms pages for user-facing details. | — |
| 28 | 9 | Deploy the complete dist/ folder as a static site. | — |
| 29 | 16 | staticwebapp.config.json supplies SPA fallback, the designed 404 page, security headers, and the permitted billing API connection. | — |
| 30 | 9 | The factory manages DNS, billing registration, and release infrastructure. | — |
| 31 | 1 | MIT. | — |
| 32 | 2 | See LICENSE. | — |

`assignment` is consistently the user-facing word for a work item. “ICS”
appears only after the README first explains “calendar (.ics) file.”

## Demo and sandbox

The first-screen action opens `/?demo=1` in one click. A fresh 390 px demo
already showed four realistic assignments, protected calendar time, revised
study blocks, a receipt, possible manual trims, and a deadline at risk. The
persistent banner read “Demo — sample data, nothing is saved” and included
**Reset demo** and **Start for real**.

Reset changed the receipt identifier back to the seeded state. Marking the
next block missed created a new receipt identifier and showed “The plan
changed. Read the receipt first.” Starting for real removed the banner and
opened `/planner` with “No assignments yet.” Demo IndexedDB was empty before
exit; the separate real database was opened only on real-plan entry. This
confirms sample actions do not persist into real data.

The complete live demo request log contained only
`https://workload-reschedule-receipts.sociobot.in`. After the service worker
controlled the fresh context, setting it offline and reloading preserved the
sample planner and showed “Offline — your saved plan still works.” No provider
key or decorative AI feature is present. The brief calls for deterministic,
inspectable rescheduling; calendar import, JSON backup import/export, and the
offline PWA cover the implied leverage without unnecessary AI or sync.

## Claims and clean-clone verification

A new clone at `/tmp/drc-review-4.lX8djd` passed `npm ci` (0 vulnerabilities).
Every exact command in `.factory/claims.json` was run in that clone and exited
zero. The tagged tests prove observable behavior rather than merely checking
copy: the plan/receipt changes after a miss, imported fixture events are
avoided, distinctive backup values are restored into an empty real plan,
privacy coverage uses an exact request-path allowlist, five licensed
assignments plan, and the billing test checks the real Dodo redirect host.

| Claim ID | Result |
| --- | --- |
| `reschedule-receipt` | PASS |
| `receipt-copy` | PASS |
| `receipt-download` | PASS |
| `assignment-deletion` | PASS |
| `ics-import` | PASS |
| `data-export` | PASS |
| `data-import` | PASS |
| `demo-isolation` | PASS |
| `local-only` | PASS |
| `free-core` | PASS |
| `paid-checkout` | PASS |
| `offline-reload` | PASS |
| `manual-estimate-trims` | PASS |
| `uncertainty-visible` | PASS |
| `indexeddb-storage` | PASS |
| `license-token-privacy` | PASS |
| `billing-terms` | PASS |

The live landing and README were then cross-checked sentence by sentence.
Every claim-like sentence maps to a manifest entry; no unlisted claim was
found.

`npm test` then passed in the same clean clone: 9 Vitest tests and 62
Playwright tests across desktop and 390 px mobile. `npm run build` passed and
created `dist/`.

## Structure, accessibility, routing, and links

Fresh live checks covered `/`, `/demo`, `/planner`, `/privacy`, `/terms`, and
an unknown URL. Normal routes returned 200 and the unknown route returned a
designed HTTP 404. Every checked route had one h1, main landmark, route-specific
title, description, canonical URL, Open Graph metadata, favicon, Apple touch
icon, and manifest. Titles use the required product/action or route/product
pattern. Mobile pages had no horizontal overflow.

Live Axe scans on all six pages returned zero violations. Normal-page console
logs were empty. The browser’s expected document-load message for the requested
HTTP 404 was the only console output on the intentionally missing URL; no
application error was present. `/demo` → `/privacy` → browser Back restored
focus to “Reschedule your study plan” and populated the polite route
announcement with the same text.

All internal links returned 200, `mailto:` links were explicit, `sociobot.in`
returned 200, and the buy link returned 303 to `checkout.dodopayments.com`.
`robots.txt`, `sitemap.xml`, navigation fallback, response 404 override, and
security headers are present. The live CSP permits only self-hosted page
resources plus the declared Sociobot billing connection and sends
`frame-ancestors` as a response header.

## Earlier finding verification

Every finding in `review-1.md`, `review-2.md`, `review-3.md`, all
`polish-*.md`, and the preceding handoff was rechecked on the live site and in
the current source/tests. Each is fixed, not merely marked fixed.

| Earlier findings | Current confirmation |
| --- | --- |
| F-1-1, F-1-2 | Manual trim behavior and the seeded no-cut receipt are visible; `@claim:manual-estimate-trims` passes. |
| F-1-3, F-1-4, F-1-6, F-1-7, F-1-13 | Unsupported school, grades, merchant/refund, and public provenance promises remain absent. |
| F-1-5 | Rough estimates remain visible in the receipt; `@claim:uncertainty-visible` passes. |
| F-1-8 | README names only the observable Sociobot checkout route. |
| F-1-9, F-1-10 | The named real IndexedDB database persists real plans; demo state stays memory-only; tagged tests pass. |
| F-1-11, F-1-12 | Exact request-path/no-beacon and license origin/method/token/body tests pass. |
| F-1-14 | The live designed 404 has its complete metadata, shell, and return control. |
| F-1-15, F-1-16, F-1-17 | README stays within the word cap and no longer uses `local-first`, `constrained`, or `risk receipt`. |
| F-1-18 through F-1-22 | All formerly mood-based headings now name their sections. |
| F-2-1 through F-2-4 | Visitor copy avoids `risk receipt`, announces Back navigation, names the four/unlimited-assignment entitlement, and introduces calendar `.ics` files plainly. |
| F-3-1 | Demo risk content is now a labelled section; live Axe has zero violations. |
| F-3-2 through F-3-7 | The six formerly weak claim tests now assert changed state, avoided event ranges, restored values, exact traffic, five active licensed assignments, and the Dodo redirect host. |
| F-3-8 through F-3-13 | `assignment` is consistent; the ambiguous instruction and vague/metaphor labels are replaced with plain section/action names. |
| F-3-14, F-3-15 | The 404 h1 says “This page was not found” and Terms has a page-naming h1. |
| F-3-16, F-3-17 | README privacy wording says browser data and externally hosted page assets, not unclear request/CDN jargon. |

The earlier handoff’s one rapid-entry observation did not reproduce in the
fresh full suite or the claim run. It is therefore not an open finding.

## What would make this perfect

No product change is required by this review. Continue to preserve the
one-click isolated demo, the exact request-path privacy test, and the plain
assignment terminology when making future changes.
