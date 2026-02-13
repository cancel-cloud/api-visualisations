"use client";

import dynamic from "next/dynamic";
import { memo, useMemo } from "react";

import { limitedCountries, limitedCrypto, limitedWeather } from "@/lib/datasets/transforms/shared";
import type { BaseDatasetBundle, SortOrder } from "@/lib/types";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div className="flex h-[360px] items-center justify-center text-sm text-ink-muted">Loading chart…</div>,
});

const ECHARTS_STYLE = { height: "100%", width: "100%" } as const;

type DashboardMetric = "climate" | "economics" | "resources";

type DashboardPalette = {
  background: string;
  panel: string;
  border: string;
  ink: string;
  muted: string;
  series: string[];
};

type DashboardCountryRow = {
  name: string;
  region: string;
  population: number;
  pressure: number;
  resilience: number;
  exposure: number;
  marketDelta: number;
};

type DashboardModel = {
  countries: DashboardCountryRow[];
  timeline: Array<{ label: string; risk: number; climate: number; market: number }>;
  regions: Array<{ region: string; value: number }>;
  cryptoStress: Array<{ symbol: string; volatility: number; liquidity: number; spread: number }>;
  summary: {
    averagePressure: number;
    averageResilience: number;
    highestRegion: string;
    highestRegionValue: number;
  };
};

type EchartsDashboardProps = {
  data: BaseDatasetBundle;
  limit: number;
  order: SortOrder;
  theme: string;
  metric: string;
};

function parseMetric(metric: string): DashboardMetric {
  if (metric === "economics" || metric === "resources") {
    return metric;
  }
  return "climate";
}

function metricWeights(metric: DashboardMetric) {
  if (metric === "economics") {
    return { climate: 0.45, economics: 1, resources: 0.55 };
  }
  if (metric === "resources") {
    return { climate: 0.55, economics: 0.45, resources: 1 };
  }
  return { climate: 1, economics: 0.55, resources: 0.65 };
}

function paletteFor(theme: string): DashboardPalette {
  if (theme === "noir") {
    return {
      background: "#f8fafc",
      panel: "#ffffff",
      border: "#11182722",
      ink: "#111827",
      muted: "#4b5563",
      series: ["#111827", "#374151", "#6b7280", "#9ca3af", "#1f2937", "#0f172a"],
    };
  }

  if (theme === "signal") {
    return {
      background: "#fff7ed",
      panel: "#ffffff",
      border: "#c2410c22",
      ink: "#111827",
      muted: "#374151",
      series: ["#ef4444", "#0ea5e9", "#f59e0b", "#10b981", "#4f46e5", "#b91c1c"],
    };
  }

  return {
    background: "#fffaf0",
    panel: "#ffffff",
    border: "#0f172a1f",
    ink: "#1f2937",
    muted: "#475569",
    series: ["#0f766e", "#ea580c", "#1d4ed8", "#b91c1c", "#155e75", "#a16207"],
  };
}

function groupByRegion(countries: DashboardCountryRow[]) {
  const regions = new Map<string, number>();

  countries.forEach((country) => {
    const current = regions.get(country.region) ?? 0;
    regions.set(country.region, current + country.pressure);
  });

  return [...regions.entries()]
    .map(([region, value]) => ({ region, value: Number(value.toFixed(2)) }))
    .sort((left, right) => right.value - left.value);
}

