import type { ChartData, ChartOptions, ChartType } from "chart.js";

import { limitedCountries, limitedCrypto, limitedWeather } from "@/lib/datasets/transforms/shared";
import type { BaseDatasetBundle, SortOrder } from "@/lib/types";

export type ChartJsBuildResult = {
  type: ChartType;
  data: ChartData;
  options: ChartOptions;
  description: string;
};

const palette = {
  paper: ["#8B5CF6", "#D97706", "#0F766E", "#B91C1C", "#0EA5E9", "#9333EA"],
  noir: ["#111827", "#374151", "#6B7280", "#9CA3AF", "#4B5563", "#1F2937"],
  signal: ["#EF4444", "#3B82F6", "#F97316", "#14B8A6", "#EAB308", "#8B5CF6"],
};

function pickColors(theme: string, count: number) {
  const selected = palette[theme as keyof typeof palette] ?? palette.paper;
  return Array.from({ length: count }, (_, index) => selected[index % selected.length]);
}

export function buildChartJsChart(
  chart: string,
  bundle: BaseDatasetBundle,
  limit: number,
  order: SortOrder,
  theme: string,
): ChartJsBuildResult {
  const countries = limitedCountries(bundle, limit, order);
  const weather = limitedWeather(bundle, limit, order);
  const crypto = limitedCrypto(bundle, limit, order);
  const colors = pickColors(theme, Math.max(limit, 6));

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#111827",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#111827" },
        grid: { color: "rgba(17,24,39,0.1)" },
      },
      y: {
        ticks: { color: "#111827" },
        grid: { color: "rgba(17,24,39,0.1)" },
      },
    },
  };

  if (chart === "line") {
    return {
      type: "line",
      description: "Temperature trend across selected hours.",
      data: {
        labels: weather.map((point) => new Date(point.time).toLocaleTimeString("en-US", { hour: "2-digit" })),
        datasets: [
          {
            label: "Temperature C",
            data: weather.map((point) => point.temperature_2m),
            borderColor: colors[0],
            backgroundColor: `${colors[0]}33`,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options,
    };
  }

  if (chart === "bar") {
    return {
      type: "bar",
      description: "Top countries by population.",
      data: {
        labels: countries.map((country) => country.name),
        datasets: [
          {
            label: "Population",
            data: countries.map((country) => country.population),
            backgroundColor: colors,
          },
        ],
      },
      options,
    };
  }

  if (chart === "radar") {
    return {
      type: "radar",
      description: "Precipitation profile by weather sample.",
      data: {
        labels: weather.map((point) => new Date(point.time).toLocaleTimeString("en-US", { hour: "2-digit" })),
        datasets: [
          {
            label: "Precipitation %",
            data: weather.map((point) => point.precipitation_probability),
            borderColor: colors[1],
            backgroundColor: `${colors[1]}33`,
          },
        ],
      },
      options,
    };
  }

  if (chart === "pie") {
    return {
      type: "pie",
      description: "Market-cap composition across major assets.",
      data: {
        labels: crypto.map((coin) => coin.symbol),
        datasets: [
          {
            label: "Market cap",
            data: crypto.map((coin) => coin.market_cap),
            backgroundColor: colors,
          },
        ],
      },
      options,
    };
  }

  if (chart === "doughnut") {
    return {
      type: "doughnut",
      description: "Market-cap composition with center focus.",
      data: {
        labels: crypto.map((coin) => coin.symbol),
        datasets: [
          {
            label: "Market cap",
            data: crypto.map((coin) => coin.market_cap),
            backgroundColor: colors,
          },
        ],
      },
      options,
    };
  }

  if (chart === "polar-area") {
    return {
      type: "polarArea",
      description: "Regional population in radial sectors.",
      data: {
        labels: countries.map((country) => country.region),
        datasets: [
          {
            label: "Population",
            data: countries.map((country) => country.population),
            backgroundColor: colors,
          },
        ],
      },
      options,
    };
  }

  if (chart === "bubble") {
    return {
      type: "bubble",
      description: "Area vs population bubbles scaled by density.",
      data: {
        datasets: [
          {
            label: "Countries",
            data: countries.map((country) => ({
              x: country.area / 1000,
              y: country.population / 1_000_000,
              r: Math.max(4, Math.min(18, Math.sqrt(country.density))),
            })),
            backgroundColor: `${colors[2]}AA`,
          },
        ],
      },
      options,
    };
  }

  if (chart === "scatter") {
    return {
      type: "scatter",
      description: "Asset volume versus 24h price change.",
      data: {
        datasets: [
          {
            label: "Assets",
            data: crypto.map((coin) => ({
              x: coin.total_volume / 1_000_000,
              y: coin.price_change_percentage_24h,
            })),
            backgroundColor: `${colors[3]}CC`,
          },
        ],
      },
      options,
    };
  }

  return {
    type: "bar",
    description: "Mixed chart combining population bars and weather trend line.",
    data: {
      labels: countries.map((country) => country.name),
      datasets: [
        {
          type: "bar",
          label: "Population",
          data: countries.map((country) => country.population),
          backgroundColor: colors,
        },
        {
          type: "line",
          label: "Temperature sample",
          data: countries.map((_, index) => weather[index % weather.length]?.temperature_2m ?? 0),
          borderColor: colors[0],
          backgroundColor: `${colors[0]}33`,
          yAxisID: "y1",
          tension: 0.35,
        },
      ],
    },
    options: {
      ...options,
      scales: {
        x: {
          ticks: { color: "#111827" },
          grid: { color: "rgba(17,24,39,0.1)" },
        },
        y: {
          ticks: { color: "#111827" },
          grid: { color: "rgba(17,24,39,0.1)" },
          position: "left",
        },
        y1: {
          ticks: { color: "#111827" },
          grid: { drawOnChartArea: false, color: "rgba(17,24,39,0.1)" },
          position: "right",
        },
      },
    },
  };
}
