import { describe, expect, it } from "vitest";

import { resolveLegacyDemoPath } from "@/lib/library-config/legacy-map";

describe("legacy demo mapping", () => {
  it("maps known demo slugs to library routes", () => {
    expect(resolveLegacyDemoPath("countries-bar")).toBe("/libraries/chartjs/bar");
    expect(resolveLegacyDemoPath("crypto-candlestick-like")).toBe("/libraries/echarts/candlestick");
  });

  it("falls back to chartjs library index", () => {
    expect(resolveLegacyDemoPath("unknown-demo")).toBe("/libraries/chartjs");
  });
});
