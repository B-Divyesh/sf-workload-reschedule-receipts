# Deadline Reality Check

Reschedule missed study time and see which deadlines are at risk.

Deadline Reality Check is a local-first planner for students with overlapping assignments. Add task estimates, protect busy time with an ICS calendar, then mark a study block missed. The app proposes a constrained revised plan and produces a plain-language risk receipt.

Try the isolated sample at `/demo` or at <https://workload-reschedule-receipts.sociobot.in/demo>.

## What it does

- Plans task estimates inside user-set study hours and a daily limit.
- Treats imported ICS events as unavailable time.
- Rebuilds the plan after a missed block.
- Lists moved work, possible user-approved trims, and deadline shortfalls.
- Stores real plans in IndexedDB on the current device.
- Exports and imports a JSON backup.
- Reloads offline after the first online visit.

The free plan supports four active tasks and the complete rescheduling flow. A $9 one-time license adds unlimited active tasks and saved receipt history. Checkout and license verification use the Sociobot billing API; no payment provider is embedded here.

## Run locally

Requirements: Node.js 20 or later and npm.

```sh
npm install
npm run dev
```

Open <http://localhost:5173>. The demo is at <http://localhost:5173/demo>.

## Test and build

Playwright 1.58.2 is pinned because the factory image ships matching browsers.

```sh
npm test
npm run build
```

`npm test` runs unit tests and browser tests in desktop and 390 px mobile layouts. Claim tests cover demo isolation, local-only planning, ICS import, JSON export, the free limit, checkout routing, receipt creation, and offline reload.

`npm run build` writes the static deployment to `dist/`, with `dist/index.html` at its root.

## Data and privacy

Real plans use the IndexedDB database `deadline-reality-check:real`. Demo state stays in memory and never enters that database. No analytics, third-party fonts, or runtime content CDNs are used. License verification sends only the pasted license token to `api.sociobot.in`.

Read the in-product `/privacy` and `/terms` pages for user-facing details.

## Deploy

Deploy the complete `dist/` folder as a static site. `staticwebapp.config.json` supplies SPA fallback, the designed 404 page, security headers, and the permitted billing API connection. The factory manages DNS, billing registration, and release infrastructure.

## Product records

- [Visual system](.factory/design.md)
- [Demo contract](.factory/demo.md)
- [Tested claims](.factory/claims.json)
- [Build handoff](.factory/handoff.md)

## License

MIT. See [LICENSE](LICENSE).
