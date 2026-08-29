# Polish 2 — cumulative adversarial review closure

**Base candidate:** `97990e3c52b92490b905885733c9f256b63c4c70`  
**Review base:** `0d28342b0d036f3be77e29a92fd7df58a0feba5b`  
**Repair commit:** `7b46c10`  
**Deployment:** `d83cd692-01e0-4b40-b481-d6111caa2000`  
**Live:** <https://workload-reschedule-receipts.sociobot.in>

This record closes every finding in `.factory/review-1.md` and
`.factory/review-2.md`, and rechecks the earlier verification defects rather
than trusting their prior status. Live evidence: `/tmp/drc-polish-2-live/landing-mobile.png`,
`/tmp/drc-polish-2-live/404-mobile.png`, and `/tmp/drc-polish-2-live/verify.json`.

## Review 1 findings

| Finding | Change made / retained | Evidence |
| --- | --- | --- |
| F-1-1 | Estimates still change only after the student chooses a trim. | `@claim:manual-estimate-trims` PASS. |
| F-1-2 | The seeded receipt still says no estimate was cut before a trim. | `@claim:manual-estimate-trims` PASS. |
| F-1-3 | Removed the unsupported school-login statement. | Cold live landing text check. |
| F-1-4 | Removed the unsupported grades/coursework statement. | Cold live landing text check. |
| F-1-5 | Rough estimates remain marked for receipt review. | `@claim:uncertainty-visible` PASS. |
| F-1-6 | The paid action still names and opens the observable Sociobot checkout route. | `@claim:paid-checkout` and `@claim:billing-terms` PASS. |
| F-1-7 | Refund wording remains in tested terms rather than unsupported landing copy. | `@claim:billing-terms` PASS. |
| F-1-8 | README says only the observable checkout fact. | `@claim:paid-checkout` PASS; README audit. |
| F-1-9 | Real plans still persist in the named IndexedDB database. | `@claim:indexeddb-storage` PASS. |
| F-1-10 | Demo remains in memory and never opens real IndexedDB. | `@claim:demo-isolation` PASS; cold live `?demo=1` check. |
| F-1-11 | Demo runtime traffic remains same-origin with no analytics, font, or content CDN request. | `@claim:local-only` PASS. |
| F-1-12 | License verification still sends only the stored token to Sociobot. | `@claim:license-token-privacy` PASS. |
| F-1-13 | The untestable public provenance sentence remains absent; provenance stays in `design.md`. | Cold live landing text check. |
| F-1-14 | Static 404 retains canonical, social, icon, manifest, shell, dark treatment, and 44 px return control. | `static 404 includes complete route metadata`; `static 404 keeps the product shell`; live `/no-such-polish-route` HTTP 404. |
| F-1-15 | README remains within the 22-word sentence limit. | `.factory/copy-audit.md`; README audit. |
| F-1-16 | README uses “keeps a student’s study plan in this browser,” not “local-first.” | README audit. |
| F-1-17 | Removed the remaining `risk receipt` jargon from the landing and claims contract. | `first screen uses plain action, calendar, and pricing language` PASS; live mobile screenshot. |
| F-1-18 | First eyebrow remains “Missed-study rescheduler.” | Live landing screenshot. |
| F-1-19 | Receipt preview remains labelled “Sample reschedule receipt.” | Live landing screenshot. |
| F-1-20 | Receipt preview heading remains “Example reschedule receipt.” | Live landing screenshot. |
| F-1-21 | Planning-scope heading remains “What this planner does.” | Live landing screenshot. |
| F-1-22 | Calendar-data heading remains “How calendar data is handled.” | Live landing screenshot. |

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Rewrote the action note to “A missed block, revised plan, and deadlines at risk load next.” Rewrote paid copy to name a list of deadlines at risk. The deterministic sample now includes an actual deadline-risk list, and `reschedule-receipt` asserts it. | `@claim:reschedule-receipt` PASS; `first screen uses plain action, calendar, and pricing language` PASS; live mobile screenshot. |
| F-2-2 | The `popstate` handler now assigns the focused h1 text to `#route-status` after every Back/Forward render. | `direct routes set their own title, description, canonical URL, focused heading, and route announcement` PASS; cold live Demo → Privacy → Back focus/status check. |
| F-2-3 | Replaced the vague fact with “Plan up to four active tasks for free. Add unlimited active tasks for $9 once.” Also renamed the paid heading to “Unlimited active tasks and receipt history.” | `@claim:free-core` and `@claim:paid-checkout` PASS; first-screen regression test; live mobile screenshot. |
| F-2-4 | Introduced the format as “calendar (.ics) file” on landing, README, and direct planner entry. The parser error uses the same words. | `@claim:ics-import` PASS; `scheduler` parser test; first-screen regression test; live mobile screenshot. |

## Earlier verification defects rechecked

| Earlier finding | Current evidence |
| --- | --- |
| Repeated trims could go negative | `trims stop before an estimate becomes negative` PASS. |
| Rejected backup corrupted the current planner | `rejected backups leave the running planner valid` PASS. |
| Completed tasks still occupied free slots | `@claim:free-core` PASS. |
| Task deletion orphaned receipt labels | `deleting an assignment preserves the names in its existing receipts` PASS. |
| JSON import was unlisted | `data-import` is in `claims.json`; `@claim:data-import` PASS. |
| Cached invalid license lost its notice | `a cached invalid license keeps its inactive notice after reload` PASS. |
| Static 404 lacked shell, target, and dark treatment | Static 404 browser tests PASS; live screenshot and HTTP 404 check PASS. |

## Verification summary

- Fresh dependency install: `npm ci` PASS (61 packages, 0 vulnerabilities).
- Every one of the 14 commands in `.factory/claims.json` passed verbatim.
- `npm test` PASS: 7 Vitest tests and 50 Playwright checks across desktop and 390 px mobile Chromium.
- `npm run build` PASS: `dist/` produced; initial JS is 38.88 KB (12.56 KB gzip) and CSS is 10.07 KB (3.20 KB gzip).
- Local and live `/opt/fleet/lib/verify-url.sh` PASS with title, `lang=en`, one h1, main landmark, alt text, labelled controls, and zero ordinary load errors.
- Cold live Axe checks on `/`, `/demo`, `/planner`, `/privacy`, `/terms`, and `/404.html` found zero serious or critical violations. Unknown live routes return HTTP 404.
