# Polish 3 — cumulative adversarial review closure

**Base candidate:** `e2f7952af39f4bfbf755f8aa5296534bca95e5a8`

**Review commit:** `0ccfd30172ee771bfec444a97c9c328e660066c9`

**Repair commits:** `0c51982`, `700a661`

**Deployment:** `fbfcb674-bf7b-4678-b3dd-7cd8e7976487`

**Live:** <https://workload-reschedule-receipts.sociobot.in>

Screenshot evidence:

- `S-root`: `.factory/evidence/polish-3-live/root/screenshot-mobile.png`
- `S-demo`: `.factory/evidence/polish-3-live/demo/screenshot-mobile.png`
- `S-404`: `.factory/evidence/polish-3-live/404-mobile.png`

The final cold production suite passed all 62 desktop/mobile browser tests.
References to “live suite” below mean that run against the deployed URL.

## Review 1

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the promise narrow: estimates change only after an explicit trim. | `@claim:manual-estimate-trims`; S-demo; live suite PASS. |
| F-1-2 | Kept the seeded no-cut result and verified the estimate before and after an explicit trim. | `@claim:manual-estimate-trims`; S-demo; live `/?demo=1` PASS. |
| F-1-3 | The unsupported school-login statement remains removed. | `@claim:local-only`; S-root; cold live copy check. |
| F-1-4 | The unsupported grade/coursework statement remains removed. | `the first screen uses plain action, calendar, and pricing language`; S-root; cold live copy check. |
| F-1-5 | Rough estimates remain marked in the assignment and current receipt. | `@claim:uncertainty-visible`; S-demo; live suite PASS. |
| F-1-6 | Public copy states only the observable checkout route. | `@claim:billing-terms`; S-root; live redirect host check. |
| F-1-7 | Removed the unprovable refund-handling promise from landing and terms. | `@claim:billing-terms`; S-root; live terms copy and redirect check. |
| F-1-8 | README keeps the observable Sociobot checkout statement only. | `@claim:paid-checkout`; S-root; live checkout PASS. |
| F-1-9 | Real-plan persistence remains covered by database name and reload. | `@claim:indexeddb-storage`; S-demo; live suite PASS. |
| F-1-10 | Demo remains memory-only and never opens the real or demo database. | `@claim:demo-isolation`; S-demo; live query-demo exit is empty. |
| F-1-11 | Privacy coverage now spans landing, complete demo, and real add/calendar/export/import flows with an exact request-path allowlist and no beacons. | `@claim:local-only`; S-root/S-demo; live suite PASS. |
| F-1-12 | License verification still proves origin, method, query token, and empty body. | `@claim:license-token-privacy`; S-demo; live suite PASS. |
| F-1-13 | The untestable public provenance sentence remains absent; provenance remains in `.factory/design.md`. | `the first screen uses plain action, calendar, and pricing language`; S-root; cold live copy check. |
| F-1-14 | The designed static 404 retains canonical, OG/Twitter, icons, and manifest metadata. | `the static 404 includes complete route metadata`; S-404; live unknown route returned 404. |
| F-1-15 | README sentences remain within 22 words. | `.factory/copy-audit.md`; S-root; final README audit. |
| F-1-16 | README explains browser storage without “local-first.” | `@claim:indexeddb-storage`; S-root; final README audit. |
| F-1-17 | “Constrained” and “risk receipt” remain absent from landing and README. | `the first screen uses plain action, calendar, and pricing language`; S-root; live copy check. |
| F-1-18 | First-screen eyebrow remains the concrete “Missed-study rescheduler.” | First-screen copy test; S-root; live root check. |
| F-1-19 | Receipt eyebrow remains “Sample reschedule receipt.” | First-screen copy test; S-root; live root check. |
| F-1-20 | Receipt heading remains “Example reschedule receipt.” | First-screen copy test; S-root; live root check. |
| F-1-21 | Planning heading remains “What this planner does.” | First-screen copy test; S-root; live root check. |
| F-1-22 | Calendar heading remains “How calendar data is handled.” | First-screen copy test; S-root; live root check. |

