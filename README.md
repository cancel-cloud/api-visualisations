<div align="center">

# 📊 API Visualisations

### Interactive Chart Library Showcase

**Three powerful charting libraries. One elegant visual identity. Real-world data.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-5B21B6?style=for-the-badge)](https://api-visualisations.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**[🚀 View Live Demo](https://api-visualisations.vercel.app/)** | [📖 Documentation](#documentation)

</div>

---

## 🎯 Overview

A modern Next.js application showcasing **Chart.js**, **Recharts**, and **ECharts** with a unified design system. Each library maintains its own gallery with 9-24 chart types, all powered by live API data including weather, countries, cryptocurrency, and personal coffee logs.

### ✨ Key Features

- 🎨 **45 Chart Examples** across three popular libraries
- 📱 **Fully Responsive** design with mobile-first approach
- 🌓 **Three Theme Options** (Paper, Noir, Signal)
- 🔄 **Live API Integration** with real-world data sources
- ⚡ **Two Production-Ready Dashboards** with advanced interactivity
- 🎛️ **Interactive Controls** for filtering and customization
- ♿ **Accessibility First** with ARIA labels and keyboard navigation

![Homepage Preview](https://github.com/user-attachments/assets/e5f418a7-6ff4-4a75-bc3a-fe581ff9d16a)

---

## 🚀 Featured Dashboards

### 1️⃣ Global Risk Dashboard

**Route:** [`/libraries/echarts/dashboard`](https://api-visualisations.vercel.app/libraries/echarts/dashboard)

A sophisticated multi-panel operations dashboard combining climate data, population statistics, and cryptocurrency markets into a unified risk analysis view.

**Features:**
- 🌍 **Scenario Switching** - Choose between Climate Risk, Economic Stress, or Resource Pressure scenarios
- 📊 **KPI Cards** - Real-time key performance indicators
- 🔗 **Synchronized Charts** - All visualizations respond to shared controls
- 🔗 **URL State Management** - Shareable filtered views via URL parameters
- 🎨 **Dynamic Theming** - Switch between Paper, Noir, and Signal themes

### 2️⃣ Coffee Log Dashboard

**Route:** [`/libraries/echarts/coffee-dashboard`](https://api-visualisations.vercel.app/libraries/echarts/coffee-dashboard)

An analytical dashboard that processes 1,188 coffee check-ins with intelligent espresso classification based on timestamp clustering.

**Features:**
- ☕ **Smart Espresso Detection** - Automatically identifies espresso shots using a 60-second clustering algorithm
- 📅 **Advanced Filtering** - Date range, granularity, weekday, and time-of-day filters
- 📈 **Rich Visualizations** - Timeline, hour-of-day patterns, weekday distribution, and monthly trends
- 📊 **Cluster Insights** - Detailed analysis of espresso cluster patterns
- 📋 **Accessible Data Table** - Complete data fallback with classification details

**Espresso Classification Rule:**
> When two or more coffee entries occur within 60 seconds, all entries in that close cluster are classified as "espresso" shots.

![Coffee Dashboard Preview](https://github.com/user-attachments/assets/054a9f56-5b0e-4cbe-8ba0-bc9d9e86c9b0)

---

## 📚 Chart Libraries Documentation

### Chart.js
**9 chart types** | Canvas-focused fundamentals with concise APIs and broad plugin support

- 📖 [Official Documentation](https://www.chartjs.org/docs/latest/)
- 🔌 [Available Plugins](https://github.com/chartjs/awesome#plugins)
- 🎨 [Gallery](https://api-visualisations.vercel.app/libraries/chartjs)

**Included Charts:** Line, Bar, Radar, Pie, Doughnut, Polar Area, Bubble, Scatter, Mixed

### Recharts
**12 chart types** | Declarative React chart containers with composable primitives

- 📖 [Official Documentation](https://recharts.org/en-US/)
- 📦 [API Reference](https://recharts.org/en-US/api)
- 🎨 [Gallery](https://api-visualisations.vercel.app/libraries/recharts)

**Included Charts:** Area, Bar, Line, Composed, Pie, Radar, Radial Bar, Scatter, Funnel, Treemap, Sankey, Sunburst

### ECharts
**24 chart types** | Rich data-visual grammar with advanced series and interaction models

- 📖 [Official Documentation](https://echarts.apache.org/en/index.html)
- 📦 [API Reference](https://echarts.apache.org/en/api.html)
- 🎨 [Gallery](https://api-visualisations.vercel.app/libraries/echarts)

**Included Charts:** Line, Bar, Pie, Scatter, Effect Scatter, Radar, Tree, Treemap, Sunburst, Boxplot, Candlestick, Heatmap, Map, Parallel, Lines, Graph, Sankey, Funnel, Gauge, Pictorial Bar, Theme River, Custom, and **2 Full Dashboards**

---

## 🗺️ Navigation

### Main Routes
- 🏠 **Home:** [`/`](https://api-visualisations.vercel.app/)
- 📊 **Chart.js Gallery:** [`/libraries/chartjs`](https://api-visualisations.vercel.app/libraries/chartjs)
- 📈 **Recharts Gallery:** [`/libraries/recharts`](https://api-visualisations.vercel.app/libraries/recharts)
- 📉 **ECharts Gallery:** [`/libraries/echarts`](https://api-visualisations.vercel.app/libraries/echarts)

### Dashboard Routes
- 🌍 **Global Risk Dashboard:** [`/libraries/echarts/dashboard`](https://api-visualisations.vercel.app/libraries/echarts/dashboard)
- ☕ **Coffee Log Dashboard:** [`/libraries/echarts/coffee-dashboard`](https://api-visualisations.vercel.app/libraries/echarts/coffee-dashboard)

### Legacy Compatibility
- `/demo/[slug]` - Automatically redirects to new library routes

---

## 🔌 API Endpoints

The application includes internal API routes that serve data to all charts:

### Countries API
```
GET /api/countries?region=<region|all>&sort=<population|area|density>&order=<asc|desc>&limit=<n>
```
Returns country data with population, area, and density metrics.

### Weather API
```
GET /api/weather?lat=<number>&lon=<number>&metric=<temperature_2m|precipitation_probability>&hours=<n>&sort=<time|value>&order=<asc|desc>
```
Fetches real-time weather data from Open-Meteo API.

### Cryptocurrency API
```
GET /api/crypto?vs_currency=<usd|eur>&sort=<market_cap|price_change_24h|current_price>&order=<asc|desc>&limit=<n>
```
Retrieves live cryptocurrency market data from CoinGecko.

### Coffee API
```
GET /api/coffee
```
Processes local CSV data (`data/text-8A02DB514049-1.csv`) and returns normalized coffee check-ins with intelligent espresso classification.

**Data Statistics:**
- **Total Checkins:** 1,388
- **Coffee Entries:** 1,188 (spanning Jul 2024 - Feb 2026)
- **Espresso Entries:** 433 (36.4%)
- **Normal Entries:** 755 (63.6%)

---

## 💻 Local Development

### Prerequisites
- Node.js 20+ 
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript type checking
pnpm test         # Run unit tests with coverage
pnpm test:watch   # Run tests in watch mode
pnpm test:e2e     # Run end-to-end tests with Playwright
```

---

## 🏗️ Tech Stack

### Core
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **React:** 19.2.3

### Chart Libraries
- **[Chart.js 4.5](https://www.chartjs.org/)** - Canvas-based charts with plugins
- **[Recharts 3.7](https://recharts.org/)** - React-native chart components
- **[ECharts 6.0](https://echarts.apache.org/)** - Enterprise visualization library

### Testing & Quality
- **Unit Tests:** [Vitest](https://vitest.dev/) with [@testing-library/react](https://testing-library.com/react)
- **E2E Tests:** [Playwright](https://playwright.dev/) with accessibility checks
- **Linting:** [ESLint](https://eslint.org/) with Next.js config
- **Type Safety:** [TypeScript](https://www.typescriptlang.org/) strict mode

### Analytics & Monitoring
- **[@vercel/analytics](https://vercel.com/docs/analytics)** - Web analytics
- **[@vercel/speed-insights](https://vercel.com/docs/speed-insights)** - Performance monitoring

---

## 🚢 Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment with automatic optimizations.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cancel-cloud/api-visualisations)

**Post-deployment Setup:**
1. Open your project in the Vercel dashboard
2. Navigate to **Analytics** tab
3. Enable **Web Analytics**
4. Enable **Speed Insights**

### Environment
No environment variables required! The application works out of the box with:
- Embedded CSV data for coffee logs
- Public API endpoints for weather and crypto data
- Static country data

---

## 📁 Project Structure

```
api-visualisations/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes
│   │   │   ├── coffee/          # Coffee data endpoint
│   │   │   ├── countries/       # Countries data endpoint
│   │   │   ├── crypto/          # Cryptocurrency endpoint
│   │   │   └── weather/         # Weather data endpoint
│   │   ├── libraries/           # Chart library galleries
│   │   │   └── [library]/       # Dynamic library routes
│   │   │       ├── [chart]/     # Individual chart pages
│   │   │       └── page.tsx     # Library index
│   │   └── page.tsx             # Homepage
│   ├── components/              # React components
│   │   ├── charts/              # Chart renderers
│   │   │   ├── chartjs/         # Chart.js components
│   │   │   ├── recharts/        # Recharts components
│   │   │   └── echarts/         # ECharts components (incl. dashboards)
│   │   ├── controls/            # Interactive controls
│   │   └── library/             # Library-specific components
│   ├── lib/                     # Utilities and configuration
│   │   ├── api-clients/         # External API clients
│   │   ├── datasets/            # Data transformers
│   │   ├── library-config/      # Chart library definitions
│   │   └── transformers/        # Data transformation logic
│   └── types/                   # TypeScript type definitions
├── data/                        # Static data files
│   └── text-*.csv              # Coffee log data
├── public/                      # Static assets
├── tests/                       # E2E tests
└── vitest.config.ts            # Test configuration
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🎨 Add new chart examples

## 📄 License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

**Built with ❤️ using Next.js and the best chart libraries**

[⭐ Star on GitHub](https://github.com/cancel-cloud/api-visualisations) | [🌐 View Live Demo](https://api-visualisations.vercel.app/)

</div>
