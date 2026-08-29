# Adversarial first-read review 3 — FAIL

**Reviewed:** 2026-08-29  
**Candidate:** `e2f7952af39f4bfbf755f8aa5296534bca95e5a8`  
**Live URL:** <https://workload-reschedule-receipts.sociobot.in>  
**Verdict:** **FAIL**

The product is clear, tryable, visually distinct, and functionally sound. It
still fails the zero-finding standard. A known accessibility defect remains,
six declared claim tests can pass without proving their complete claims, and
the public copy still contains inconsistent terms, vague wording, decorative
labels, and metaphor headings.

## Cold first read

Fresh Chromium contexts opened the production root without prior storage,
cookies, or scrolling.

| Viewport | What it does | For whom | First action | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | Reschedules missed study time and shows deadlines at risk. | Students whose missed work could turn several assignments into a late night. | **Try it with sample data**; the adjacent sentence says a revised plan and deadlines at risk load next. | PASS |
| 1440 × 900 | Same answer. | Same answer. | Same visible action and explanation. | PASS |

The mobile action was fully visible at `x=20, y=460`, measured `258 × 47`
CSS px, and required no scroll. The desktop action was fully visible at
`x=82, y=678`, measured `258 × 47` CSS px. The exact first-screen copy that
answered the three questions was:

> “Reschedule missed study time”

> “For students whose missed work block could turn several assignments into
> one late night.”

> “Try it with sample data”

> “A missed block, revised plan, and deadlines at risk load next.”

This passes the blocking first-read gate.

## Findings

### Blocking

#### F-3-1 — the previously disclosed Axe landmark defect remains

**Earlier location:** `.factory/handoff.md`, “One non-blocking Axe moderate
advisory remains for a nested complementary landmark in the demo risk panel.”

**Current live/code location:** `/demo`; `src/main.ts` renders
`<aside class="risk-box" aria-labelledby="risk-title">` inside the revised-plan
`<section>` and the main landmark. Axe still reports
`landmark-complementary-is-top-level` at moderate impact.

The work order requires every earlier handoff finding to be verified and any
unfixed item to become blocking again. The nested `aside` creates a
complementary landmark where the content is actually part of the plan section.

**Fix:** use a labelled `section` or `div` for `.risk-box`. Change the Axe
regression from “no serious/critical violations” to an explicit assertion that
this rule, or all violations on the supported routes, is absent.

#### F-3-2 — the reschedule claim test can pass when the click changes no plan

**Claim:** “Marking a missed block produces a revised plan and a list of
deadlines at risk.”

**Test location:** `tests/e2e/claims.spec.ts`,
`@claim:reschedule-receipt`.

The test confirms that the already-seeded demo has a receipt, revised blocks,
and risk before the click. After clicking, it checks only the toast and the
same heading that was already present. A handler that shows the toast but
leaves the seeded plan unchanged would pass.

**Fix:** capture the receipt identifier, missed-block time, revised block list,
and risk list before the click. Assert a new receipt and changed schedule after
the click, including the post-click risk result.

#### F-3-3 — the ICS claim test does not prove imported time is unavailable

**Claim:** “Imports timed events from an ICS calendar as unavailable time.”

**Test location:** `tests/e2e/claims.spec.ts`, `@claim:ics-import`.

The tagged test asserts only “2 timed events” and a success toast. The separate
unit test proves that `buildPlan` can avoid a manually supplied busy event, but
no test proves that the uploaded fixture reaches that scheduling behavior.

**Fix:** create a task that would overlap both fixture events, import the file,
then assert that every resulting study block falls outside both event ranges.

#### F-3-4 — the JSON import claim test permits a no-op importer

**Claim:** “Imports a JSON backup into the local plan.”

**Test location:** `tests/e2e/claims.spec.ts`, `@claim:data-import`.

The test adds an assignment, exports it, and immediately imports that file
without removing or changing the assignment. The final assignment assertion
was already true before import. A no-op importer that displays the success
message would pass.

