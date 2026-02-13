"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useMemo } from "react";

import {
  buildCoffeeDashboardModel,
  type CoffeeDashboardDaypart,
  type CoffeeDashboardFilters,
  type CoffeeDashboardGranularity,
  type CoffeeDashboardRange,
  type CoffeeDashboardWeekday,
} from "@/lib/datasets/transforms/coffee";
import type { BaseDatasetBundle, SortOrder } from "@/lib/types";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div className="flex h-[320px] items-center justify-center text-sm text-ink-muted">Loading chart…</div>,
});

const ECHARTS_STYLE = { height: "100%", width: "100%" } as const;
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

type EchartsCoffeeDashboardProps = {
  data: BaseDatasetBundle;
  limit: number;
  order: SortOrder;
  theme: string;
};

const RANGE_OPTIONS: CoffeeDashboardRange[] = ["30d", "90d", "365d", "all"];
const GRANULARITY_OPTIONS: CoffeeDashboardGranularity[] = ["day", "week", "month"];
const WEEKDAY_OPTIONS: CoffeeDashboardWeekday[] = [
  "all",
  "weekdays",
  "weekends",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];
const DAYPART_OPTIONS: CoffeeDashboardDaypart[] = ["all", "morning", "afternoon", "evening", "night"];

function parseRange(value: string | null): CoffeeDashboardRange {
  if (value && RANGE_OPTIONS.includes(value as CoffeeDashboardRange)) {
    return value as CoffeeDashboardRange;
  }
  return "90d";
}

function parseGranularity(value: string | null): CoffeeDashboardGranularity {
  if (value && GRANULARITY_OPTIONS.includes(value as CoffeeDashboardGranularity)) {
    return value as CoffeeDashboardGranularity;
  }
  return "day";
}

function parseWeekday(value: string | null): CoffeeDashboardWeekday {
  if (value && WEEKDAY_OPTIONS.includes(value as CoffeeDashboardWeekday)) {
    return value as CoffeeDashboardWeekday;
  }
  return "all";
}

function parseDaypart(value: string | null): CoffeeDashboardDaypart {
  if (value && DAYPART_OPTIONS.includes(value as CoffeeDashboardDaypart)) {
    return value as CoffeeDashboardDaypart;
  }
  return "all";
}

function paletteFor(theme: string) {
  if (theme === "noir") {
    return {
      surface: "#ffffff",
      ink: "#111827",
      muted: "#4b5563",
      series: ["#111827", "#4b5563", "#6b7280", "#1f2937"],
    };
  }

  if (theme === "signal") {
    return {
      surface: "#ffffff",
      ink: "#111827",
      muted: "#374151",
      series: ["#ef4444", "#0ea5e9", "#f59e0b", "#4f46e5"],
    };
  }

  return {
    surface: "#ffffff",
    ink: "#1f2937",
    muted: "#475569",
    series: ["#0f766e", "#ea580c", "#155e75", "#a16207"],
  };
}

function labelForWeekday(value: CoffeeDashboardWeekday) {
  if (value === "weekdays") {
    return "Weekdays";
  }
  if (value === "weekends") {
    return "Weekends";
  }
  return value === "all" ? "All days" : value.toUpperCase();
}

function labelForRange(value: CoffeeDashboardRange) {
  if (value === "all") {
    return "All time";
  }
  return value;
}

