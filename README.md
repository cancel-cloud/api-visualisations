# API Visualisations

Next.js App Router showcase for three chart libraries:

- Chart.js
- Recharts
- ECharts

The app has route-per-chart pages and a shared data layer. It includes two fully fledged ECharts dashboards:

1. `Global Risk Dashboard` at `/libraries/echarts/dashboard`
2. `Coffee Log Dashboard` at `/libraries/echarts/coffee-dashboard`

## Library Navigation

- Home: `/`
- Library indexes:
  - `/libraries/chartjs`
  - `/libraries/recharts`
  - `/libraries/echarts`
- Legacy route compatibility:
  - `/demo/[slug]` redirects to mapped new routes

## The Two Full Dashboards

### 1) Global Risk Dashboard
Route: `/libraries/echarts/dashboard`

Purpose:
- Multi-panel, real-world-style operations view combining countries, weather, and crypto.

Key features:
- Scenario switching (`climate`, `economics`, `resources`)
- KPI cards + synchronized charts
- URL state for controls and shareable filtered views
- Theme switching (`paper`, `noir`, `signal`)

### 2) Coffee Log Dashboard
Route: `/libraries/echarts/coffee-dashboard`

Purpose:
- Analyze coffee behavior from a local CSV export with deterministic espresso classification.

Espresso rule:
- If adjacent coffee entries are at the same timestamp or within `<= 60` seconds, the whole close cluster is `espresso`.
- Single isolated entries are `normal`.

Key features:
- Rich filters:
  - `range=30d|90d|365d|all`
  - `granularity=day|week|month`
  - `weekday=all|weekdays|weekends|mon..sun`
  - `daypart=all|morning|afternoon|evening|night`
- KPI cards, timeline, hour-of-day, weekday, monthly trend
- Espresso insight panel (cluster counts)
- Accessible fallback table with local time, type, and gap-to-previous seconds

## Internal API Routes

- `GET /api/countries?region=<region|all>&sort=<population|area|density>&order=<asc|desc>&limit=<n>`
- `GET /api/weather?lat=<number>&lon=<number>&metric=<temperature_2m|precipitation_probability>&hours=<n>&sort=<time|value>&order=<asc|desc>`
- `GET /api/crypto?vs_currency=<usd|eur>&sort=<market_cap|price_change_24h|current_price>&order=<asc|desc>&limit=<n>`
- `GET /api/coffee`
  - Reads local CSV from `data/text-8A02DB514049-1.csv`
  - Returns normalized coffee checkins with espresso classification

## Included Data Snapshot (From Your CSV)

Data file:
- `data/text-8A02DB514049-1.csv`

Snapshot summary from the current export:
- Total rows: `1,388`
- Boards: `5`
- Checkins: `1,380`
- Coffee checkins: `1,188`
- Classified espresso entries: `433`
- Classified normal entries: `755`
- Coffee time range: `2024-07-27T07:44:51Z` to `2026-02-13T07:16:52Z`

Board checkin distribution:

| Board | Checkins |
|---|---:|
| Coffee | 1188 |
| Pushy | 73 |
| Codein | 71 |
| Read | 43 |
| Crunches | 5 |

Sample coffee entries (with classification result):

| Timestamp (UTC) | Type |
|---|---|
| 2024-07-27T07:44:51Z | espresso |
| 2024-07-27T07:44:53Z | espresso |
| 2024-07-29T11:04:00Z | normal |
| 2024-07-30T20:04:14Z | espresso |
| 2024-07-30T20:04:15Z | espresso |

## Vercel Deploy Readiness

Already integrated in code:
- `@vercel/analytics` via `<Analytics />` in root layout
- `@vercel/speed-insights` via `<SpeedInsights />` in root layout

CSV packaging for serverless runtime:
- `next.config.ts` includes output tracing for:
  - `/api/coffee/route` -> `./data/text-8A02DB514049-1.csv`

What to enable in the Vercel dashboard after deploy:
1. Open your project in Vercel.
2. Go to `Analytics`.
3. Enable `Web Analytics`.
4. Enable `Speed Insights`.

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Create a GitHub Repo via CLI

### Option A: With GitHub CLI (`gh`) (recommended)

```bash
# from project root
git init
git add .
git commit -m "Initial commit"

# create and push (public example)
gh repo create api-visualisations --public --source=. --remote=origin --push
```

### Option B: Without GitHub CLI

1. Create an empty repo in GitHub web UI.
2. Run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## License

This project is licensed under the MIT License. See `LICENSE`.
