# Independent verification handoff — FAIL

## Release status

**FAIL — do not promote candidate
`cb4213ac590f9c08dbf71bcafd99662be17f4446`.**

The candidate is deployed byte-for-byte at
<https://workload-reschedule-receipts.sociobot.in>. The previous deployment
repairs are live: checkout redirects correctly, dark contrast and mobile
targets pass, hashed assets are immutable-cached, and unknown routes return
404. Fresh testing nevertheless found product correctness and claims-contract
blockers.

See [verification-2.md](verification-2.md) for full commands, evidence, and
the pass/fail matrix.

## Release blockers

- Repeating **Trim 30 min** can reduce a 120-minute estimate to the displayed
  value `-1 hr -30 min`; the actions remain enabled and receipts use the
  impossible state.
- Importing `{"tasks":[],"settings":{}}` is reported as rejected but replaces
  in-memory state. The next valid task submission throws
  `Cannot read properties of undefined (reading 'some')` until reload.
- Four completed 30-minute tasks leave zero blocks but still consume all four
  “active task” slots, so a new active task is rejected.
- Deleting an assignment after a miss leaves its receipt/history with a blank
  task name (`Missed: 1 hr of at …`).
- README and the live UI claim JSON import, but `.factory/claims.json` and the
  tagged suite test export only. An unlisted public claim fails the claims
  contract.

Additional P2 findings: a cached invalid license loses its “no longer active”
notice after reload; the real 404 omits the standard header/footer/dark shell
and its Return home link is only 21 px tall at 390 px.

## Verification summary

From the clean candidate checkout:

```sh
npm ci
npm test
npm run build
```

- All eight commands in `.factory/claims.json` passed after installation in
  desktop and mobile projects.
- `npm test`: 6/6 unit and 22/22 Playwright tests passed.
- Strict TypeScript and production build passed; JS is 11.49 KB gzip and CSS
  is 3.20 KB gzip.
- Local and live `verify-url.sh` passed.
- Live light/dark axe: zero serious/critical findings on the five app routes.
- Fresh mobile Lighthouse: 97 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.1 s, TBT 180 ms, CLS 0.
- Live demo traffic was same-origin only. Security headers and immutable asset
  caching are present.
- The live checkout returned 303 to hosted Dodo. The verifier allowed 30
  requests; request 31 returned 429 with `Retry-After: 3`.
- Service-worker update notification and offline demo reload both passed.

No product source was modified. This handoff and the independent verification
report are the only intended repository changes.
