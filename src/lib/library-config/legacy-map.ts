import type { DemoSlug } from "@/lib/types";

const LEGACY_ROUTE_MAP: Record<DemoSlug, string> = {
  "countries-bar": "/libraries/chartjs/bar",
  "countries-bubble": "/libraries/chartjs/bubble",
  "weather-line": "/libraries/chartjs/line",
  "weather-radar": "/libraries/chartjs/radar",
  "crypto-candlestick-like": "/libraries/echarts/candlestick",
  "crypto-donut": "/libraries/chartjs/doughnut",
  "mixed-combo": "/libraries/chartjs/mixed",
  "style-lab": "/libraries/chartjs/line",
};

export function resolveLegacyDemoPath(slug: string): string {
  if (slug in LEGACY_ROUTE_MAP) {
    return LEGACY_ROUTE_MAP[slug as DemoSlug];
  }
  return "/libraries/chartjs";
}
