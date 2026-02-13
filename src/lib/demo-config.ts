import type { DemoSlug } from "@/lib/types";

export type DemoCard = {
  slug: DemoSlug;
  title: string;
  subtitle: string;
  category: string;
};

export const DEMO_CARDS: DemoCard[] = [
  {
    slug: "countries-bar",
    title: "Countries Bar",
    subtitle: "Population and area ranking with region filters.",
    category: "Geo",
  },
  {
    slug: "countries-bubble",
    title: "Countries Bubble",
    subtitle: "Area vs population bubbles sized by density.",
    category: "Geo",
  },
  {
    slug: "weather-line",
    title: "Weather Line",
    subtitle: "Hourly weather trends with metric and range controls.",
    category: "Climate",
  },
  {
    slug: "weather-radar",
    title: "Weather Radar",
    subtitle: "Segmented weather intensity profile.",
    category: "Climate",
  },
  {
    slug: "crypto-candlestick-like",
    title: "Crypto Candlestick-Like",
    subtitle: "High/low range bars with current price overlay.",
    category: "Markets",
  },
  {
    slug: "crypto-donut",
    title: "Crypto Donut",
    subtitle: "Market cap distribution for top assets.",
    category: "Markets",
  },
  {
    slug: "mixed-combo",
    title: "Mixed Combo",
    subtitle: "Dual-axis combo chart for comparative metrics.",
    category: "Hybrid",
  },
  {
    slug: "style-lab",
    title: "Style Lab",
    subtitle: "Switch chart styles and visual presets.",
    category: "Design",
  },
];

export const DEMO_SLUGS = DEMO_CARDS.map((demo) => demo.slug);

export function isDemoSlug(value: string): value is DemoSlug {
  return DEMO_SLUGS.includes(value as DemoSlug);
}

export function getDemoMeta(slug: DemoSlug): DemoCard {
  const found = DEMO_CARDS.find((demo) => demo.slug === slug);
  if (!found) {
    throw new Error(`Unknown demo slug: ${slug}`);
  }
  return found;
}
