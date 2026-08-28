# Demo sandbox

- URL: `https://workload-reschedule-receipts.sociobot.in/demo` (local: `http://localhost:5173/demo`)
- Sample: four assignments, two calendar events, a missed biology block, a revised plan, and a reschedule receipt.
- Reset: choose **Reset demo** in the persistent demo banner.
- Leave: choose **Start for real**. Real IndexedDB data is then loaded; sample data is discarded.
- Namespace: the storage layer reserves `deadline-reality-check:demo`, separate from `deadline-reality-check:real`. The current demo remains in memory and does not persist changes.
- Offline: visit the demo once, wait for the service worker, then go offline and reload the same URL.
