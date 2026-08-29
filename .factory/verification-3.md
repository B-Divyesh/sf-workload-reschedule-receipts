# Independent verification 3 — PASS

**Candidate:** `78b32d9c0b91edc4f8e4b7797f5f509b72a6ccda`  
**Live URL:** <https://workload-reschedule-receipts.sociobot.in>  
**Verified:** 2026-08-29 from a clean checkout

## Verdict

**PASS.** The deployed PWA byte-matches the candidate's fresh production
build for every public product artifact tested. It meets the researched brief:
students can enter honest estimates and calendar constraints, mark a missed
work block, receive a constrained revision and a plain-language risk receipt,
and keep the plan locally. No release-blocking defects were found.

## First-read and demo gate

Cold-loading the live page at 390 × 844 gave this answer without scrolling:

- **What it does:** “Reschedule missed study time.”
- **For whom:** students whose missed work block could turn assignments into a
  late night.
- **What to do first:** choose the visible 257 × 47 px **Try it with sample
  data** action; its adjacent text says that a missed block and risk receipt
  load next.

The one-click `/demo` sandbox immediately showed four realistic assignments,
a revised plan, a receipt, and the persistent “Demo — sample data, nothing is
saved” banner with Reset demo and Start for real. This passes the plain-words
and demo-sandbox gates.

## Required claims gate

`.factory/claims.json` exists and declares nine claims. After `npm ci`, I ran
each listed `npm test -- --grep @claim:<id>` command serially from the demo
entry point. Every command passed in both configured browser projects. The
subsequent complete `npm test` independently passed every tagged claim again.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `reschedule-receipt` | PASS | A missed sample block produced a revised plan and receipt. |
| `ics-import` | PASS | The two-event ICS fixture protected both events as unavailable. |
| `data-export` | PASS | Downloaded JSON had the required plan arrays. |
| `data-import` | PASS | An exported backup restored its assignment. |
| `demo-isolation` | PASS | Start for real opened an empty real plan. |
| `local-only` | PASS | The complete demo reset/miss flow made no cross-origin request. |
| `free-core` | PASS | Four unfinished tasks were permitted; completion released a slot; the fifth active task was explained. |
| `paid-checkout` | PASS | `$9 once`, the Sociobot checkout URL/redirect, and paid receipt history were asserted. |
| `offline-reload` | PASS | A service-worker-controlled demo reloaded offline with its planner and offline state. |

The page, README, and planner claims cross-check to this manifest, including
the public JSON-import claim.

## Local quality gates

```text
npm ci        PASS — 61 packages, 0 vulnerabilities
npm test      PASS — 7/7 Vitest; 34/34 Playwright (desktop and 390 px mobile)
npm run build PASS — strict TypeScript and Vite; dist/ created
```

There is no separate lint/typecheck script; the production build performs
`tsc --noEmit`. The initial application assets are 37.71 KB JS (12.42 KB gzip)
and 10.07 KB CSS (3.20 KB gzip), within the static PWA budgets.

Independent local browser checks passed normal planning, blank form recovery,
invalid start/end-hour recovery, malformed ICS recovery, rejected-backup
recovery followed by a successful add, estimate trim at its 30-minute floor,
receipt-label preservation after task deletion, keyboard skip-link focus,
same-origin demo traffic, and offline reload.

`/opt/fleet/lib/verify-url.sh` passed against local and live `/`: title,
`lang=en`, one h1, main landmark, image alt text, named buttons, and no
ordinary console/page errors. Its captures are in
`.factory/evidence/verification-3-local/` and
`.factory/evidence/verification-3-live/`.

## Live deployment, privacy, and security

- Fresh `dist/` SHA-256 values match live `index.html`, hashed JS/CSS,
  service worker, manifest, 404, favicon, robots, sitemap, all shipped images,
  and all PWA icons. `staticwebapp.config.json` is correctly deployment-only
  and returns the designed 404 rather than a public configuration file.
- Live response headers include HTTPS/HSTS, CSP with response-header
  `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and the restrictive
  Permissions Policy. Hashed JS is `public, max-age=31536000, immutable`;
  HTML/manifest and 404 revalidate after 30 seconds.
- The live demo reset/miss flow had no cross-origin requests. The only
  permitted external path is an explicit license token sent to
  `api.sociobot.in`; there is no sign-in, tracking, third-party font, or
  runtime CDN.
- The checkout link returned the expected HTTP 303 to Sociobot's hosted Dodo
  checkout; no purchase was made. The billing verifier allows 30 requests from
  one client; request 31 returned HTTP 429 with `Retry-After: 4`.
- All discovered product links returned HTTP 200, apart from the expected 303
  hosted-checkout redirect and valid `mailto:` links. An unknown route returned
  a real HTTP 404 with the product shell.

## Accessibility, responsive behavior, and PWA

Live Axe scans of `/`, `/demo`, `/planner`, `/privacy`, `/terms`, and the
designed 404 found **zero serious or critical findings**. The complete suite
also verifies dark treatment, 44 px mobile core targets, visible focus,
keyboard operation of missed blocks, and the 404 return action. The CSS has a
`prefers-reduced-motion` path that reduces transitions/animations and disables
smooth scrolling.

The live PWA manifest has the required MIME type. In an isolated browser
profile, the service worker controlled `/demo`, accepted an update from a
new script URL, and the controlled demo reloaded while offline with
“Offline — your saved plan still works.”

## Scope and defects

No defects found (P0/P1/P2/P3: none). This is a static local-first PWA with no
product backend, account system, CLI/library package, or AI feature; backend
concurrency, persistent server storage, package-consumer, Entra, and AI-gateway
checks are not applicable. Deterministic scheduling is the appropriate
implementation for the brief.
