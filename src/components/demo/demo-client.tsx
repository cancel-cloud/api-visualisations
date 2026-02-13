"use client";

import { useCallback, useMemo } from "react";
import type { ChartData, ChartOptions } from "chart.js";
import Link from "next/link";

import { ChartSurface } from "@/components/charts/chart-surface";
import { DataTable } from "@/components/charts/data-table";
import { ControlPanel } from "@/components/controls/control-panel";
import { useApiData } from "@/hooks/use-api-data";
import { useUrlControls } from "@/hooks/use-url-controls";
import { DEMO_CARDS, getDemoMeta } from "@/lib/demo-config";
import {
  average,
  formatCompactNumber,
  formatDecimal,
  formatNumber,
  sortByNumericKey,
  toLocalLabel,
} from "@/lib/data-utils";
import { getPreset, PRESET_OPTIONS, resolvePreset } from "@/lib/style-presets";
import type {
  ControlField,
  CountryMetric,
  CryptoMetric,
  DemoSlug,
  TableColumn,
  WeatherPoint,
} from "@/lib/types";

type DemoClientProps = {
  slug: DemoSlug;
};

type DemoRuntime = {
  title: string;
  subtitle: string;
  endpoint: string;
  controls: ControlField[];
  chartType: "bar" | "line" | "doughnut" | "radar" | "bubble";
  build: (rows: unknown[]) => {
    chartAriaLabel: string;
    chartData: ChartData;
    chartOptions: ChartOptions;
    tableColumns: TableColumn<Record<string, unknown>>[];
    tableRows: Record<string, unknown>[];
  };
};

const REGION_OPTIONS = [
  { label: "All regions", value: "all" },
  { label: "Africa", value: "Africa" },
  { label: "Americas", value: "Americas" },
  { label: "Asia", value: "Asia" },
  { label: "Europe", value: "Europe" },
  { label: "Oceania", value: "Oceania" },
];

const SORT_ORDER_OPTIONS = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
];

function buildChartOptions(
  textColor: string,
  axisColor: string,
  title: string,
  enableZoom = true,
): ChartOptions {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
    plugins: {
      title: {
        display: true,
        text: title,
        color: textColor,
      },
      legend: {
        labels: {
          color: textColor,
          boxWidth: 14,
        },
      },
      datalabels: {
        display: false,
      },
      zoom: {
        zoom: {
          wheel: { enabled: enableZoom },
          pinch: { enabled: enableZoom },
          mode: "x",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          maxRotation: 35,
          minRotation: 25,
        },
        grid: {
          color: axisColor,
        },
      },
      y: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: axisColor,
        },
      },
    },
  };
}