## Review 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | All visitor-facing “risk receipt” wording stays replaced by revised-plan and deadline-risk language. | First-screen copy test; S-root; live root check. |
| F-2-2 | Back and Forward both focus the new h1 and populate the polite route announcement. | `direct routes set their own title, description, canonical URL, focused heading, and route announcement`; S-demo; live suite PASS. |
| F-2-3 | First-screen and pricing copy now say four free assignments and unlimited paid assignments. | `@claim:free-core`, `@claim:paid-checkout`; S-root; live suite PASS. |
| F-2-4 | First use remains “calendar (.ics) file”; later technical references use ICS. | `@claim:ics-import`; S-root; live suite PASS. |

## Review 3

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Replaced the nested risk `<aside>` with a labelled `<section>` and tightened Axe checks from severity filtering to zero violations. | `all supported routes have no Axe violations or console errors`; S-demo; live suite PASS. |
| F-3-2 | The reschedule test now captures receipt id, missed block, full revised schedule, and risk list before the click, then proves a new receipt and schedule. | `@claim:reschedule-receipt`; S-demo; live suite PASS. |
| F-3-3 | The ICS test freezes time around the shipped two-event fixture, creates six hours of work, and proves every block avoids both ranges. | `@claim:ics-import`; S-demo; live suite PASS. |
| F-3-4 | The import test exports distinctive assignment, calendar, settings, and receipt data, enters an empty real plan, then proves every value is restored. | `@claim:data-import`; S-demo; live suite PASS. |
| F-3-5 | The privacy test covers landing, full demo, and real add/calendar/export/import flows; it rejects external origins, unlisted paths, analytics paths, and beacons. | `@claim:local-only`; S-root/S-demo; live suite PASS. |
| F-3-6 | The paid test now adds five simultaneous assignments, proves five planned blocks without the free-limit error, and creates receipt history. | `@claim:paid-checkout`; S-demo; live suite PASS. |
| F-3-7 | Narrowed the public claim to “Checkout opens on Dodo through Sociobot” and verifies the real redirect host instead of repeating merchant/refund copy. | `@claim:billing-terms`; S-root; live redirect host `checkout.dodopayments.com`. |
| F-3-8 | Standardised visitor-facing UI, pricing, README, claims, and test names on “assignment.” Internal persisted field names stay compatible. | First-screen, free-core, paid-checkout, and claims-manifest tests; S-root/S-demo; live suite PASS. |
| F-3-9 | Rewrote step 3 to “See a new plan that fits your study hours and lists deadlines at risk.” | First-screen copy test; S-root; live root check. |
| F-3-10 | Replaced the metaphor heading with “Reschedule missed work in three steps.” | First-screen copy test; S-root; live root check. |
| F-3-11 | Replaced the vague step heading with “Add each assignment.” | First-screen copy test; S-root; live root check. |
| F-3-12 | Replaced “Local by default” with “Stored in this browser.” | First-screen copy test; S-root; live root check. |
| F-3-13 | Replaced “Keep using it” with “Free and paid limits.” | First-screen copy test; S-root; live root check. |
| F-3-14 | Changed both static and SPA 404 h1 text to “This page was not found.” | Static 404 shell/metadata tests; S-404; live unknown route returned HTTP 404. |
| F-3-15 | Changed the terms h1 to “Terms for Deadline Reality Check” and moved the planning-aid sentence into body copy. | `legal links open real routes with route titles and page-naming headings`; S-demo; live `/terms` PASS. |
| F-3-16 | README now says “Assignments and calendar data stay in this browser.” | `@claim:local-only`; S-root; final README audit. |
| F-3-17 | README now says the app uses no analytics, external fonts, or externally hosted page assets. | `@claim:local-only`; S-root; live exact request allowlist PASS. |

## Additional acceptance evidence

- `/?demo=1` is now the first-screen link and is also the documented demo URL. `the first-screen sample action opens the isolated query demo with reset and a clean exit` passes live.
- `claims-manifest.test.ts` proves each of the 17 manifest entries has exactly one tagged browser test and no extra claim tags exist.
- `390px routes avoid horizontal overflow and keep the demo controls usable` proves the root action is above the fold, all routes fit 390 px, demo output leads, and real-plan inputs lead.
- Live screenshots: S-root, S-demo, and S-404 above. Desktop screenshots and machine-readable verification reports sit beside them.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,052 ms; CLS 0; TBT 0 ms.
- Known gaps: none.
