# Polish 1 — adversarial review closure

**Base review:** `083cd17bc64e078309aedb3856eb3af040c64c97`  
**Repair:** `2f0b1fa302e7b5f8591b3f14ff95ffaa270ff1e3`  
**Live:** <https://workload-reschedule-receipts.sociobot.in>

All findings from `.factory/review-1.md` are closed. No prior
`.factory/review-*.md` or `.factory/polish-*.md` files existed. The screenshot
evidence is `/tmp/drc-live-final-3/landing-mobile.png` and
`/tmp/drc-live-final-3/404-mobile.png`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the unsupported wording with the testable manual-trim promise. | `@claim:manual-estimate-trims` passes. |
| F-1-2 | Kept the sample receipt’s no-cut result and tested it before an explicit trim. | `@claim:manual-estimate-trims` passes. |
| F-1-3 | Removed the school-login boundary sentence. | Cold live landing copy check. |
| F-1-4 | Removed the grade/coursework boundary sentence. | Cold live landing copy check. |
| F-1-5 | Added a receipt review label for rough estimates and a claim. | `@claim:uncertainty-visible` passes. |
| F-1-6 | Replaced landing merchant wording with the observable Sociobot checkout route. | `@claim:paid-checkout`, `@claim:billing-terms` pass. |
| F-1-7 | Removed the unsupported landing refund sentence; required terms copy is covered by a billing claim. | `@claim:billing-terms` passes. |
| F-1-8 | Rewrote README billing copy to the observable checkout fact. | `@claim:paid-checkout` passes. |
| F-1-9 | Added the IndexedDB claim and reload/database inspection. | `@claim:indexeddb-storage` passes. |
| F-1-10 | Made demo memory-only and asserted no real/demo database is opened. | `@claim:demo-isolation`; cold live fresh-context check. |
| F-1-11 | Expanded the local-only claim to cover all demo-flow requests and runtime dependencies. | `@claim:local-only` passes. |
| F-1-12 | Added a verifier-origin, query-token, GET-body privacy claim. | `@claim:license-token-privacy` passes. |
| F-1-13 | Removed the untestable public provenance claim; provenance remains recorded in `design.md`. | Cold live footer check; no public provenance promise. |
| F-1-14 | Added canonical, OG, Twitter, manifest, and Apple-touch metadata to static 404. | Static 404 metadata test; live HTTP 404 check. |
| F-1-15 | Rewrote the README claim-test sentence to 16 words. | `.factory/copy-audit.md`; manual README review. |
| F-1-16 | Replaced unexplained “local-first” wording. | README now says the plan stays in this browser. |
| F-1-17 | Replaced “constrained” and “risk receipt” jargon with concrete planning language. | Landing and README copy review; screenshot evidence. |
| F-1-18 | Replaced first-screen mood eyebrow with “Missed-study rescheduler”. | Live landing screenshot. |
| F-1-19 | Replaced receipt-preview eyebrow with “Sample reschedule receipt”. | Live landing screenshot. |
| F-1-20 | Replaced the receipt-preview heading with “Example reschedule receipt”. | Live landing screenshot. |
| F-1-21 | Replaced the boundaries heading with “What this planner does”. | Live landing screenshot. |
| F-1-22 | Replaced privacy mood heading with “How calendar data is handled”. | Live landing screenshot. |

Additional acceptance checks completed: `?demo=1` is a one-click isolated
sample path with banner/reset/start-for-real; per-route metadata updates on
client navigation; route/back heading focus; mobile touch targets; static HTTP
404; local and live Axe scans; service-worker offline claim; and a 100/100
local Lighthouse performance/accessibility run.
