# Demo sandbox

- URL: `https://workload-reschedule-receipts.sociobot.in/?demo=1` (local: `http://localhost:5173/?demo=1`; `/demo` is an alias)
- Sample: four assignments, two calendar events, a missed biology block, a revised plan, and a reschedule receipt.
- Reset: choose **Reset demo** in the persistent demo banner.
- Leave: choose **Start for real**. Real IndexedDB data is then loaded; sample data is discarded.
- Namespace: demo state is held only in memory. Real plans use the separate `deadline-reality-check:real` IndexedDB database; demo actions never open or write it.
- Offline: visit the demo once, wait for the service worker, then go offline and reload the same URL.