**Fix:** export a plan with distinctive task, calendar, setting, and receipt
values; clear those values or open a clean real-plan context; import; then
assert that every distinctive value is restored.

#### F-3-5 — the global privacy claim is tested only as cross-origin demo traffic

**Claim:** “Planning data stays on this site and uses no analytics, third-party
fonts, or runtime content CDNs.”

**Test location:** `tests/e2e/claims.spec.ts`, `@claim:local-only`.

The test visits `/demo` and rejects cross-origin requests. It does not visit the
landing page, exercise a real plan or backup, or reject an undisclosed
same-origin analytics endpoint. Therefore the current test can pass while part
of the global claim is false. Independent production logging found only
same-origin requests; the defect is missing regression coverage, not an
observed disclosure.

**Fix:** cover `/`, the complete demo flow, and a real add/import/export flow.
Assert an exact request-path allowlist and no beacon/analytics calls, in
addition to the origin check.

#### F-3-6 — the paid claim never tests unlimited active tasks

**Claim:** “Unlimited active tasks and receipt history cost $9 once through
Sociobot checkout.”

**Test location:** `tests/e2e/claims.spec.ts`, `@claim:paid-checkout`.

The test checks the price, checkout redirect, mocked valid license, and past
receipt history. It never adds a fifth active task under that license. The
“unlimited active tasks” half can regress while the claim test stays green.

**Fix:** in the licensed fixture, add at least five simultaneous active tasks
and assert that all are planned without the four-task error. Keep the existing
checkout and second-receipt assertions.

#### F-3-7 — the merchant/refund claim test repeats the claim instead of proving it

**Claim:** “Sociobot and Dodo are the merchant of record; their checkout handles
payment and refunds.”

**Test location:** `tests/e2e/claims.spec.ts`, `@claim:billing-terms`.

The test asserts that the terms page contains those exact sentences and that
the Buy link points to Sociobot. Finding the claim in the page is circular; it
does not prove merchant-of-record or refund handling. The live link currently
redirects to `checkout.dodopayments.com`, which proves the checkout destination
but not the refund promise.

**Fix:** narrow the tested public claim to the observable redirect, for example
“Checkout opens on Dodo through Sociobot,” and assert the redirect host. Remove
the refund-handling assertion unless a sandboxed billing contract can prove it.

### Major

#### F-3-8 — “task” and “assignment” name the same item

**Locations:** landing facts and steps, pricing, planner, and README. Examples
include “four active tasks,” “Enter each task,” “Add an assignment,” and “Plans
task estimates.”

The UI captures one title, course, estimate, and deadline for the same record,
but alternates between two names. A student cannot tell whether a task is a
smaller part of an assignment or the assignment itself. The terminology table
in `.factory/copy-audit.md` says the one term is “assignment,” so the live copy
also contradicts the repository record.

**Fix:** use “assignment” throughout the UI, pricing, README, claims, and tests.
If smaller tasks are intended, add a separate task concept and explain the
relationship instead of using the terms interchangeably.

#### F-3-9 — a landing instruction has an ambiguous object

**Quote/location:** How it works, step 3: “See a new plan that fits your study
hours and deadlines at risk.”

Grammatically, the sentence says the plan fits both study hours and deadlines
at risk. The intended second result is that the plan lists deadline risk.

**Rewrite:** “See a new plan that fits your study hours and lists deadlines at
risk.”

#### F-3-10 — “Rebuild the week in three moves” is a metaphor heading

**Quote/location:** landing How it works h2: “Rebuild the week in three moves.”

“Moves” is mood language, and the heading does not say that the section explains
rescheduling. It conflicts with the plain-words rule for standalone headings.

**Rewrite:** “Reschedule missed work in three steps.”

#### F-3-11 — “Add the work you can name” is vague

**Quote/location:** landing How it works h3: “Add the work you can name.”

The visitor is entering assignments, not proving that work can be named. The
phrase is less specific than the form it describes.

**Rewrite:** “Add each assignment.”

#### F-3-12 — “Local by default” is an unexplained label

**Quote/location:** landing eyebrow above calendar handling: “Local by
default.”