function EchartsCoffeeDashboardComponent({ data, limit, order, theme }: EchartsCoffeeDashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: CoffeeDashboardFilters = useMemo(
    () => ({
      range: parseRange(searchParams.get("range")),
      granularity: parseGranularity(searchParams.get("granularity")),
      weekday: parseWeekday(searchParams.get("weekday")),
      daypart: parseDaypart(searchParams.get("daypart")),
    }),
    [searchParams],
  );

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const palette = useMemo(() => paletteFor(theme), [theme]);
  const model = useMemo(
    () => buildCoffeeDashboardModel(data.coffee, filters, order, limit),
    [data.coffee, filters, limit, order],
  );

  const timeSeriesOption = useMemo(
    () => ({
      color: palette.series,
      backgroundColor: palette.surface,
      textStyle: { fontFamily: "var(--font-body)", color: palette.ink },
      tooltip: { trigger: "axis" },
      legend: {
        top: 4,
        textStyle: { color: palette.muted },
      },
      grid: { left: 40, right: 20, top: 38, bottom: 36 },
      xAxis: {
        type: "category",
        data: model.timeSeries.map((item) => item.label),
        axisLabel: { color: palette.muted },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: palette.muted },
      },
      series: [
        {
          name: "Normal",
          type: "bar",
          stack: "coffee",
          data: model.timeSeries.map((item) => item.normal),
        },
        {
          name: "Espresso",
          type: "bar",
          stack: "coffee",
          data: model.timeSeries.map((item) => item.espresso),
        },
      ],
    }),
    [model.timeSeries, palette],
  );

  const hourlyOption = useMemo(
    () => ({
      color: [palette.series[0]],
      backgroundColor: palette.surface,
      textStyle: { fontFamily: "var(--font-body)", color: palette.ink },
      tooltip: { trigger: "axis" },
      grid: { left: 40, right: 20, top: 26, bottom: 36 },
      xAxis: {
        type: "category",
        data: model.hourly.map((item) => `${String(item.hour).padStart(2, "0")}:00`),
        axisLabel: { color: palette.muted, rotate: 40 },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: palette.muted },
      },
      series: [
        {
          type: "bar",
          data: model.hourly.map((item) => item.count),
          barMaxWidth: 14,
        },
      ],
    }),
    [model.hourly, palette],
  );

  const weekdayOption = useMemo(
    () => ({
      color: [palette.series[1]],
      backgroundColor: palette.surface,
      textStyle: { fontFamily: "var(--font-body)", color: palette.ink },
      tooltip: { trigger: "axis" },
      grid: { left: 40, right: 20, top: 26, bottom: 36 },
      xAxis: {
        type: "category",
        data: model.weekday.map((item) => item.label),
        axisLabel: { color: palette.muted },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: palette.muted },
      },
      series: [
        {
          type: "line",
          smooth: true,
          areaStyle: { opacity: 0.15 },
          data: model.weekday.map((item) => item.count),
        },
      ],
    }),
    [model.weekday, palette],
  );

  const monthlyOption = useMemo(
    () => ({
      color: palette.series,
      backgroundColor: palette.surface,
      textStyle: { fontFamily: "var(--font-body)", color: palette.ink },
      tooltip: { trigger: "axis" },
      legend: {
        top: 4,
        textStyle: { color: palette.muted },
      },
      grid: { left: 40, right: 20, top: 38, bottom: 36 },
      xAxis: {
        type: "category",
        data: model.monthly.map((item) => item.label),
        axisLabel: { color: palette.muted },
      },
      yAxis: [
        { type: "value", axisLabel: { color: palette.muted } },
        { type: "value", axisLabel: { color: palette.muted, formatter: "{value}%" } },
      ],
      series: [
        {
          name: "Total",
          type: "bar",
          yAxisIndex: 0,
          data: model.monthly.map((item) => item.total),
        },
        {
          name: "Espresso Ratio",
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          data: model.monthly.map((item) => (item.total === 0 ? 0 : Number(((item.espresso / item.total) * 100).toFixed(1)))),
        },
      ],
    }),
    [model.monthly, palette],
  );

  if (data.coffee.length === 0) {
    return (
      <section className="rounded-2xl border border-black/10 bg-[var(--paper)] p-6 text-sm text-ink-muted">
        Coffee data is unavailable.
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <section className="rounded-2xl border border-black/10 bg-[var(--paper)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Coffee Behavior Dashboard</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Espresso Cluster Analysis</h2>
            <p className="mt-2 max-w-3xl text-sm text-ink-muted">
              Rule: when two or more coffee entries are within 60 seconds, all entries in that close cluster count as espresso.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
            {labelForRange(filters.range)} • {filters.granularity} • {labelForWeekday(filters.weekday)}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Date range
            <select
              aria-label="Date range"
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
              onChange={(event) => updateParam("range", event.target.value)}
              value={filters.range}
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last 365 days</option>
              <option value="all">All time</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Aggregation
            <select
              aria-label="Aggregation"
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
              onChange={(event) => updateParam("granularity", event.target.value)}
              value={filters.granularity}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Weekday filter
            <select
              aria-label="Weekday filter"
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
              onChange={(event) => updateParam("weekday", event.target.value)}
              value={filters.weekday}
            >
              <option value="all">All days</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="mon">Monday</option>
              <option value="tue">Tuesday</option>
              <option value="wed">Wednesday</option>
              <option value="thu">Thursday</option>
              <option value="fri">Friday</option>
              <option value="sat">Saturday</option>
              <option value="sun">Sunday</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Time of day
            <select
              aria-label="Time of day"
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
              onChange={(event) => updateParam("daypart", event.target.value)}
              value={filters.daypart}
            >
              <option value="all">All</option>
              <option value="morning">Morning (05-11)</option>
              <option value="afternoon">Afternoon (12-16)</option>
              <option value="evening">Evening (17-21)</option>
              <option value="night">Night (22-04)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-black/10 bg-[var(--paper)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Total Coffees</p>
          <p className="mt-2 font-display text-3xl text-ink">{model.kpis.total}</p>
        </article>
        <article className="rounded-xl border border-black/10 bg-[var(--paper)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Espresso Entries</p>
          <p className="mt-2 font-display text-3xl text-ink">{model.kpis.espressoCount}</p>
        </article>
        <article className="rounded-xl border border-black/10 bg-[var(--paper)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Espresso Ratio</p>
          <p className="mt-2 font-display text-3xl text-ink">{(model.kpis.espressoRatio * 100).toFixed(1)}%</p>
        </article>
        <article className="rounded-xl border border-black/10 bg-[var(--paper)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Avg Coffees / Day</p>
          <p className="mt-2 font-display text-3xl text-ink">{model.kpis.averagePerDay.toFixed(2)}</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-8">
          <h3 className="font-display text-2xl text-ink">Normal vs Espresso Timeline</h3>
          <p className="mt-1 text-sm text-ink-muted">Stacked counts grouped by your selected granularity.</p>
          <div className="mt-3 h-[320px] rounded-xl border border-black/10 bg-white p-2">
            <ReactECharts lazyUpdate notMerge option={timeSeriesOption} style={ECHARTS_STYLE} />
          </div>
        </article>

        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-4">
          <h3 className="font-display text-2xl text-ink">Espresso Insight</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Close clusters are sequences with adjacent entries {"<="} 60 seconds.
          </p>
          <dl className="mt-4 grid gap-3">
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-muted">Cluster Events</dt>
              <dd className="mt-1 text-2xl font-semibold text-ink">{model.insight.clusterEvents}</dd>
            </div>
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-muted">Entries In Clusters</dt>
              <dd className="mt-1 text-2xl font-semibold text-ink">{model.insight.closeEventEntries}</dd>
            </div>
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-muted">Largest Cluster</dt>
              <dd className="mt-1 text-2xl font-semibold text-ink">{model.insight.largestCluster}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-6">
          <h3 className="font-display text-2xl text-ink">Hour of Day</h3>
          <p className="mt-1 text-sm text-ink-muted">Local-time drinking rhythm across 24 hours.</p>
          <div className="mt-3 h-[300px] rounded-xl border border-black/10 bg-white p-2">
            <ReactECharts lazyUpdate notMerge option={hourlyOption} style={ECHARTS_STYLE} />
          </div>
        </article>

        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-6">
          <h3 className="font-display text-2xl text-ink">Weekday Distribution</h3>
          <p className="mt-1 text-sm text-ink-muted">Coffee frequency by local weekday.</p>
          <div className="mt-3 h-[300px] rounded-xl border border-black/10 bg-white p-2">
            <ReactECharts lazyUpdate notMerge option={weekdayOption} style={ECHARTS_STYLE} />
          </div>
        </article>

        <article className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4 xl:col-span-12">
          <h3 className="font-display text-2xl text-ink">Monthly Trend + Espresso Ratio</h3>
          <p className="mt-1 text-sm text-ink-muted">Bars show total coffees; line shows espresso percentage per month.</p>
          <div className="mt-3 h-[320px] rounded-xl border border-black/10 bg-white p-2">
            <ReactECharts lazyUpdate notMerge option={monthlyOption} style={ECHARTS_STYLE} />
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4">
        <h3 className="font-display text-2xl text-ink">Coffee Table (Accessible Fallback)</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Entries classified with the 60-second rule. Showing up to {model.tableRows.length} rows under current filters.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-ink tabular-nums">
            <caption className="sr-only">Coffee checkins with espresso classification and previous-gap seconds.</caption>
            <thead>
              <tr>
                <th className="border-b border-black/10 px-2 py-2">Local Time</th>
                <th className="border-b border-black/10 px-2 py-2">Type</th>
                <th className="border-b border-black/10 px-2 py-2">Gap To Prev (sec)</th>
              </tr>
            </thead>
            <tbody>
              {model.tableRows.map((row) => (
                <tr key={row.id}>
                  <td className="border-b border-black/5 px-2 py-2">{DATE_TIME_FORMATTER.format(new Date(row.createdAt))}</td>
                  <td className="border-b border-black/5 px-2 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.isEspresso ? "bg-[var(--accent)]/15 text-ink" : "bg-black/5 text-ink-muted"
                      }`}
                    >
                      {row.isEspresso ? "Espresso" : "Normal"}
                    </span>
                  </td>
                  <td className="border-b border-black/5 px-2 py-2">{row.gapToPrevSeconds ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export const EchartsCoffeeDashboard = memo(EchartsCoffeeDashboardComponent);
