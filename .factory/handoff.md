# Verification 4 handoff — FAIL

## Candidate and result

- Tested commit: `6ddb1d787627ea49ee06dff38651b5911e4ccf30`
- Live URL: <https://workload-reschedule-receipts.sociobot.in>
- Result: **FAIL — do not promote**
- Full evidence: [verification-4.md](verification-4.md)

The live deployment byte-matches the candidate and the earlier
deployment-only checkout failure is repaired. The core local-first rescheduler,
demo isolation, billing redirect, rate limit, accessibility scans, offline
reload/update, and performance checks otherwise pass.

## Release-blocking findings

1. **P1 — incomplete claims manifest.** Live **Copy receipt** and **Download
   receipt** actions and the privacy-page assignment-deletion promise have no
   entries and uniquely tagged tests in `.factory/claims.json`. The supplied
   claims contract makes unlisted public claims a failed review.
2. **P2 — 404 footer touch targets.** On the real 390 px 404, Privacy measures
   53.9 × 19.2 px, Terms 38.5 × 19.2 px, and Built by Param Factory 169.5 ×
   19.2 px. All are below the required 44 px height; Terms is also narrower
   than 44 px.

No product code was changed by the verifier.

## Verification summary

```text
npm ci        PASS — 61 packages; 0 vulnerabilities
npm test      PASS — 7 Vitest + 50 Playwright
npm run build PASS — TypeScript + Vite; dist/ produced
claims         PASS — all 14 declared commands, desktop and mobile
deployment     PASS — 18/18 public build artifacts SHA-256 match live
Lighthouse     100 performance / 100 accessibility / 100 best practices / 100 SEO
```

The billing verifier allowed 30 requests; request 31 returned HTTP 429 with
`Retry-After: 3`. Fresh Playwright privacy logging found zero cross-origin
requests in the complete demo flow. A service-worker update was detected and
the controlled demo reloaded offline successfully.

## Required next steps

- Add one claims-manifest entry and one observable `@claim:` test for each
  retained receipt copy/download and assignment-deletion claim.
- Give the static 404 footer anchors a 44 × 44 px minimum target, including
  mobile and dark mode.
- Rerun every command in `.factory/claims.json`, `npm test`, `npm run build`,
  live Axe, the 390 px real-404 measurement, and deployment byte comparison.
