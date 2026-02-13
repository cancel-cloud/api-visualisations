"use client";

import { memo, useMemo } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadarController,
  RadialLinearScale,
  ScatterController,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";

import { buildChartJsChart } from "@/lib/datasets/transforms/chartjs";
import type { BaseDatasetBundle, SortOrder } from "@/lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  ScatterController,
  Tooltip,
  Legend,
  Filler,
);

type ChartJsRendererProps = {
  chart: string;
  data: BaseDatasetBundle;
  limit: number;
  order: SortOrder;
  theme: string;
};

function ChartJsRendererComponent({ chart, data, limit, order, theme }: ChartJsRendererProps) {
  const config = useMemo(() => buildChartJsChart(chart, data, limit, order, theme), [chart, data, limit, order, theme]);

  return (
    <section className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4">
      <p className="mb-3 text-sm text-ink-muted">{config.description}</p>
      <div className="h-[460px] rounded-xl border border-black/10 bg-white p-3">
        <Chart data={config.data} options={config.options} type={config.type} />
      </div>
    </section>
  );
}

export const ChartJsRenderer = memo(ChartJsRendererComponent);