function buildModel(bundle: BaseDatasetBundle, limit: number, order: SortOrder, metric: DashboardMetric): DashboardModel {
  const weights = metricWeights(metric);
  const countries = limitedCountries(bundle, Math.max(8, limit), order);
  const weather = limitedWeather(bundle, Math.max(24, limit * 2), "asc");
  const crypto = limitedCrypto(bundle, Math.max(8, limit), order);

  const averageVolatility =
    crypto.reduce((accumulator, coin) => accumulator + Math.abs(coin.price_change_percentage_24h), 0) / Math.max(1, crypto.length);

  const countryRows = countries.map((country, index) => {
    const weatherPoint = weather[index % weather.length];
    const marketPoint = crypto[index % crypto.length];

    const climatePressure =
      (weatherPoint?.precipitation_probability ?? 30) * 0.54 +
      Math.abs((weatherPoint?.temperature_2m ?? 18) - 18) * 2.15;

    const economicPressure =
      Math.abs(marketPoint?.price_change_percentage_24h ?? averageVolatility) * 9 +
      ((marketPoint?.total_volume ?? 0) / Math.max(1, marketPoint?.market_cap ?? 1)) * 120;

    const resourcePressure =
      country.density * 0.62 +
      country.population / Math.max(1, country.area) * 0.018 +
      3800 / Math.max(80, country.area);

    const pressure =
      climatePressure * weights.climate +
      economicPressure * weights.economics +
      resourcePressure * weights.resources;

    const resilience = Math.max(5, 100 - pressure * 1.48);
    const exposure = pressure * 0.9 + country.population / 1_000_000;

    return {
      name: country.name,
      region: country.region,
      population: country.population,
      pressure: Number(pressure.toFixed(2)),
      resilience: Number(resilience.toFixed(2)),
      exposure: Number(exposure.toFixed(2)),
      marketDelta: Number((marketPoint?.price_change_percentage_24h ?? 0).toFixed(2)),
    };
  });

  const orderedCountries = [...countryRows].sort((left, right) => left.pressure - right.pressure);
  if (order === "desc") {
    orderedCountries.reverse();
  }

  const timeline = weather.map((point, index) => {
    const market = Math.abs(crypto[index % crypto.length]?.price_change_percentage_24h ?? averageVolatility);
    const climate = point.precipitation_probability * 0.65 + Math.abs(point.temperature_2m - 16) * 1.8;
    const risk = climate * weights.climate + market * 10 * weights.economics + averageVolatility * 4 * weights.resources;

    return {
      label: point.time.slice(11, 16),
      climate: Number(climate.toFixed(2)),
      market: Number((market * 10).toFixed(2)),
      risk: Number(risk.toFixed(2)),
    };
  });

  const regions = groupByRegion(orderedCountries);
  const cryptoStress = crypto.map((coin) => ({
    symbol: coin.symbol.toUpperCase(),
    volatility: Number(Math.abs(coin.price_change_percentage_24h).toFixed(2)),
    liquidity: Number((((coin.total_volume / Math.max(1, coin.market_cap)) * 100) / 5).toFixed(2)),
    spread: Number((((coin.high_24h - coin.low_24h) / Math.max(1, coin.current_price)) * 100).toFixed(2)),
  }));

  const pressureAverage =
    orderedCountries.reduce((accumulator, country) => accumulator + country.pressure, 0) / Math.max(1, orderedCountries.length);
  const resilienceAverage =
    orderedCountries.reduce((accumulator, country) => accumulator + country.resilience, 0) / Math.max(1, orderedCountries.length);

  return {
    countries: orderedCountries,
    timeline,
    regions,
    cryptoStress,
    summary: {
      averagePressure: Number(pressureAverage.toFixed(1)),
      averageResilience: Number(resilienceAverage.toFixed(1)),
      highestRegion: regions[0]?.region ?? "N/A",
      highestRegionValue: Number((regions[0]?.value ?? 0).toFixed(1)),
    },
  };
}

function compact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function scenarioLabel(metric: DashboardMetric) {
  if (metric === "economics") {
    return "Economic Stress";
  }
  if (metric === "resources") {
    return "Resource Pressure";
  }
  return "Climate Risk";
}

