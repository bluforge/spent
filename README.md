# Spent 💸

Personal expense-tracking app — a mobile-first PWA that works fully offline.
All data stays on the device (IndexedDB): no server, no accounts, no
subscriptions, no tracking. The UI is in Serbian.

## Features

- Quick expense entry: amount → category → saved (date and note optional)
- Monthly overview: total, comparison with last month, daily average
- Categories with colors and emoji icons (editable, with optional monthly limits)
- Overall monthly budget with a progress meter and overspend warning
- History with search and per-category filters, grouped by day
- Stats: 6-month trend, daily/monthly averages, top categories
- Backup: JSON export/import + CSV export (for Excel / Google Sheets)
- Dark / light / auto theme; installable as an app (PWA, works offline)

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Stack

React + TypeScript + Vite · Tailwind CSS v4 · Dexie (IndexedDB) · vite-plugin-pwa

## Deployment

Every push to `main` deploys automatically to
**https://bluforge.github.io/spent/** (GitHub Actions → Pages). On a phone:
open the link in Safari → Share → **Add to Home Screen**. Data still never
leaves the device — hosting only serves the static files.

> Since the database is local, export a backup now and then
> (**Još → Sačuvaj backup** in the app).
