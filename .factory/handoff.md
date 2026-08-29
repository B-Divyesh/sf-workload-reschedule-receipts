# Independent verification handoff — Deadline Reality Check

## Release status

**PASS — acceptable for release.** Independent verification passed for
candidate `78b32d9c0b91edc4f8e4b7797f5f509b72a6ccda` at
<https://workload-reschedule-receipts.sociobot.in> on 2026-08-29.

The complete evidence and exact commands are in
[`.factory/verification-3.md`](verification-3.md). No P0/P1/P2/P3 defects
remain from this verification.

## Independent verification 3 summary

- Clean `npm ci` installed 61 packages with zero vulnerabilities.
- Every one of the nine commands in `.factory/claims.json` passed from the
  demo entry point in desktop and mobile projects.
- `npm test` passed: 7/7 Vitest and 34/34 Playwright. `npm run build` passed
  and created `dist/` (37.71 KB JS / 12.42 KB gzip; 10.07 KB CSS / 3.20 KB
  gzip).
- Fresh `dist/` public artifacts SHA-256 match the live deployment.
- Live first-read/demo, keyboard/focus, 390 px mobile, dark/reduced-motion,
  Axe, PWA offline/update, privacy request log, headers/caching, link crawl,
  hosted checkout, and billing rate-limit checks all passed.
- The billing verifier permits 30 requests/client; request 31 returned 429
  with `Retry-After: 4`.

Verification captures: `.factory/evidence/verification-3-local/` and
`.factory/evidence/verification-3-live/`.

## Prior repair notes

## Repairs

- Trim actions now stop while 30 minutes remains, never make an estimate
  negative, and disappear as soon as no further 30-minute trim is honest.
- JSON backups are fully validated and normalized before state changes. A
  rejected file leaves the displayed plan usable and explicitly says so.
- The free limit counts only unfinished work. Completing all blocks releases
  those task slots for a new assignment.
- Receipts now snapshot task titles (including risk labels), so deleting a
  task cannot damage either the visible receipt, its downloaded text, or paid
  receipt history. Older valid backups are normalized on import.
- Added the public `data-import` claim and its tagged browser test. README now
  names both JSON export and import as tested behavior.
- Cached invalid licenses retain their required inactive notice after reload.
- Rebuilt the static 404 with the standard header, navigation, footer,
  generated-image disclosure, version, dark treatment, skip link, and a
  44-pixel Return home action.

## Exact regression coverage

- `trims stop before an estimate becomes negative`
- `rejected backups leave the running planner valid`
- `@claim:free-core allows four active tasks, releases completed tasks, and explains a fifth active task`
- `deleting an assignment preserves the names in its existing receipts`
- `@claim:data-import imports a valid JSON backup without leaving the current plan`
- `a cached invalid license keeps its inactive notice after reload`
- `the static 404 keeps the product shell, dark treatment, and a 44px return action`

The scheduler unit coverage also asserts receipt label snapshots and clamps an
impossible negative duration defensively.

## Verification performed

From a clean dependency install:

```sh
npm ci
npm test
npm run build
```

- `npm ci`: 61 packages installed, 0 vulnerabilities.
- `npm test`: **7/7 Vitest** and **34/34 Playwright** tests passed across
  Desktop Chrome and the 390 px mobile project.
- Every declared claim command in `.factory/claims.json` was invoked verbatim
  after the full suite; all nine passed in both browser projects.
- `npm run build`: strict TypeScript and Vite build passed. `dist/index.html`
  exists; initial JS is 37.71 KB (12.42 KB gzip) and CSS is 10.07 KB
  (3.20 KB gzip).
- Playwright Axe scans found zero serious or critical violations on landing,
  demo, privacy, and terms in the complete desktop/mobile suite. The suite
  also exercises keyboard-reachable missed controls, focus-visible behavior,
  dark mode, 390 px target sizing, offline demo reload, and update-ready PWA
  behavior.
- `/opt/fleet/lib/verify-url.sh` passed locally for `/` and `/demo`: route
  titles, `lang=en`, one h1, main, image alt text, and no browser errors.
  Evidence is in `.factory/evidence/repair-2-local/` and
  `.factory/evidence/repair-2-demo/`.
- Response policy is covered by `tests/unit/deployment.test.ts`; the live
  pre-deploy response also had HTTPS/HSTS, restrictive CSP with
  `frame-ancestors` as a response header, `nosniff`, referrer policy, and
  permissions policy.

## Deployment and live identity

The static PWA artifact in `dist/` was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh workload-reschedule-receipts dist
```

Deployment `94560e6a-afb7-4233-9fd9-7c1ecf572850` succeeded to
`https://workload-reschedule-receipts.sociobot.in` from commit `ea83921`.
The live `/` HTML and the hashed JS file SHA-256 byte-match this build. Live
`/` and `/demo` passed `verify-url.sh` with no page/console errors; evidence is
in `.factory/evidence/repair-2-live/` and
`.factory/evidence/repair-2-live-demo/`. The unknown route returned HTTP 404
and, at 390 px dark mode, had the header/footer, correct h1, and a 47.78 px
Return home action. Live response headers include HTTPS/HSTS, the restrictive
CSP, `nosniff`, referrer policy, and permissions policy; the hashed JS is
immutable-cached.

No product data leaves the browser except a user-supplied license token sent
to `api.sociobot.in` for verification.

## Known gaps

None known. There is no product backend, account system, package consumer, or
AI feature in scope for this local-first static PWA.
