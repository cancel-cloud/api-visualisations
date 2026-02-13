"use client";

import type { ControlField } from "@/lib/types";

type ControlPanelProps = {
  controls: ControlField[];
  onSelectChange: (key: string, value: string) => void;
  onRangeChange: (key: string, value: number) => void;
  onRetry: () => void;
  isRefreshing: boolean;
};

export function ControlPanel({
  controls,
  onSelectChange,
  onRangeChange,
  onRetry,
  isRefreshing,
}: ControlPanelProps) {
  return (
    <section
      aria-label="Data controls"
      className="rounded-2xl border border-slate-900/10 bg-white/80 p-4 shadow-sm backdrop-blur"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {controls.map((control) => {
          if (control.kind === "select") {
            return (
              <label key={control.key} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                {control.label}
                <select
                  autoComplete="off"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-orange-500/50 transition focus:ring-2"
                  name={control.key}
                  onChange={(event) => {
                    onSelectChange(control.key, event.target.value);
                  }}
                  value={control.value}
                >
                  {control.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          return (
            <label key={control.key} className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <span className="flex items-center justify-between">
                <span>{control.label}</span>
                <span className="font-mono text-xs text-slate-600">{control.value}</span>
              </span>
              <input
                autoComplete="off"
                className="h-2 cursor-pointer appearance-none rounded-full bg-slate-200 accent-orange-600"
                max={control.max}
                min={control.min}
                name={control.key}
                onChange={(event) => {
                  onRangeChange(control.key, Number(event.target.value));
                }}
                step={control.step}
                type="range"
                value={control.value}
              />
            </label>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-end">
        <button
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRefreshing}
          onClick={onRetry}
          type="button"
        >
          {isRefreshing ? "Refreshing…" : "Retry Request"}
        </button>
      </div>
    </section>
  );
}
