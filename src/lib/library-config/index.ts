import { LIBRARY_CONFIG } from "@/lib/library-config/inventory";
import type { LibraryId, LibraryIndexDefinition, LibraryRoute } from "@/lib/types";

const LIBRARY_IDS: LibraryId[] = ["chartjs", "recharts", "echarts"];

export function isLibraryId(value: string): value is LibraryId {
  return LIBRARY_IDS.includes(value as LibraryId);
}

export function getLibraryConfig(library: LibraryId): LibraryIndexDefinition {
  return LIBRARY_CONFIG[library];
}

export function getChartDefinition(library: LibraryId, chart: string) {
  return LIBRARY_CONFIG[library].charts.find((item) => item.slug === chart) ?? null;
}

export function isValidLibraryChart(library: LibraryId, chart: string): boolean {
  return getChartDefinition(library, chart) !== null;
}

export function getAllLibraryConfigs(): LibraryIndexDefinition[] {
  return LIBRARY_IDS.map((id) => LIBRARY_CONFIG[id]);
}

export function getAllLibraryRoutes(): LibraryRoute[] {
  return LIBRARY_IDS.flatMap((library) =>
    LIBRARY_CONFIG[library].charts.map((chart) => ({
      library,
      chart: chart.slug,
    })),
  );
}

export function getLibraryStaticParams() {
  return LIBRARY_IDS.map((library) => ({ library }));
}

export function getLibraryChartStaticParams() {
  return getAllLibraryRoutes().map((route) => ({
    library: route.library,
    chart: route.chart,
  }));
}
