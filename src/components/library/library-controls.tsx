"use client";

import type { ChartControlSchema, SortOrder } from "@/lib/types";

type LibraryControlsProps = {
  controls: ChartControlSchema[];
  limit: number;
  order: SortOrder;
  theme: string;
  metric: string;
  onChange: (key: string, value: string | number) => void;
  onRetry: () => void;
  isRefreshing: boolean;
};

function controlValue(
  schema: ChartControlSchema,
  limit: number,
  order: SortOrder,
  theme: string,
  metric: string,
) {
  if (schema.key === "limit") {
    return limit;
  }
  if (schema.key === "order") {
    return order;
  }
  if (schema.key === "metric") {
    return metric;
  }
  return theme;
}

export function LibraryControls({
  controls,
  limit,
  order,
  theme,
  metric,
  onChange,
  onRetry,
  isRefreshing,
}: LibraryControlsProps) {
  return (
    <section aria-label="Chart controls" className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4">
      <div className="grid gap-4 md:grid-cols-3">
        {controls.map((schema) => {
          if (schema.kind === "range") {
            const value = Number(controlValue(schema, limit, order, theme, metric));
            return (
              <label key={schema.key} className="flex flex-col gap-1 text-sm font-medium text-ink">
                <span className="flex items-center justify-between">
                  <span>{schema.label}</span>
                  <span className="font-mono text-xs text-ink-muted">{value}</span>
                </span>
                <input
                  aria-label={schema.label}
                  autoComplete="off"
                  className="h-2 cursor-pointer rounded-full bg-black/10 accent-[var(--accent)]"
                  max={schema.max}
                  min={schema.min}
                  name={schema.key}
                  onChange={(event) => {
                    onChange(schema.key, Number(event.target.value));
                  }}
                  step={schema.step}
                  type="range"
                  value={value}
                />
              </label>
            );
          }

          const value = String(controlValue(schema, limit, order, theme, metric));
          return (
            <label key={schema.key} className="flex flex-col gap-1 text-sm font-medium text-ink">
              {schema.label}
              <select
                aria-label={schema.label}
                autoComplete="off"
                className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
                name={schema.key}
                onChange={(event) => {
                  onChange(schema.key, event.target.value);
                }}
                value={value}
              >
                {(schema.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRefreshing}
          onClick={onRetry}
          type="button"
        >
          {isRefreshing ? "Refreshing…" : "Refresh Data"}
        </button>
      </div>
    </section>
  );
}