function EchartsDashboardComponent({ data, limit, order, theme, metric }: EchartsDashboardProps) {
  const selectedMetric = parseMetric(metric);
  const palette = useMemo(() => paletteFor(theme), [theme]);
  const model = useMemo(() => buildModel(data, limit, order, selectedMetric), [data, limit, order, selectedMetric]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Average Pressure",
        value: model.summary.averagePressure.toFixed(1),
        detail: "Composite stress index",
      },
      {
        label: "Average Resilience",
        value: `${model.summary.averageResilience.toFixed(1)}%`,
        detail: "Remaining response capacity",
      },
      {
        label: "Highest Risk Region",
        value: model.summary.highestRegion,
        detail: `Index ${model.summary.highestRegionValue.toFixed(1)}`,
      },
      {
        label: "Tracked Population",
        value: compact(model.countries.reduce((accumulator, row) => accumulator + row.population, 0)),
        detail: "Population represented",
      },
    ],
    [model],
  );

  const timelineOption = useMemo(
    () => ({
      color: palette.series,
      backgroundColor: palette.panel,
      textStyle: { fontFamily: "var(--font-body)", color: palette.ink },
      tooltip: { trigger: "axis" },
      legend: {
        bottom: 0,
        textStyle: { color: palette.muted },
      },
      grid: { left: 40, right: 20, top: 40, bottom: 54 },
      xAxis: {
        type: "category",
        data: model.timeline.map((row) => row.label),
        axisLabel: { color: palette.muted },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: palette.muted },
      },
      series: [
        {
          name: "Composite Risk",
          type: "line",
          smooth: true,
          lineStyle: { width: 3 },
          areaStyle: { opacity: 0.16 },
          data: model.timeline.map((row) => row.risk),
        },
        {
          name: "Climate Signal",
          type: "line",
          smooth: true,
          lineStyle: { width: 2, type: "dashed" },
          data: model.timeline.map((row) => row.climate),
        },
        {
          name: "Market Signal",
          type: "bar",
          barMaxWidth: 12,
          data: model.timeline.map((row) => row.market),
        },
      ],
    }),
    [model.timeline, palette],
  );

  const pressureOption = useMemo(
    () => ({
      color: palette.series,
      backgroundColor: palette.panel,
      textStyle: { fontFamily: "var(--font-body)", color: palette.ink },
      tooltip: { trigger: "axis" },
      grid: { left: 20, right: 20, top: 24, bottom: 20, containLabel: true },
      xAxis: { type: "value", axisLabel: { color: palette.muted } },
      yAxis: {
        type: "category",
        axisLabel: { color: palette.muted },
        data: model.countries.slice(0, limit).map((row) => row.name),
      },
      series: [
        {
          name: "Pressure",
          type: "bar",
          data: model.countries.slice(0, limit).map((row) => row.pressure),
          itemStyle: { borderRadius: [0, 8, 8, 0] },
        },
      ],
    }),
    [limit, model.countries, palette],
  );

  const scatterOption = useMemo(
    () => ({
      color: palette.series,
      backgroundColor: palette.panel,
      textStyle: { fontFamily: "var(--font-body)", color: palette.ink },
      tooltip: {
        trigger: "item",
        formatter: (value: { value: [number, number, number, string] }) =>
          `${value.value[3]}<br/>Exposure: ${value.value[0].toFixed(1)}<br/>Resilience: ${value.value[1].toFixed(1)}%`,
      },
      grid: { left: 45, right: 22, top: 30, bottom: 34 },
      xAxis: {
        type: "value",
        name: "Exposure",
        axisLabel: { color: palette.muted },
      },
      yAxis: {
        type: "value",
        name: "Resilience",
        min: 0,
        max: 100,
        axisLabel: { color: palette.muted },
      },
      series: [
        {
          type: "scatter",
          data: model.countries.map((row) => [row.exposure, row.resilience, row.population, row.name]),
          symbolSize: (value: [number, number, number]) => Math.max(10, Math.min(42, Math.sqrt(value[2] / 1_000_000))),
        },
      ],
    }),
    [model.countries, palette],
  );

  const regionOption = useMemo(
    () => ({
      color: palette.series,
      backgroundColor: palette.panel,
      textStyle: { fontFamily: "var(--font-body)", color: palette.ink },
      tooltip: { trigger: "item" },
      legend: {
        orient: "vertical",
        right: 10,
        top: "center",
        textStyle: { color: palette.muted },
      },
      series: [
        {
          type: "pie",
          radius: ["34%", "72%"],
          center: ["38%", "50%"],
          data: model.regions.map((row) => ({ name: row.region, value: row.value })),
          label: { color: palette.ink },
        },
      ],
    }),
    [model.regions, palette],
  );

  const stressHeatmapOption = useMemo(
    () => ({
      color: palette.series,
      backgroundColor: palette.panel,
      textStyle: { fontFamily: "var(--font-body)", color: palette.ink },
      tooltip: {
        position: "top",
      },
      grid: { left: 60, right: 20, top: 40, bottom: 28 },
      xAxis: {
        type: "category",
        data: model.cryptoStress.map((row) => row.symbol),
        splitArea: { show: true },
        axisLabel: { color: palette.muted },
      },
      yAxis: {
        type: "category",
        data: ["Volatility", "Liquidity", "Spread"],
        splitArea: { show: true },
        axisLabel: { color: palette.muted },
      },
      visualMap: {
        min: 0,
        max: Math.max(25, ...model.cryptoStress.map((row) => Math.max(row.volatility, row.liquidity, row.spread))),
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
      },
      series: [
        {
          type: "heatmap",
          data: model.cryptoStress.flatMap((row, index) => [
            [index, 0, row.volatility],
            [index, 1, row.liquidity],
            [index, 2, row.spread],
          ]),
          label: { show: false },
        },
      ],
    }),
    [model.cryptoStress, palette],
  );

  if (model.countries.length === 0 || model.timeline.length === 0) {
    return (
      <section className="rounded-2xl border border-black/10 bg-[var(--paper)] p-6 text-sm text-ink-muted">
        Dashboard data is not available for the selected filters.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <section
        className="rounded-2xl border p-5"
        style={{
          backgroundColor: palette.background,
          borderColor: palette.border,
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">ECharts Multi-Panel Dashboard</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Global Operations Scenario</h2>
            <p className="mt-2 max-w-3xl text-sm text-ink-muted">
              Real-world stress model combining weather, population, and crypto market volatility. Current scenario:{" "}
              <span className="font-semibold text-ink">{scenarioLabel(selectedMetric)}</span>.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.15em] text-ink-muted">Top {limit} entities, sorted {order}</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label} className="rounded-xl border border-black/10 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{card.label}</p>
              <p className="mt-2 font-display text-3xl leading-none text-ink">{card.value}</p>
              <p className="mt-2 text-xs text-ink-muted">{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-8">
          <h3 className="font-display text-2xl text-ink">Risk Signal Timeline</h3>
          <p className="mt-1 text-sm text-ink-muted">Hourly stress index blending climate and market signals.</p>
          <div className="mt-3 h-[340px] rounded-xl border border-black/10 bg-white p-2">
            <ReactECharts lazyUpdate notMerge option={timelineOption} style={ECHARTS_STYLE} />
          </div>
        </article>

        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-4">
          <h3 className="font-display text-2xl text-ink">Regional Share</h3>
          <p className="mt-1 text-sm text-ink-muted">Contribution to total pressure by macro region.</p>
          <div className="mt-3 h-[340px] rounded-xl border border-black/10 bg-white p-2">
            <ReactECharts lazyUpdate notMerge option={regionOption} style={ECHARTS_STYLE} />
          </div>
        </article>

        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-5">
          <h3 className="font-display text-2xl text-ink">Country Pressure Rank</h3>
          <p className="mt-1 text-sm text-ink-muted">Composite pressure score for selected countries.</p>
          <div className="mt-3 h-[360px] rounded-xl border border-black/10 bg-white p-2">
            <ReactECharts lazyUpdate notMerge option={pressureOption} style={ECHARTS_STYLE} />
          </div>
        </article>

        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-7">
          <h3 className="font-display text-2xl text-ink">Exposure vs Resilience</h3>
          <p className="mt-1 text-sm text-ink-muted">Bubble size reflects population. Lower y-values imply fragile readiness.</p>
          <div className="mt-3 h-[360px] rounded-xl border border-black/10 bg-white p-2">
            <ReactECharts lazyUpdate notMerge option={scatterOption} style={ECHARTS_STYLE} />
          </div>
        </article>

        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-12">
          <h3 className="font-display text-2xl text-ink">Crypto Transmission Heatmap</h3>
          <p className="mt-1 text-sm text-ink-muted">Volatility, liquidity, and spread signals feeding economic risk weighting.</p>
          <div className="mt-3 h-[320px] rounded-xl border border-black/10 bg-white p-2">
            <ReactECharts lazyUpdate notMerge option={stressHeatmapOption} style={ECHARTS_STYLE} />
          </div>
        </article>
      </section>
    </section>
  );
}

export const EchartsDashboard = memo(EchartsDashboardComponent);
