import { describe, expect, it } from "vitest";

import { getAllLibraryConfigs, getAllLibraryRoutes, getChartDefinition, isLibraryId } from "@/lib/library-config";

describe("library config", () => {
  it("contains all three library registries", () => {
    const libraries = getAllLibraryConfigs();
    expect(libraries).toHaveLength(3);
    expect(libraries.map((library) => library.id)).toEqual(["chartjs", "recharts", "echarts"]);
  });

  it("creates unique chart routes and resolvable definitions", () => {
    const routes = getAllLibraryRoutes();
    const unique = new Set(routes.map((route) => `${route.library}:${route.chart}`));

    expect(unique.size).toBe(routes.length);

    routes.forEach((route) => {
      expect(isLibraryId(route.library)).toBe(true);
      expect(getChartDefinition(route.library, route.chart)).not.toBeNull();
    });
  });

  it("exposes expected chart counts", () => {
    const libraries = getAllLibraryConfigs();
    const map = Object.fromEntries(libraries.map((library) => [library.id, library.charts.length]));

    expect(map.chartjs).toBe(9);
    expect(map.recharts).toBe(12);
    expect(map.echarts).toBe(24);
  });
});