function useRuntime(slug: DemoSlug, paramsKey: string): DemoRuntime {
  return useMemo(() => {
    const params = new URLSearchParams(paramsKey);
    const preset = getPreset(resolvePreset(params.get("style")));

    const sortOrder = params.get("order") === "asc" ? "asc" : "desc";
    const limit = Math.max(5, Math.min(25, Number(params.get("limit") ?? "12")));

    if (slug === "countries-bar") {
      const region = params.get("region") ?? "all";
      const sort = params.get("sort") ?? "population";
      const endpoint = `/api/countries?region=${region}&sort=${sort}&order=${sortOrder}&limit=${limit}`;
      return {
        title: "Countries Bar",
        subtitle: "Population and area distribution by region.",
        endpoint,
        chartType: "bar",
        controls: [
          { key: "region", kind: "select", label: "Region", value: region, options: REGION_OPTIONS },
          {
            key: "sort",
            kind: "select",
            label: "Sort metric",
            value: sort,
            options: [
              { label: "Population", value: "population" },
              { label: "Area", value: "area" },
              { label: "Density", value: "density" },
            ],
          },
          {
            key: "order",
            kind: "select",
            label: "Sort order",
            value: sortOrder,
            options: SORT_ORDER_OPTIONS,
          },
          { key: "limit", kind: "range", label: "Top N", value: limit, min: 5, max: 25, step: 1 },
          {
            key: "style",
            kind: "select",
            label: "Style preset",
            value: resolvePreset(params.get("style")),
            options: PRESET_OPTIONS,
          },
        ],
        build: (rows) => {
          const items = rows as CountryMetric[];
          const labels = items.map((item) => item.name);
          const values = items.map((item) => item[sort as "population" | "area" | "density"] ?? 0);
          return {
            chartAriaLabel: "Countries ranking chart",
            chartData: {
              labels,
              datasets: [
                {
                  label: sort,
                  data: values,
                  backgroundColor: preset.colors[0],
                  borderColor: preset.colors[1],
                  borderWidth: 1,
                },
              ],
            } as ChartData,
            chartOptions: buildChartOptions(
              preset.text,
              preset.axis,
              `Top ${limit} countries by ${sort}`,
            ),
            tableColumns: [
              { key: "name", label: "Country" },
              { key: "region", label: "Region" },
              {
                key: "population",
                label: "Population",
                format: (value) => formatNumber(Number(value ?? 0)),
              },
              { key: "area", label: "Area", format: (value) => formatNumber(Number(value ?? 0)) },
              {
                key: "density",
                label: "Density",
                format: (value) => formatDecimal(Number(value ?? 0), 3),
              },
            ],
            tableRows: items as unknown as Record<string, unknown>[],
          };
        },
      };
    }

    if (slug === "countries-bubble") {
      const region = params.get("region") ?? "all";
      const sort = params.get("sort") ?? "density";
      const endpoint = `/api/countries?region=${region}&sort=${sort}&order=${sortOrder}&limit=${limit}`;
      return {
        title: "Countries Bubble",
        subtitle: "Area (x) vs population (y), bubble size by density.",
        endpoint,
        chartType: "bubble",
        controls: [
          { key: "region", kind: "select", label: "Region", value: region, options: REGION_OPTIONS },
          {
            key: "sort",
            kind: "select",
            label: "Sort metric",
            value: sort,
            options: [
              { label: "Density", value: "density" },
              { label: "Population", value: "population" },
              { label: "Area", value: "area" },
            ],
          },
          {
            key: "order",
            kind: "select",
            label: "Sort order",
            value: sortOrder,
            options: SORT_ORDER_OPTIONS,
          },
          { key: "limit", kind: "range", label: "Top N", value: limit, min: 5, max: 25, step: 1 },
          {
            key: "style",
            kind: "select",
            label: "Style preset",
            value: resolvePreset(params.get("style")),
            options: PRESET_OPTIONS,
          },
        ],
        build: (rows) => {
          const items = rows as CountryMetric[];
          return {
            chartAriaLabel: "Bubble chart of countries by area and population",
            chartData: {
              datasets: [
                {
                  label: "Countries",
                  data: items.map((item) => ({
                    x: Number((item.area / 1000).toFixed(2)),
                    y: Number((item.population / 1_000_000).toFixed(2)),
                    r: Math.max(6, Math.min(24, Math.sqrt(item.density || 1))),
                  })),
                  backgroundColor: preset.colors[2],
                  borderColor: preset.colors[0],
                },
              ],
            } as ChartData,
            chartOptions: {
              ...buildChartOptions(preset.text, preset.axis, "Population vs Area", false),
              scales: {
                x: {
                  title: { display: true, text: "Area (thousand km2)", color: preset.text },
                  ticks: { color: preset.text },
                  grid: { color: preset.axis },
                },
                y: {
                  title: { display: true, text: "Population (millions)", color: preset.text },
                  ticks: { color: preset.text },
                  grid: { color: preset.axis },
                },
              },
            } as ChartOptions,
            tableColumns: [
              { key: "name", label: "Country" },
              { key: "region", label: "Region" },
              {
                key: "population",
                label: "Population",
                format: (value) => formatCompactNumber(Number(value ?? 0)),
              },
              { key: "area", label: "Area", format: (value) => formatCompactNumber(Number(value ?? 0)) },
              {
                key: "density",
                label: "Density",
                format: (value) => formatDecimal(Number(value ?? 0), 2),
              },
            ],
            tableRows: items as unknown as Record<string, unknown>[],
          };
        },
      };
    }

    if (slug === "weather-line") {
      const metric = params.get("metric") === "precipitation_probability" ? "precipitation_probability" : "temperature_2m";
      const hours = Math.max(12, Math.min(72, Number(params.get("hours") ?? "36")));
      const sort = params.get("sort") === "value" ? "value" : "time";
      const endpoint = `/api/weather?lat=52.52&lon=13.41&metric=${metric}&hours=${hours}&sort=${sort}&order=${sortOrder}`;
      return {
        title: "Weather Line",
        subtitle: "Hourly trend explorer with metric switching.",
        endpoint,
        chartType: "line",
        controls: [
          {
            key: "metric",
            kind: "select",
            label: "Metric",
            value: metric,
            options: [
              { label: "Temperature", value: "temperature_2m" },
              { label: "Precipitation %", value: "precipitation_probability" },
            ],
          },
          {
            key: "sort",
            kind: "select",
            label: "Sort by",
            value: sort,
            options: [
              { label: "Time", value: "time" },
              { label: "Value", value: "value" },
            ],
          },
          {
            key: "order",
            kind: "select",
            label: "Sort order",
            value: sortOrder,
            options: SORT_ORDER_OPTIONS,
          },
          { key: "hours", kind: "range", label: "Hours", value: hours, min: 12, max: 72, step: 6 },
          {
            key: "style",
            kind: "select",
            label: "Style preset",
            value: resolvePreset(params.get("style")),
            options: PRESET_OPTIONS,
          },
        ],
        build: (rows) => {
          const items = rows as WeatherPoint[];
          const values = items.map((point) => point[metric]);
          return {
            chartAriaLabel: "Weather trend line chart",
            chartData: {
              labels: items.map((point) => toLocalLabel(point.time)),
              datasets: [
                {
                  label: metric,
                  data: values,
                  borderColor: preset.colors[0],
                  backgroundColor: `${preset.colors[0]}33`,
                  fill: true,
                  tension: 0.3,
                },
              ],
            } as ChartData,
            chartOptions: buildChartOptions(
              preset.text,
              preset.axis,
              `${metric} across ${hours} hours`,
            ),
            tableColumns: [
              { key: "time", label: "Timestamp" },
              {
                key: "temperature_2m",
                label: "Temp",
                format: (value) => `${formatDecimal(Number(value ?? 0), 1)} C`,
              },
              {
                key: "precipitation_probability",
                label: "Precip %",
                format: (value) => `${formatDecimal(Number(value ?? 0), 0)}%`,
              },
            ],
            tableRows: items as unknown as Record<string, unknown>[],
          };
        },
      };
    }

    if (slug === "weather-radar") {
      const metric = params.get("metric") === "precipitation_probability" ? "precipitation_probability" : "temperature_2m";
      const hours = Math.max(24, Math.min(72, Number(params.get("hours") ?? "48")));
      const endpoint = `/api/weather?lat=52.52&lon=13.41&metric=${metric}&hours=${hours}&sort=time&order=${sortOrder}`;
      return {
        title: "Weather Radar",
        subtitle: "A six-segment profile of weather intensity.",
        endpoint,
        chartType: "radar",
        controls: [
          {
            key: "metric",
            kind: "select",
            label: "Metric",
            value: metric,
            options: [
              { label: "Temperature", value: "temperature_2m" },
              { label: "Precipitation %", value: "precipitation_probability" },
            ],
          },
          {
            key: "order",
            kind: "select",
            label: "Order",
            value: sortOrder,
            options: SORT_ORDER_OPTIONS,
          },
          { key: "hours", kind: "range", label: "Hours", value: hours, min: 24, max: 72, step: 6 },
          {
            key: "style",
            kind: "select",
            label: "Style preset",
            value: resolvePreset(params.get("style")),
            options: PRESET_OPTIONS,
          },
        ],
        build: (rows) => {
          const items = rows as WeatherPoint[];
          const chunk = Math.max(1, Math.floor(items.length / 6));
          const labels: string[] = [];
          const values: number[] = [];

          for (let index = 0; index < 6; index += 1) {
            const start = index * chunk;
            const end = index === 5 ? items.length : start + chunk;
            const section = items.slice(start, end);
            labels.push(`Window ${index + 1}`);
            values.push(average(section.map((point) => point[metric])));
          }

          const tableRows = labels.map((label, index) => ({
            segment: label,
            value: values[index],
          }));

          return {
            chartAriaLabel: "Weather radar chart",
            chartData: {
              labels,
              datasets: [
                {
                  label: metric,
                  data: values,
                  backgroundColor: `${preset.colors[1]}33`,
                  borderColor: preset.colors[1],
                },
              ],
            } as ChartData,
            chartOptions: {
              ...buildChartOptions(preset.text, preset.axis, `${metric} profile`, false),
              scales: {
                r: {
                  grid: { color: preset.axis },
                  angleLines: { color: preset.axis },
                  ticks: { color: preset.text },
                  pointLabels: { color: preset.text },
                },
              },
            } as ChartOptions,
            tableColumns: [
              { key: "segment", label: "Segment" },
              {
                key: "value",
                label: metric,
                format: (value) => formatDecimal(Number(value ?? 0), 2),
              },
            ],
            tableRows,
          };
        },
      };
    }

    if (slug === "crypto-candlestick-like") {
      const currency = params.get("vs_currency") === "eur" ? "eur" : "usd";
      const sortParam = params.get("sort");
      const sort =
        sortParam === "price_change_24h" || sortParam === "current_price"
          ? sortParam
          : "market_cap";
      const endpoint = `/api/crypto?vs_currency=${currency}&sort=${sort}&order=${sortOrder}&limit=${limit}`;
      return {
        title: "Crypto Candlestick-Like",
        subtitle: "Range bars for daily low-high plus current close line.",
        endpoint,
        chartType: "bar",
        controls: [
          {
            key: "vs_currency",
            kind: "select",
            label: "Currency",
            value: currency,
            options: [
              { label: "USD", value: "usd" },
              { label: "EUR", value: "eur" },
            ],
          },
          {
            key: "sort",
            kind: "select",
            label: "Sort metric",
            value: sort,
            options: [
              { label: "Market cap", value: "market_cap" },
              { label: "24h change", value: "price_change_24h" },
              { label: "Current price", value: "current_price" },
            ],
          },
          {
            key: "order",
            kind: "select",
            label: "Sort order",
            value: sortOrder,
            options: SORT_ORDER_OPTIONS,
          },
          { key: "limit", kind: "range", label: "Top N", value: limit, min: 5, max: 25, step: 1 },
          {
            key: "style",
            kind: "select",
            label: "Style preset",
            value: resolvePreset(params.get("style")),
            options: PRESET_OPTIONS,
          },
        ],
        build: (rows) => {
          const items = rows as CryptoMetric[];
          return {
            chartAriaLabel: "Crypto high low range chart",
            chartData: {
              labels: items.map((item) => item.symbol),
              datasets: [
                {
                  label: "Low-High Range",
                  data: items.map((item) => [item.low_24h, item.high_24h]),
                  backgroundColor: `${preset.colors[2]}44`,
                  borderColor: preset.colors[2],
                  borderWidth: 1,
                },
                {
                  type: "line",
                  label: "Current Price",
                  data: items.map((item) => item.current_price),
                  borderColor: preset.colors[0],
                  pointBackgroundColor: preset.colors[0],
                  pointRadius: 3,
                  tension: 0.25,
                },
              ],
            } as ChartData,
            chartOptions: buildChartOptions(
              preset.text,
              preset.axis,
              `Daily range and current price (${currency.toUpperCase()})`,
            ),
            tableColumns: [
              { key: "name", label: "Asset" },
              { key: "symbol", label: "Ticker" },
              {
                key: "current_price",
                label: "Current",
                format: (value) => formatDecimal(Number(value ?? 0), 2),
              },
              {
                key: "low_24h",
                label: "Low 24h",
                format: (value) => formatDecimal(Number(value ?? 0), 2),
              },
              {
                key: "high_24h",
                label: "High 24h",
                format: (value) => formatDecimal(Number(value ?? 0), 2),
              },
            ],
            tableRows: items as unknown as Record<string, unknown>[],
          };
        },
      };
    }

    if (slug === "crypto-donut") {
      const currency = params.get("vs_currency") === "eur" ? "eur" : "usd";
      const sort = params.get("sort") === "current_price" ? "current_price" : "market_cap";
      const endpoint = `/api/crypto?vs_currency=${currency}&sort=${sort}&order=${sortOrder}&limit=${limit}`;
      return {
        title: "Crypto Donut",
        subtitle: "Market share snapshot for top assets.",
        endpoint,
        chartType: "doughnut",
        controls: [
          {
            key: "vs_currency",
            kind: "select",
            label: "Currency",
            value: currency,
            options: [
              { label: "USD", value: "usd" },
              { label: "EUR", value: "eur" },
            ],
          },
          {
            key: "sort",
            kind: "select",
            label: "Sort metric",
            value: sort,
            options: [
              { label: "Market cap", value: "market_cap" },
              { label: "Current price", value: "current_price" },
            ],
          },
          {
            key: "order",
            kind: "select",
            label: "Sort order",
            value: sortOrder,
            options: SORT_ORDER_OPTIONS,
          },
          { key: "limit", kind: "range", label: "Top N", value: limit, min: 5, max: 25, step: 1 },
          {
            key: "style",
            kind: "select",
            label: "Style preset",
            value: resolvePreset(params.get("style")),
            options: PRESET_OPTIONS,
          },
        ],
        build: (rows) => {
          const items = rows as CryptoMetric[];
          return {
            chartAriaLabel: "Crypto market cap distribution donut chart",
            chartData: {
              labels: items.map((item) => item.symbol),
              datasets: [
                {
                  data: items.map((item) => item.market_cap),
                  backgroundColor: items.map((_, index) => preset.colors[index % preset.colors.length]),
                  borderColor: "#ffffff",
                  borderWidth: 2,
                },
              ],
            } as ChartData,
            chartOptions: {
              ...buildChartOptions(preset.text, preset.axis, "Market cap distribution", false),
              cutout: "55%",
            } as ChartOptions,
            tableColumns: [
              { key: "name", label: "Asset" },
              { key: "symbol", label: "Ticker" },
              {
                key: "market_cap",
                label: "Market cap",
                format: (value) => formatCompactNumber(Number(value ?? 0)),
              },
              {
                key: "current_price",
                label: "Price",
                format: (value) => formatDecimal(Number(value ?? 0), 2),
              },
            ],
            tableRows: items as unknown as Record<string, unknown>[],
          };
        },
      };
    }

    if (slug === "mixed-combo") {
      const region = params.get("region") ?? "all";
      const sort = params.get("sort") ?? "population";
      const endpoint = `/api/countries?region=${region}&sort=${sort}&order=${sortOrder}&limit=${limit}`;
      return {
        title: "Mixed Combo",
        subtitle: "Population bars plus density trend line.",
        endpoint,
        chartType: "bar",
        controls: [
          { key: "region", kind: "select", label: "Region", value: region, options: REGION_OPTIONS },
          {
            key: "sort",
            kind: "select",
            label: "Sort metric",
            value: sort,
            options: [
              { label: "Population", value: "population" },
              { label: "Area", value: "area" },
              { label: "Density", value: "density" },
            ],
          },
          {
            key: "order",
            kind: "select",
            label: "Sort order",
            value: sortOrder,
            options: SORT_ORDER_OPTIONS,
          },
          { key: "limit", kind: "range", label: "Top N", value: limit, min: 5, max: 25, step: 1 },
          {
            key: "style",
            kind: "select",
            label: "Style preset",
            value: resolvePreset(params.get("style")),
            options: PRESET_OPTIONS,
          },
        ],
        build: (rows) => {
          const items = rows as CountryMetric[];
          return {
            chartAriaLabel: "Mixed combo countries chart",
            chartData: {
              labels: items.map((item) => item.name),
              datasets: [
                {
                  label: "Population",
                  data: items.map((item) => item.population),
                  backgroundColor: `${preset.colors[0]}99`,
                  yAxisID: "y",
                },
                {
                  type: "line",
                  label: "Density",
                  data: items.map((item) => Number(item.density.toFixed(3))),
                  borderColor: preset.colors[3],
                  backgroundColor: `${preset.colors[3]}66`,
                  yAxisID: "y1",
                },
              ],
            } as ChartData,
            chartOptions: {
              ...buildChartOptions(preset.text, preset.axis, "Population vs Density"),
              scales: {
                x: {
                  ticks: { color: preset.text },
                  grid: { color: preset.axis },
                },
                y: {
                  type: "linear",
                  position: "left",
                  ticks: { color: preset.text },
                  grid: { color: preset.axis },
                },
                y1: {
                  type: "linear",
                  position: "right",
                  ticks: { color: preset.text },
                  grid: { drawOnChartArea: false, color: preset.axis },
                },
              },
            } as ChartOptions,
            tableColumns: [
              { key: "name", label: "Country" },
              {
                key: "population",
                label: "Population",
                format: (value) => formatCompactNumber(Number(value ?? 0)),
              },
              {
                key: "density",
                label: "Density",
                format: (value) => formatDecimal(Number(value ?? 0), 3),
              },
            ],
            tableRows: items as unknown as Record<string, unknown>[],
          };
        },
      };
    }

    const region = params.get("region") ?? "all";
    const sort = params.get("sort") ?? "population";
    const chartMode = params.get("chart") === "radar" ? "radar" : params.get("chart") === "line" ? "line" : "bar";
    const endpoint = `/api/countries?region=${region}&sort=${sort}&order=${sortOrder}&limit=${limit}`;
    return {
      title: "Style Lab",
      subtitle: "Same data, different chart forms and visual presets.",
      endpoint,
      chartType: chartMode,
      controls: [
        { key: "region", kind: "select", label: "Region", value: region, options: REGION_OPTIONS },
        {
          key: "chart",
          kind: "select",
          label: "Chart mode",
          value: chartMode,
          options: [
            { label: "Bar", value: "bar" },
            { label: "Line", value: "line" },
            { label: "Radar", value: "radar" },
          ],
        },
        {
          key: "sort",
          kind: "select",
          label: "Sort metric",
          value: sort,
          options: [
            { label: "Population", value: "population" },
            { label: "Area", value: "area" },
            { label: "Density", value: "density" },
          ],
        },
        {
          key: "order",
          kind: "select",
          label: "Sort order",
          value: sortOrder,
          options: SORT_ORDER_OPTIONS,
        },
        { key: "limit", kind: "range", label: "Top N", value: limit, min: 5, max: 25, step: 1 },
        {
          key: "style",
          kind: "select",
          label: "Style preset",
          value: resolvePreset(params.get("style")),
          options: PRESET_OPTIONS,
        },
      ],
      build: (rows) => {
        const items = rows as CountryMetric[];
        const sorted = sortByNumericKey(items, sort as keyof CountryMetric, sortOrder);
        return {
          chartAriaLabel: "Style lab chart",
          chartData: {
            labels: sorted.map((item) => item.name),
            datasets: [
              {
                label: sort,
                data: sorted.map((item) => Number(item[sort as "population" | "area" | "density"])),
                borderColor: preset.colors[0],
                backgroundColor:
                  chartMode === "line" ? `${preset.colors[0]}33` : preset.colors.map((color) => `${color}BB`),
                fill: chartMode === "line",
                tension: 0.35,
              },
            ],
          } as ChartData,
          chartOptions:
            chartMode === "radar"
              ? ({
                  ...buildChartOptions(preset.text, preset.axis, `${sort} style comparison`, false),
                  scales: {
                    r: {
                      grid: { color: preset.axis },
                      angleLines: { color: preset.axis },
                      ticks: { color: preset.text },
                      pointLabels: { color: preset.text },
                    },
                  },
                } as ChartOptions)
              : buildChartOptions(preset.text, preset.axis, `${sort} style comparison`, false),
          tableColumns: [
            { key: "name", label: "Country" },
            { key: "region", label: "Region" },
            {
              key: sort,
              label: sort,
              format: (value) => formatCompactNumber(Number(value ?? 0)),
            },
          ],
          tableRows: sorted as unknown as Record<string, unknown>[],
        };
      },
    };
  }, [paramsKey, slug]);
}