“Local” can mean on the device, on campus, or nearby. It adds jargon before the
section supplies the concrete browser-storage fact.

**Rewrite:** “Stored in this browser,” or delete the eyebrow because “How
calendar data is handled” already names the section.

#### F-3-13 — “Keep using it” is a decorative pricing label

**Quote/location:** landing eyebrow above “Four tasks free.”: “Keep using it.”

This line names neither pricing nor limits and could appear unchanged on any
product page.

**Rewrite:** “Free and paid limits,” or delete the eyebrow.

#### F-3-14 — the 404 h1 is a product pun

**Quote/location:** live unknown route and `public/404.html`: “This page is not
in the plan.”

The page is visually designed and routes correctly, but the h1 uses product
lore instead of naming the error. The smaller eyebrow is the only plain “page
not found” text.

**Rewrite:** “This page was not found.” Keep the ruled-paper styling and orange
mark.

#### F-3-15 — the Terms h1 does not name the page

**Quote/location:** `/terms`: “Use the receipt as a planning aid.”

This is a usage instruction, not a standalone name for the terms section. A
screen-reader heading list does not identify the route.

**Rewrite:** “Terms for Deadline Reality Check.” Move the existing sentence
into the service text if it is still needed.

### Minor

#### F-3-16 — README privacy wording uses an unclear noun

**Quote/location:** README Data and privacy: “Planning requests stay on this
site.”

The product stores planning data; “requests” suggests a server call and differs
from the rest of the product vocabulary.

**Rewrite:** “Assignments and calendar data stay in this browser.”

#### F-3-17 — README privacy wording uses unexplained CDN jargon

**Quote/location:** README Data and privacy: “No analytics, third-party fonts,
or runtime content CDNs are used.”

“Runtime content CDN” is implementation jargon and is not the language used on
the privacy page.

**Rewrite:** “The app uses no analytics, external fonts, or externally hosted
page assets.”

## Copy audit

Counts treat a URL, path, price, or code-formatted command as one word. No
sentence exceeds 22 words and no banned marketing adjective appears.

### Landing page sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 14 | For students whose missed work block could turn several assignments into one late night. | — |
| 2 | 11 | A missed block, revised plan, and deadlines at risk load next. | — |
| 3 | 6 | Your plan stays on this device. | — |
| 4 | 7 | It works offline after your first visit. | — |
| 5 | 8 | Plan up to four active tasks for free. | F-3-8 |
| 6 | 7 | Add unlimited active tasks for $9 once. | F-3-8 |
| 7 | 6 | A revised plan shows what moves. | — |
| 8 | 8 | Estimates change only when you choose a trim. | — |
| 9 | 7 | 60 minutes of the biology lab discussion. | — |
| 10 | 6 | Biology returns Wednesday at 6:30 PM. | — |
| 11 | 6 | Citation checks move to Thursday morning. | — |
| 12 | 4 | No estimate was cut. | — |
| 13 | 4 | Calendar events remain unavailable. | — |
| 14 | 9 | Enter each task, deadline, time estimate, and estimate confidence. | F-3-8 |
| 15 | 5 | Import a calendar (.ics) file. | — |
| 16 | 6 | Class, work, and appointments stay blocked. | — |
| 17 | 13 | See a new plan that fits your study hours and deadlines at risk. | F-3-9 |
| 18 | 14 | Enter estimates, protect busy time, and see what can still fit before each deadline. | — |
| 19 | 12 | Rough estimates stay marked in a receipt so you can review them. | — |
| 20 | 8 | Calendar (.ics) files are read in your browser. | — |
| 21 | 13 | Assignment and calendar data stay in this browser unless you export a backup. | — |
| 22 | 16 | The free plan includes rescheduling, calendar import, data export, and a list of deadlines at risk. | — |
| 23 | 12 | Buy once to add unlimited active tasks and keep every past receipt. | F-3-8 |
| 24 | 4 | Checkout opens with Sociobot. | — |
| 25 | 8 | Reschedule missed study time and see deadline risk. | — |
| 26 | 17 | An orange paper path bends around a missed block, then rejoins a row of green work blocks. | — |
| 27 | 15 | Reschedule missed study time and get a plain receipt of moved work and deadline risk. | — (metadata) |

