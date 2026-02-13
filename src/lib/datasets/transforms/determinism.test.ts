import { describe, expect, it } from "vitest";

import { buildGraphData, buildMapPoints, buildSankeyData, buildTreeData } from "@/lib/datasets/transforms/shared";
import type { BaseDatasetBundle } from "@/lib/types";

const bundle: BaseDatasetBundle = {
  countries: [
    { name: "Alpha", region: "Europe", population: 1200, area: 40, density: 30 },
    { name: "Beta", region: "Asia", population: 800, area: 20, density: 40 },
    { name: "Gamma", region: "Europe", population: 600, area: 30, density: 20 },
  ],
  weather: [
    { time: "2026-02-13T00:00", temperature_2m: 8, precipitation_probability: 20 },
    { time: "2026-02-13T01:00", temperature_2m: 7, precipitation_probability: 35 },
  ],
  crypto: [
    {
      id: "btc",
      symbol: "BTC",
      name: "Bitcoin",
      image: "https://example.com/btc.png",
      current_price: 65000,
      market_cap: 1000000,
      price_change_percentage_24h: 3.2,
      high_24h: 66000,
      low_24h: 63000,
      total_volume: 100000,
    },
    {
      id: "eth",
      symbol: "ETH",
      name: "Ethereum",
      image: "https://example.com/eth.png",
      current_price: 3200,
      market_cap: 400000,
      price_change_percentage_24h: -1.1,
      high_24h: 3300,
      low_24h: 3000,
      total_volume: 50000,
    },
  ],
  coffee: [],
};

describe("structural transform determinism", () => {
  it("produces stable tree output", () => {
    expect(buildTreeData(bundle, 8, "desc")).toEqual(buildTreeData(bundle, 8, "desc"));
  });

  it("produces stable sankey and graph output", () => {
    expect(buildSankeyData(bundle, 8, "desc")).toEqual(buildSankeyData(bundle, 8, "desc"));
    expect(buildGraphData(bundle, 8, "desc")).toEqual(buildGraphData(bundle, 8, "desc"));
  });

  it("produces stable map points", () => {
    expect(buildMapPoints(bundle, 8, "desc")).toEqual(buildMapPoints(bundle, 8, "desc"));
  });
});