export function DemoClient({ slug }: DemoClientProps) {
  const { paramsKey, setParam } = useUrlControls();
  const runtime = useRuntime(slug, paramsKey);
  const meta = getDemoMeta(slug);
  const { data, error, isLoading, isRefreshing, retry } = useApiData<unknown>(runtime.endpoint);

  const chartResult = useMemo(() => {
    const rows = data?.data ?? [];
    return runtime.build(rows);
  }, [data?.data, runtime]);

  const onSelectChange = useCallback(
    (key: string, value: string) => {
      setParam(key, value);
    },
    [setParam],
  );

  const onRangeChange = useCallback(
    (key: string, value: number) => {
      setParam(key, value);
    },
    [setParam],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-10 md:px-10" id="main-content">
      <header className="space-y-2">
        <Link
          className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-sm font-medium text-slate-800 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          href="/"
        >
          Back to Gallery
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">{meta.category}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-balance md:text-4xl">
          {runtime.title}
        </h1>
        <p className="max-w-3xl text-base text-slate-700">{runtime.subtitle}</p>
      </header>

      <ControlPanel
        controls={runtime.controls}
        isRefreshing={isRefreshing}
        onRangeChange={onRangeChange}
        onRetry={retry}
        onSelectChange={onSelectChange}
      />

      {isLoading ? (
        <section
          aria-live="polite"
          className="rounded-2xl border border-slate-900/10 bg-white/70 p-8 text-center text-slate-700 shadow-sm"
        >
          Fetching API data…
        </section>
      ) : null}

      {!isLoading && error ? (
        <section
          aria-live="assertive"
          className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-900 shadow-sm"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Could not load this dataset</h2>
          <p className="mt-1 text-sm">{error}</p>
          <button
            className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-800 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            onClick={retry}
            type="button"
          >
            Retry now
          </button>
        </section>
      ) : null}

      {!isLoading && !error && chartResult.tableRows.length === 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          No records found for the current filter set. Adjust filters or sort values.
        </section>
      ) : null}

      {!isLoading && !error && chartResult.tableRows.length > 0 ? (
        <>
          <section
            className="rounded-2xl border border-slate-900/10 p-2 shadow-sm"
            style={{ backgroundColor: getPreset(resolvePreset(new URLSearchParams(paramsKey).get("style"))).surface }}
          >
            <div className="h-[420px]">
              <ChartSurface
                ariaLabel={chartResult.chartAriaLabel}
                data={chartResult.chartData}
                options={chartResult.chartOptions}
                type={runtime.chartType}
              />
            </div>
          </section>
          <DataTable
            caption={`${runtime.title} dataset`}
            columns={chartResult.tableColumns}
            rows={chartResult.tableRows}
          />
        </>
      ) : null}

      <nav aria-label="Other demos" className="rounded-2xl border border-slate-900/10 bg-white/80 p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-slate-800">Jump to other demos</p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_CARDS.map((card) => (
            <li key={card.slug}>
              <Link
                className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:text-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                href={`/demo/${card.slug}`}
              >
                {card.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