### Landing headings and labels

| Text | Result |
| --- | --- |
| Reschedule missed study time | Clear job headline. |
| Example reschedule receipt | Clear section name. |
| Missed / What changes / What stays true | Clear within the parent receipt heading. |
| Rebuild the week in three moves | F-3-10. |
| Add the work you can name | F-3-11. |
| Protect time already taken | Clear step paired with calendar import. |
| Mark the block you missed | Clear action. |
| What this planner does | Clear section name. |
| How calendar data is handled | Clear section name. |
| Local by default | F-3-12. |
| Keep using it | F-3-13. |
| Four tasks free | Clear price/limit heading, subject to F-3-8 terminology. |
| Unlimited active tasks and receipt history | Clear paid-entitlement heading, subject to F-3-8 terminology. |

The landing actions use result-naming verbs: **Try it with sample data**,
**Start with your assignments**, **Read the privacy details**, **Buy the
one-time license**, and **Verify my license**. Navigation links are nouns and
are not submitted actions.

### README sentences

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 11 | Reschedule missed study time and see which deadlines are at risk. | — |
| 2 | 12 | Deadline Reality Check keeps a student’s study plan in this browser. | — |
| 3 | 16 | Add task estimates, protect busy time with a calendar (.ics) file, then mark a study block missed. | F-3-8 |
| 4 | 16 | See a new plan that fits your study hours and a list of deadlines at risk. | — |
| 5 | 8 | Try the isolated sample at /demo or https://workload-reschedule-receipts.sociobot.in/demo. | — |
| 6 | 11 | Plans task estimates inside user-set study hours and a daily limit. | F-3-8 |
| 7 | 7 | Treats imported ICS events as unavailable time. | — |
| 8 | 7 | Rebuilds the plan after a missed block. | — |
| 9 | 9 | Lists moved work, possible user-approved trims, and deadline shortfalls. | — |
| 10 | 9 | Stores real plans in this browser’s IndexedDB database. | — |
| 11 | 9 | Keeps demo state in memory, separate from real plans. | — |
| 12 | 6 | Exports and imports a JSON backup. | — |
| 13 | 7 | Reloads offline after the first online visit. | — |
| 14 | 12 | The free plan supports four active tasks and the complete rescheduling flow. | F-3-8 |
| 15 | 12 | A $9 one-time license adds unlimited active tasks and saved receipt history. | F-3-8 |
| 16 | 4 | Checkout opens with Sociobot. | — |
| 17 | 7 | Requirements: Node.js 20 or later and npm. | — |
| 18 | 2 | Open http://localhost:5173. | — |
| 19 | 5 | The demo is at http://localhost:5173/demo. | — |
| 20 | 11 | Playwright 1.58.2 is pinned because the factory image ships matching browsers. | — |
| 21 | 14 | npm test runs unit and browser tests in desktop and 390 px mobile layouts. | — |
| 22 | 16 | Claim tests cover the demo, calendar import, backups, storage, privacy, limits, checkout, receipts, and offline reload. | F-3-2–F-3-7 |
| 23 | 14 | npm run build writes the static deployment to dist/, with dist/index.html at its root. | — |
| 24 | 6 | Planning requests stay on this site. | F-3-16 |
| 25 | 11 | License checks send the stored token to the Sociobot billing API. | — |
| 26 | 10 | No analytics, third-party fonts, or runtime content CDNs are used. | F-3-17 |
| 27 | 10 | Read the in-product /privacy and /terms pages for user-facing details. | — |
| 28 | 9 | Deploy the complete dist/ folder as a static site. | — |
| 29 | 16 | staticwebapp.config.json supplies SPA fallback, the designed 404 page, security headers, and the permitted billing API connection. | — |
| 30 | 9 | The factory manages DNS, billing registration, and release infrastructure. | — |
| 31 | 1 | MIT. | — |
| 32 | 2 | See LICENSE. | — |

