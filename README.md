# Deadline Reality Check

Reschedule missed study time and see which deadlines are at risk.

Deadline Reality Check keeps a student’s study plan in this browser. Add task estimates, protect busy time with a calendar (.ics) file, then mark a study block missed. See a new plan that fits your study hours and a list of deadlines at risk.

Try the isolated sample at [/demo](/demo) or <https://workload-reschedule-receipts.sociobot.in/demo>.

## What it does

- Plans task estimates inside user-set study hours and a daily limit.
- Treats imported ICS events as unavailable time.
- Rebuilds the plan after a missed block.
- Lists moved work, possible user-approved trims, and deadline shortfalls.
- Stores real plans in this browser’s IndexedDB database.
- Keeps demo state in memory, separate from real plans.
- Exports and imports a JSON backup.
- Reloads offline after the first online visit.

The free plan supports four active tasks and the complete rescheduling flow. A $9 one-time license adds unlimited active tasks and saved receipt history. Checkout opens with Sociobot.

## Run locally

Requirements: Node.js 20 or later and npm.

```sh
npm ci
npm run dev
```

Open <http://localhost:5173>. The demo is at <http://localhost:5173/demo>.

## Test and build

Playwright 1.58.2 is pinned because the factory image ships matching browsers.

```sh
npm test
npm run build
```

`npm test` runs unit and browser tests in desktop and 390 px mobile layouts. Claim tests cover the demo, calendar import, backups, storage, privacy, limits, checkout, receipts, and offline reload.

`npm run build` writes the static deployment to `dist/`, with `dist/index.html` at its root.

## Data and privacy

Planning requests stay on this site. License checks send the stored token to the Sociobot billing API. No analytics, third-party fonts, or runtime content CDNs are used.

Read the in-product [/privacy](/privacy) and [/terms](/terms) pages for user-facing details.

## Deploy

Deploy the complete `dist/` folder as a static site. `staticwebapp.config.json` supplies SPA fallback, the designed 404 page, security headers, and the permitted billing API connection. The factory manages DNS, billing registration, and release infrastructure.

## Product records

- [Visual system](.factory/design.md)
- [Demo contract](.factory/demo.md)
- [Tested claims](.factory/claims.json)
- [Build handoff](.factory/handoff.md)

## License

MIT. See [LICENSE](LICENSE).
