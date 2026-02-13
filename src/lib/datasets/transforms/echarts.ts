import {
  buildGraphData,
  buildMapPoints,
  buildSankeyData,
  buildTreeData,
  limitedCountries,
  limitedCrypto,
  limitedWeather,
  toDeterministicCoordinate,
} from "@/lib/datasets/transforms/shared";
import type { BaseDatasetBundle, SortOrder } from "@/lib/types";

function palette(theme: string) {
  if (theme === "noir") {
    return ["#111827", "#374151", "#6B7280", "#9CA3AF", "#4B5563", "#1F2937"];
  }
  if (theme === "signal") {
    return ["#EF4444", "#3B82F6", "#F97316", "#14B8A6", "#EAB308", "#8B5CF6"];
  }
  return ["#7C3AED", "#EA580C", "#0F766E", "#B91C1C", "#0284C7", "#A16207"];
}

export function buildEchartsOption(
  chart: string,
  bundle: BaseDatasetBundle,
  limit: number,
  order: SortOrder,
  theme: string,
): { option: Record<string, unknown>; description: string } {
  const colors = palette(theme);
  const countries = limitedCountries(bundle, limit, order);
  const weather = limitedWeather(bundle, limit, order);
  const crypto = limitedCrypto(bundle, limit, order);

  const baseOption: Record<string, unknown> = {
    color: colors,
    grid: {
      left: 40,
      right: 20,
      top: 45,
      bottom: 40,
    },
    tooltip: { trigger: "axis" },
    textStyle: {
      fontFamily: "var(--font-body)",
      color: "#111827",
    },
  };

  if (chart === "line") {
    return {
      description: "Weather temperature timeline",
      option: {
        ...baseOption,
        xAxis: { type: "category", data: weather.map((point) => point.time.slice(11, 16)) },
        yAxis: { type: "value" },
        series: [{ type: "line", smooth: true, data: weather.map((point) => point.temperature_2m) }],
      },
    };
  }

  if (chart === "bar") {
    return {
      description: "Crypto market-cap bars",
      option: {
        ...baseOption,
        xAxis: { type: "category", data: crypto.map((coin) => coin.symbol) },
        yAxis: { type: "value" },
        series: [{ type: "bar", data: crypto.map((coin) => coin.market_cap) }],
      },
    };
  }

  if (chart === "pie") {
    return {
      description: "Regional population pie",
      option: {
        ...baseOption,
        tooltip: { trigger: "item" },
        series: [
          {
            type: "pie",
            radius: ["35%", "70%"],
            data: countries.map((country) => ({ name: country.name, value: country.population })),
          },
        ],
      },
    };
  }

  if (chart === "scatter" || chart === "effect-scatter") {
    return {
      description: "Country area-population scatter",
      option: {
        ...baseOption,
        xAxis: { type: "value", name: "Area (k km2)" },
        yAxis: { type: "value", name: "Population (m)" },
        series: [
          {
            type: chart === "effect-scatter" ? "effectScatter" : "scatter",
            data: countries.map((country) => [country.area / 1000, country.population / 1_000_000, country.name]),
            symbolSize: (value: number[]) => Math.max(8, Math.min(25, Math.sqrt(Number(value[1])))),
          },
        ],
      },
    };
  }

  if (chart === "radar") {
    return {
      description: "Weather radar profile",
      option: {
        ...baseOption,
        tooltip: { trigger: "item" },
        radar: {
          indicator: weather.slice(0, 6).map((point) => ({
            name: point.time.slice(11, 16),
            max: 100,
          })),
        },
        series: [
          {
            type: "radar",
            data: [
              {
                value: weather.slice(0, 6).map((point) => point.precipitation_probability),
                name: "Precipitation",
              },
            ],
          },
        ],
      },
    };
  }

  if (chart === "tree") {
    return {
      description: "Region-country hierarchy tree",
      option: {
        ...baseOption,
        tooltip: { trigger: "item", triggerOn: "mousemove" },
        series: [
          {
            type: "tree",
            data: [buildTreeData(bundle, limit, order)],
            top: "10%",
            left: "7%",
            bottom: "10%",
            right: "20%",
            symbolSize: 8,
            label: {
              position: "left",
              verticalAlign: "middle",
              align: "right",
            },
            leaves: {
              label: {
                position: "right",
                align: "left",
              },
            },
            expandAndCollapse: true,
          },
        ],
      },
    };
  }

  if (chart === "treemap") {
    return {
      description: "Treemap hierarchy",
      option: {
        ...baseOption,
        tooltip: { trigger: "item" },
        series: [
          {
            type: "treemap",
            data: (buildTreeData(bundle, limit, order).children ?? []) as Record<string, unknown>[],
            leafDepth: 2,
          },
        ],
      },
    };
  }

  if (chart === "sunburst") {
    return {
      description: "Sunburst hierarchy",
      option: {
        ...baseOption,
        series: [
          {
            type: "sunburst",
            radius: ["20%", "90%"],
            data: (buildTreeData(bundle, limit, order).children ?? []) as Record<string, unknown>[],
          },
        ],
      },
    };
  }

  if (chart === "boxplot") {
    const chunks = [0, 1, 2, 3].map((index) => weather.slice(index * 6, index * 6 + 6));
    return {
      description: "Weather boxplot windows",
      option: {
        ...baseOption,
        xAxis: { type: "category", data: ["W1", "W2", "W3", "W4"] },
        yAxis: { type: "value" },
        series: [
          {
            type: "boxplot",
            data: chunks.map((chunk) => {
              const values = chunk.map((point) => point.temperature_2m).sort((a, b) => a - b);
              const min = values[0] ?? 0;
              const q1 = values[Math.floor(values.length * 0.25)] ?? min;
              const median = values[Math.floor(values.length * 0.5)] ?? min;
              const q3 = values[Math.floor(values.length * 0.75)] ?? min;
              const max = values[values.length - 1] ?? min;
              return [min, q1, median, q3, max];
            }),
          },
        ],
      },
    };
  }

  if (chart === "candlestick") {
    return {
      description: "Synthetic OHLC from crypto values",
      option: {
        ...baseOption,
        xAxis: { type: "category", data: crypto.map((coin) => coin.symbol) },
        yAxis: { type: "value", scale: true },
        series: [
          {
            type: "candlestick",
            data: crypto.map((coin) => [
              coin.low_24h,
              coin.current_price,
              coin.high_24h,
              coin.current_price * 1.02,
            ]),
          },
        ],
      },
    };
  }

  if (chart === "heatmap") {
    const days = ["D1", "D2", "D3"];
    const hours = Array.from({ length: 8 }, (_, index) => `H${index + 1}`);
    const matrix = days.flatMap((day, dayIndex) =>
      hours.map((hour, hourIndex) => {
        const point = weather[dayIndex * hours.length + hourIndex];
        return [hourIndex, dayIndex, point?.precipitation_probability ?? 0];
      }),
    );

    return {
      description: "Weather heatmap",
      option: {
        ...baseOption,
        xAxis: { type: "category", data: hours },
        yAxis: { type: "category", data: days },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: 2,
        },
        series: [{ type: "heatmap", data: matrix }],
      },
    };
  }

  if (chart === "map") {
    return {
      description: "World map with deterministic country coordinates",
      option: {
        ...baseOption,
        geo: {
          map: "world",
          roam: true,
          itemStyle: {
            areaColor: "#f2e8d6",
            borderColor: "#6b7280",
          },
        },
        series: [
          {
            type: "scatter",
            coordinateSystem: "geo",
            data: buildMapPoints(bundle, limit, order),
            symbolSize: (value: number[]) => Math.max(6, Math.min(20, Math.sqrt(Number(value[2])) / 200)),
          },
        ],
      },
    };
  }

  if (chart === "parallel") {
    return {
      description: "Parallel coordinates for country metrics",
      option: {
        ...baseOption,
        parallelAxis: [
          { dim: 0, name: "Population" },
          { dim: 1, name: "Area" },
          { dim: 2, name: "Density" },
        ],
        parallel: { left: 60, right: 40, top: 50, bottom: 50 },
        series: [
          {
            type: "parallel",
            data: countries.map((country) => [country.population, country.area, country.density]),
          },
        ],
      },
    };
  }

  if (chart === "lines") {
    const points = countries.slice(0, 8).map((country) => ({
      name: country.name,
      coord: toDeterministicCoordinate(country.name),
    }));

    return {
      description: "Inter-country line arcs",
      option: {
        ...baseOption,
        geo: {
          map: "world",
          roam: true,
          itemStyle: {
            areaColor: "#f2e8d6",
            borderColor: "#6b7280",
          },
        },
        series: [
          {
            type: "lines",
            coordinateSystem: "geo",
            effect: { show: true, symbolSize: 4 },
            data: points.slice(1).map((point, index) => ({
              coords: [Array.from(points[index].coord), Array.from(point.coord)],
            })),
          },
        ],
      },
    };
  }

  if (chart === "graph") {
    const graph = buildGraphData(bundle, limit, order);
    return {
      description: "Crypto network graph",
      option: {
        ...baseOption,
        tooltip: { trigger: "item" },
        series: [
          {
            type: "graph",
            layout: "force",
            roam: true,
            data: graph.nodes,
            links: graph.links,
          },
        ],
      },
    };
  }

  if (chart === "sankey") {
    const sankey = buildSankeyData(bundle, limit, order);
    return {
      description: "Sankey flow from region to country",
      option: {
        ...baseOption,
        tooltip: { trigger: "item" },
        series: [
          {
            type: "sankey",
            data: sankey.nodes,
            links: sankey.links,
            emphasis: { focus: "adjacency" },
          },
        ],
      },
    };
  }

  if (chart === "funnel") {
    const lead = crypto[0]?.market_cap ?? 1;
    return {
      description: "Synthetic funnel conversion",
      option: {
        ...baseOption,
        tooltip: { trigger: "item" },
        series: [
          {
            type: "funnel",
            left: "10%",
            top: 30,
            bottom: 20,
            width: "80%",
            data: [
              { name: "Awareness", value: lead },
              { name: "Interest", value: lead * 0.66 },
              { name: "Intent", value: lead * 0.44 },
              { name: "Purchase", value: lead * 0.25 },
            ],
          },
        ],
      },
    };
  }

  if (chart === "gauge") {
    const avg = weather.reduce((acc, point) => acc + point.precipitation_probability, 0) / Math.max(1, weather.length);
    return {
      description: "Average precipitation gauge",
      option: {
        ...baseOption,
        tooltip: { formatter: "{a} <br/>{b} : {c}%" },
        series: [
          {
            type: "gauge",
            detail: { formatter: "{value}%" },
            data: [{ value: Number(avg.toFixed(1)), name: "Precip" }],
          },
        ],
      },
    };
  }

  if (chart === "pictorial-bar") {
    return {
      description: "Pictorial bars for population",
      option: {
        ...baseOption,
        xAxis: { type: "category", data: countries.map((country) => country.name) },
        yAxis: { type: "value" },
        series: [
          {
            type: "pictorialBar",
            symbol: "rect",
            symbolRepeat: true,
            symbolSize: [12, 4],
            symbolMargin: 2,
            data: countries.map((country) => country.population),
          },
        ],
      },
    };
  }

  if (chart === "theme-river") {
    const rows = weather.slice(0, 18).flatMap((point) => [
      [point.time, point.temperature_2m, "Temperature"],
      [point.time, point.precipitation_probability, "Precipitation"],
    ]);
    return {
      description: "Weather theme river timeline",
      option: {
        ...baseOption,
        singleAxis: {
          type: "time",
          top: 50,
          bottom: 50,
        },
        series: [
          {
            type: "themeRiver",
            data: rows as Array<[string, number, string]>,
          },
        ],
      },
    };
  }

  return {
    description: "Custom series using deterministic coordinates",
    option: {
      ...baseOption,
      xAxis: { type: "value" },
      yAxis: { type: "value" },
      series: [
        {
          type: "custom",
          renderItem(params: unknown, api: Record<string, (...args: unknown[]) => unknown>) {
            const xValue = api.value(0) as number;
            const yValue = api.value(1) as number;
            const coord = api.coord([xValue, yValue]) as number[];
            const size = api.size([1, 1]) as number[];
            return {
              type: "circle",
              shape: {
                cx: coord[0],
                cy: coord[1],
                r: Math.max(4, (size[0] ?? 16) * 0.25),
              },
              style: api.style(),
            };
          },
          data: countries.map((country) => [country.area / 1000, country.population / 1_000_000]),
        },
      ],
    },
  };
}