## Demo and sandbox verification

- The first-screen action opens `/demo` in one click.
- A fresh direct `/demo` immediately showed four realistic assignments, two
  calendar blocks, revised study blocks, a receipt, and one deadline at risk.
- The persistent banner read “Demo — sample data, nothing is saved” and
  contained **Reset demo** and **Start for real**.
- Marking the next block missed changed the receipt from an 8:00 AM miss with a
  9:00 AM replacement to a 9:00 AM miss with a 10:00 AM replacement.
- Reset restored the original 8:00 AM / 9:00 AM sample and all four assignments.
- IndexedDB contained no database before or after direct demo reset/miss.
  Starting for real opened an empty plan. In a separate context, a real
  “My untouched assignment” record remained identical after demo changes.
- The direct demo request log contained only the production origin. After
  service-worker control, offline reload retained four tasks and showed the
  offline banner.

The demo gate passes.

## Claims verification

`npm ci` completed with zero vulnerabilities. Every literal test command in
`.factory/claims.json` exited zero in both configured browser projects. The
coverage verdict below applies the claim skill's requirement that the tagged
test prove the observable promise, not merely display its words.

| Claim ID | Command result | Contract result |
| --- | --- | --- |
| `reschedule-receipt` | PASS | FAIL — F-3-2 |
| `receipt-copy` | PASS | PASS — clipboard contained missed work and risk text |
| `receipt-download` | PASS | PASS — named text file contained receipt details |
| `assignment-deletion` | PASS | PASS — assignment removed; receipt retained its name |
| `ics-import` | PASS | FAIL — F-3-3 |
| `data-export` | PASS | PASS — downloaded JSON contained required plan arrays |
| `data-import` | PASS | FAIL — F-3-4 |
| `demo-isolation` | PASS | PASS — no demo/real database in demo; real plan empty |
| `local-only` | PASS | FAIL — F-3-5 |
| `free-core` | PASS | PASS — four active items accepted; fifth declined |
| `paid-checkout` | PASS | FAIL — F-3-6 |
| `offline-reload` | PASS | PASS — controlled demo reloaded offline |
| `manual-estimate-trims` | PASS | PASS — estimate changed only after explicit trim |
| `uncertainty-visible` | PASS | PASS — rough labels remained visible in receipt |
| `indexeddb-storage` | PASS | PASS — real record survived reload in named database |
| `license-token-privacy` | PASS | PASS — mocked request origin, method, query, and empty body checked |
| `billing-terms` | PASS | FAIL — F-3-7 |

No additional unlisted claim-like sentence was found on the live landing page
or in README; the defects are the six insufficiently proven listed claims.

## Structure, links, accessibility, and visual identity

- `/`, `/demo`, `/planner`, `/privacy`, and `/terms` returned 200. Each had one
  h1, one main landmark, `lang=en`, route title, description, canonical URL,
  Open Graph/Twitter metadata, favicon, Apple touch icon, and manifest.
- The root title is “Deadline Reality Check — Reschedule missed work.” Route
  titles follow the required “Route — Deadline Reality Check” pattern.
- Browser navigation `/demo` → `/privacy` → Back focused the new h1 and
  announced “Rebuild the plan you have” in the polite live region.
- The unknown URL returned HTTP 404 with the product header/footer, metadata,
  return action, and no serious/critical Axe issue. Its h1 still fails plain
  words as F-3-14.
- The union of links on `/`, `/demo`, `/planner`, `/privacy`, `/terms`, and the
  404 was crawled. Valid internal routes and Sociobot returned 200; checkout
  returned 303 to `checkout.dodopayments.com`; mail links are explicit. The
  404's `#main` skip link stays on the intentional 404 and works in-page.
- Production root, JavaScript, CSS, service worker, and 404 stylesheet hashes
  match the local build. Hashed assets use immutable caching.
- Live Axe scans found no serious/critical issue. `/demo` alone retained the
  moderate issue in F-3-1.
