"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { LibraryControls } from "@/components/library/library-controls";
import { LibraryDataTable } from "@/components/library/library-data-table";
import { useDatasetBundle } from "@/lib/datasets/base";
import { getChartDefinition, getLibraryConfig } from "@/lib/library-config";
import type { LibraryId, SortOrder } from "@/lib/types";

const ChartJsRenderer = dynamic(
  () => import("@/components/charts/chartjs/chartjs-renderer").then((module) => module.ChartJsRenderer),
  { ssr: false },
);

const RechartsRenderer = dynamic(
  () => import("@/components/charts/recharts/recharts-renderer").then((module) => module.RechartsRenderer),
  { ssr: false },
);

const EchartsRenderer = dynamic(
  () => import("@/components/charts/echarts/echarts-renderer").then((module) => module.EchartsRenderer),
  { ssr: false },
);

const EchartsDashboard = dynamic(
  () => import("@/components/charts/echarts/echarts-dashboard").then((module) => module.EchartsDashboard),
  { ssr: false },
);

const EchartsCoffeeDashboard = dynamic(
  () =>
    import("@/components/charts/echarts/echarts-coffee-dashboard").then(
      (module) => module.EchartsCoffeeDashboard,
    ),
  { ssr: false },
);

type LibraryChartPageClientProps = {
  chart: string;
  library: LibraryId;
};

function parseLimit(value: string | null) {
  const numeric = Number(value ?? "12");
  if (Number.isNaN(numeric)) {
    return 12;
  }
  return Math.max(6, Math.min(24, numeric));
}

function parseOrder(value: string | null): SortOrder {
  return value === "asc" ? "asc" : "desc";
}

function parseTheme(value: string | null) {
  if (value === "noir" || value === "signal") {
    return value;
  }
  return "paper";
}

function parseMetric(value: string | null) {
  if (value === "economics" || value === "resources") {
    return value;
  }
  return "climate";
}

export function LibraryChartPageClient({ chart, library }: LibraryChartPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const libraryDefinition = getLibraryConfig(library);
  const chartDefinition = getChartDefinition(library, chart);

  const limit = parseLimit(searchParams.get("limit"));
  const order = parseOrder(searchParams.get("order"));
  const theme = parseTheme(searchParams.get("theme"));
  const metric = parseMetric(searchParams.get("metric"));

  const { data, error, isLoading, isRefreshing, retry } = useDatasetBundle(chartDefinition?.dataset ?? "composite");

  const updateParam = useCallback(
    (key: string, value: string | number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, String(value));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const renderer = useMemo(() => {
    if (library === "chartjs") {
      return <ChartJsRenderer chart={chart} data={data} limit={limit} order={order} theme={theme} />;
    }

    if (library === "recharts") {
      return <RechartsRenderer chart={chart} data={data} limit={limit} order={order} />;
    }

    if (chart === "dashboard") {
      return <EchartsDashboard data={data} limit={limit} metric={metric} order={order} theme={theme} />;
    }

    if (chart === "coffee-dashboard") {
      return <EchartsCoffeeDashboard data={data} limit={limit} order={order} theme={theme} />;
    }

    return <EchartsRenderer chart={chart} data={data} limit={limit} order={order} theme={theme} />;
  }, [chart, data, library, limit, metric, order, theme]);

  if (!chartDefinition) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-4 py-8 md:px-8" id="main-content">
      <header className="rounded-3xl border border-black/10 bg-[var(--paper)] p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          <Link className="rounded-full border border-black/15 bg-white px-3 py-1 transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink" href="/">
            Home
          </Link>
          <Link className="rounded-full border border-black/15 bg-white px-3 py-1 transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink" href={`/libraries/${library}`}>
            {libraryDefinition.title}
          </Link>
        </div>
        <h1 className="mt-4 text-balance font-display text-4xl leading-tight text-ink md:text-5xl">{chartDefinition.title}</h1>
        <p className="mt-2 max-w-3xl text-base text-ink-muted">{chartDefinition.description}</p>
      </header>

      <section className="mt-6 space-y-5">
        <LibraryControls
          controls={chartDefinition.controls}
          isRefreshing={isRefreshing}
          limit={limit}
          onChange={updateParam}
          onRetry={retry}
          order={order}
          theme={theme}
          metric={metric}
        />

        {isLoading ? (
          <section aria-live="polite" className="rounded-2xl border border-black/10 bg-[var(--paper)] p-6 text-sm text-ink-muted">
            Loading dataset…
          </section>
        ) : null}

        {!isLoading && error ? (
          <section aria-live="assertive" role="alert" className="rounded-2xl border border-red-400/50 bg-red-50 p-6 text-red-900">
            <h2 className="text-lg font-semibold">Data request failed</h2>
            <p className="mt-2 text-sm">{error}</p>
            <button
              className="mt-4 rounded-lg border border-red-400/50 bg-white px-3 py-2 text-sm font-semibold text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
              onClick={retry}
              type="button"
            >
              Retry
            </button>
          </section>
        ) : null}

        {!isLoading && !error ? renderer : null}
        {!isLoading && !error && chart !== "coffee-dashboard" ? <LibraryDataTable data={data} /> : null}
      </section>
    </main>
  );
}
