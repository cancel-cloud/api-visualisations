"use client";

import dynamic from "next/dynamic";
import { memo, useEffect, useState } from "react";
import type { ChartData, ChartOptions } from "chart.js";

import { registerCharts } from "@/lib/chart-registry";

const DynamicChart = dynamic(
  async () => {
    const chartModule = await import("react-chartjs-2");
    return chartModule.Chart;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        Chart loading…
      </div>
    ),
  },
);

type ChartSurfaceProps = {
  ariaLabel: string;
  data: ChartData;
  options: ChartOptions;
  type: "bar" | "line" | "doughnut" | "radar" | "bubble";
};

function ChartSurfaceComponent({ ariaLabel, data, options, type }: ChartSurfaceProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void registerCharts().then(() => {
      if (mounted) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        Chart loading…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white/80 p-4 shadow-sm backdrop-blur">
      <DynamicChart aria-label={ariaLabel} data={data} options={options} role="img" type={type} />
    </div>
  );
}

export const ChartSurface = memo(ChartSurfaceComponent);