- The ruled-paper grid, moss/orange path, clipped corners, display/mono type,
  original hero art, and restrained motion match `.factory/design.md`. This is
  recognisably product-specific, not a generic SaaS template.

## Quality gates

| Check | Result |
| --- | --- |
| `npm test` | PASS — 7 unit and 56 Playwright tests |
| `npm run build` | PASS — `dist/` produced |
| Initial JavaScript | PASS — 38.88 KB raw / 12.56 KB gzip |
| `verify-url.sh` on production | PASS — 200, title, lang, one h1, main, alt, labelled controls, no console errors |
| Live mobile overflow | PASS — 390 px content width equals viewport width |
| Offline demo reload | PASS |
| Live root/deep links/Back/404 | PASS, subject to F-3-14/F-3-15 copy |

## Earlier finding verification

Every finding in both prior reviews was checked against the current live site,
source, and tests. “Fixed” below is an independent current result.

| Earlier ID | Current status |
| --- | --- |
| F-1-1 | Fixed — explicit-trim claim and behavior remain. |
| F-1-2 | Fixed — seeded receipt says no estimate was cut. |
| F-1-3 | Fixed — school-login claim remains absent. |
| F-1-4 | Fixed — grades/coursework claim remains absent. |
| F-1-5 | Fixed — rough-estimate review label remains visible. |
| F-1-6 | Fixed — landing uses observable checkout wording. |
| F-1-7 | Fixed — unsupported landing refund sentence remains absent. |
| F-1-8 | Fixed — README names the observable Sociobot checkout. |
| F-1-9 | Fixed — real IndexedDB persistence passes. |
| F-1-10 | Fixed — fresh demo uses memory and no IndexedDB database. |
| F-1-11 | Fixed as implemented — live runtime requests were same-origin; formal coverage is reopened separately as F-3-5. |
| F-1-12 | Fixed — verifier origin/method/query/body test passes. |
| F-1-13 | Fixed — public provenance claim remains absent. |
| F-1-14 | Fixed — static 404 metadata is complete. |
| F-1-15 | Fixed — no README sentence exceeds 22 words. |
| F-1-16 | Fixed — “local-first” remains absent from README. |
| F-1-17 | Fixed — “risk receipt” and “constrained” remain absent from landing/README. |
| F-1-18 | Fixed — first eyebrow names a missed-study rescheduler. |
| F-1-19 | Fixed — receipt eyebrow names the sample. |
| F-1-20 | Fixed — receipt preview h2 names the section. |
| F-1-21 | Fixed — planning-scope h2 names its content. |
| F-1-22 | Fixed — calendar-data h2 names its content. |
| F-2-1 | Fixed — prior “risk receipt” jargon is absent. |
| F-2-2 | Fixed — Back focuses and announces the demo h1. |
| F-2-3 | Fixed behavior, but task/assignment inconsistency is now F-3-8. |
| F-2-4 | Fixed — first use is “calendar (.ics) file.” |

The additional regressions listed in the polish records remain fixed: trims do
not go negative, rejected backups leave the plan valid, completed work releases
the free slot, deletion preserves receipt labels, invalid licenses retain their
notice, checkout is live, dark contrast passes, 44 px controls pass, assets are
immutable, and unknown routes return a genuine 404. The current handoff's known
moderate Axe gap is not fixed and is reopened as blocking F-3-1.

## Missed leverage

No additional AI feature is justified. The scheduling decision is deterministic
and must remain inspectable; optional AI would add privacy, cost, and offline
failure modes without improving the brief's core job. Calendar (.ics) import,
JSON backup export/import, and offline use already cover the obvious import,
portability, and resilience needs. No provider key or decorative AI feature is
present.

## What would make this perfect

Remove the nested complementary landmark, make each of the six deficient claim
tests prove its full observable promise (or narrow the promise), standardise
“task”/“assignment,” and replace the flagged vague, jargon, decorative, and
metaphor copy. Then rerun all 17 claim commands, the full suite/build, the cold
mobile/desktop read, the complete copy audit, and Axe with zero retained
violations. Until all findings are closed, the verdict remains **FAIL**.
