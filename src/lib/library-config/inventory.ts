import type {
  ChartControlSchema,
  LibraryChartDefinition,
  LibraryId,
  LibraryIndexDefinition,
} from "@/lib/types";

const BASE_CONTROLS: ChartControlSchema[] = [
  {
    key: "limit",
    label: "Top records",
    kind: "range",
    min: 6,
    max: 24,
    step: 1,
    defaultValue: 12,
  },
  {
    key: "order",
    label: "Sort order",
    kind: "select",
    defaultValue: "desc",
    options: [
      { label: "Descending", value: "desc" },
      { label: "Ascending", value: "asc" },
    ],
  },
  {
    key: "theme",
    label: "Palette",
    kind: "select",
    defaultValue: "paper",
    options: [
      { label: "Paper", value: "paper" },
      { label: "Noir", value: "noir" },
      { label: "Signal", value: "signal" },
    ],
  },
];

function chart(slug: string, title: string, description: string, dataset: LibraryChartDefinition["dataset"]) {
  return {
    slug,
    title,
    description,
    dataset,
    controls: BASE_CONTROLS,
  } satisfies LibraryChartDefinition;
}

function chartWithControls(
  slug: string,
  title: string,
  description: string,
  dataset: LibraryChartDefinition["dataset"],
  controls: ChartControlSchema[],
) {
  return {
    slug,
    title,
    description,
    dataset,
    controls,
  } satisfies LibraryChartDefinition;
}

const DASHBOARD_CONTROLS: ChartControlSchema[] = [
  ...BASE_CONTROLS,
  {
    key: "metric",
    label: "Scenario",
    kind: "select",
    defaultValue: "climate",
    options: [
      { label: "Climate Risk", value: "climate" },
      { label: "Economic Stress", value: "economics" },
      { label: "Resource Pressure", value: "resources" },
    ],
  },
];

const chartJsCharts: LibraryChartDefinition[] = [
  chart("line", "Line", "Trend lines for temporal or ordered values.", "weather"),
  chart("bar", "Bar", "Ranked comparisons across countries and regions.", "countries"),
  chart("radar", "Radar", "Multi-axis weather shape comparison.", "weather"),
  chart("pie", "Pie", "Market-cap share breakdown.", "crypto"),
  chart("doughnut", "Doughnut", "Category composition with center focus.", "crypto"),
  chart("polar-area", "Polar Area", "Radial magnitude comparison by region.", "countries"),
  chart("bubble", "Bubble", "Area vs population with density-sized points.", "countries"),
  chart("scatter", "Scatter", "Volume vs volatility pattern clusters.", "crypto"),
  chart("mixed", "Mixed", "Dual narrative: bar totals and line progression.", "composite"),
];

const rechartsCharts: LibraryChartDefinition[] = [
  chart("area-chart", "Area Chart", "Stacked perspective on weather progression.", "weather"),
  chart("bar-chart", "Bar Chart", "Top-country population comparison.", "countries"),
  chart("line-chart", "Line Chart", "Smooth hourly weather trajectory.", "weather"),
  chart("composed-chart", "Composed Chart", "Bar+line overlay for mixed metrics.", "composite"),
  chart("pie-chart", "Pie Chart", "Crypto market share slices.", "crypto"),
  chart("radar-chart", "Radar Chart", "Regional density profile polygon.", "countries"),
  chart("radial-bar-chart", "Radial Bar Chart", "24h change intensity by symbol.", "crypto"),
  chart("scatter-chart", "Scatter Chart", "Country area/population distribution.", "countries"),
  chart("funnel-chart", "Funnel Chart", "Traffic-style funnel derived from market data.", "crypto"),
  chart("treemap", "Treemap", "Region and country hierarchy blocks.", "countries"),
  chart("sankey", "Sankey", "Deterministic flow from region to country groups.", "countries"),
  chart("sunburst-chart", "Sunburst Chart", "Nested regional composition rings.", "countries"),
];

const echartsCharts: LibraryChartDefinition[] = [
  chartWithControls(
    "dashboard",
    "Global Risk Dashboard",
    "Multi-panel view of climate, population, and market stress with shared controls.",
    "composite",
    DASHBOARD_CONTROLS,
  ),
  chart(
    "coffee-dashboard",
    "Coffee Log Dashboard",
    "Coffee check-in patterns with espresso clusters derived from close timestamps.",
    "coffee",
  ),
  chart("line", "Line", "Hourly temperature movement.", "weather"),
  chart("bar", "Bar", "Top market-cap assets.", "crypto"),
  chart("pie", "Pie", "Regional population share.", "countries"),
  chart("scatter", "Scatter", "Area and population point cloud.", "countries"),
  chart("effect-scatter", "Effect Scatter", "Animated emphasis on major markets.", "crypto"),
  chart("radar", "Radar", "Weather metric profile.", "weather"),
  chart("tree", "Tree", "Region-country branching map.", "countries"),
  chart("treemap", "Treemap", "Regional area composition.", "countries"),
  chart("sunburst", "Sunburst", "Population hierarchy rings.", "countries"),
  chart("boxplot", "Boxplot", "Weather distribution windows.", "weather"),
  chart("candlestick", "Candlestick", "Low-high-close style crypto snapshot.", "crypto"),
  chart("heatmap", "Heatmap", "Hour/day weather intensity matrix.", "weather"),
  chart("map", "Map", "Country population signals on world map.", "countries"),
  chart("parallel", "Parallel", "Multivariate country metrics.", "countries"),
  chart("lines", "Lines", "Inter-region flow arcs.", "countries"),
  chart("graph", "Graph", "Asset network by volume similarity.", "crypto"),
  chart("sankey", "Sankey", "Region-to-band flow network.", "countries"),
  chart("funnel", "Funnel", "Value narrowing funnel.", "crypto"),
  chart("gauge", "Gauge", "Average precipitation pressure.", "weather"),
  chart("pictorial-bar", "Pictorial Bar", "Iconic relative country ranking.", "countries"),
  chart("theme-river", "Theme River", "Stacked time ribbons for weather metrics.", "weather"),
  chart("custom", "Custom", "Programmatic circle marks with custom renderer.", "countries"),
];

export const LIBRARY_CONFIG: Record<LibraryId, LibraryIndexDefinition> = {
  chartjs: {
    id: "chartjs",
    title: "Chart.js",
    subtitle: "Canvas-focused fundamentals with concise APIs and broad plugin support.",
    accent: "var(--accent-chartjs)",
    charts: chartJsCharts,
  },
  recharts: {
    id: "recharts",
    title: "Recharts",
    subtitle: "Declarative React chart containers with composable primitives.",
    accent: "var(--accent-recharts)",
    charts: rechartsCharts,
  },
  echarts: {
    id: "echarts",
    title: "ECharts",
    subtitle: "Rich data-visual grammar with advanced series and interaction models.",
    accent: "var(--accent-echarts)",
    charts: echartsCharts,
  },
};
