"use client";

import { memo, useMemo } from "react";
import * as R from "recharts";

import { buildRechartsData } from "@/lib/datasets/transforms/recharts";
import type { BaseDatasetBundle, SortOrder } from "@/lib/types";

type RechartsRendererProps = {
  chart: string;
  data: BaseDatasetBundle;
  limit: number;
  order: SortOrder;
};

const COLORS = ["#7C3AED", "#EA580C", "#0F766E", "#B91C1C", "#0EA5E9", "#A16207"];

function RechartsRendererComponent({ chart, data, limit, order }: RechartsRendererProps) {
  const built = useMemo(() => buildRechartsData(chart, data, limit, order), [chart, data, limit, order]);

  const rows = (built.payload.rows ?? []) as Array<Record<string, number | string>>;
  const tree = (built.payload.tree ?? null) as
    | { name: string; children?: Array<{ name: string; value: number; children?: unknown[] }> }
    | null;
  const nodes = (built.payload.nodes ?? []) as Array<{ name: string }>;
  const links = (built.payload.links ?? []) as Array<{ source: string; target: string; value: number }>;
  const indexedLinks = links
    .map((link) => ({
      source: nodes.findIndex((node) => node.name === link.source),
      target: nodes.findIndex((node) => node.name === link.target),
      value: link.value,
    }))
    .filter((link) => link.source >= 0 && link.target >= 0);

  const SunburstChart = (R as unknown as { SunburstChart?: React.ComponentType<Record<string, unknown>> }).SunburstChart;
  const SankeyChart = R.Sankey as unknown as React.ComponentType<Record<string, unknown>>;

  return (
    <section className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4">
      <p className="mb-3 text-sm text-ink-muted">{built.description}</p>
      <div className="h-[460px] rounded-xl border border-black/10 bg-white p-2">
        <R.ResponsiveContainer width="100%" height="100%">
          {chart === "area-chart" ? (
            <R.AreaChart data={rows}>
              <R.CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <R.XAxis dataKey="label" />
              <R.YAxis />
              <R.Tooltip />
              <R.Area type="monotone" dataKey="temperature" stroke={COLORS[0]} fill={`${COLORS[0]}55`} />
            </R.AreaChart>
          ) : null}

          {chart === "bar-chart" ? (
            <R.BarChart data={rows}>
              <R.CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <R.XAxis dataKey="name" />
              <R.YAxis />
              <R.Tooltip />
              <R.Bar dataKey="population" fill={COLORS[1]} />
            </R.BarChart>
          ) : null}

          {chart === "line-chart" ? (
            <R.LineChart data={rows}>
              <R.CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <R.XAxis dataKey="label" />
              <R.YAxis />
              <R.Tooltip />
              <R.Line type="monotone" dataKey="temperature" stroke={COLORS[2]} strokeWidth={2} dot={false} />
            </R.LineChart>
          ) : null}

          {chart === "composed-chart" ? (
            <R.ComposedChart data={rows}>
              <R.CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <R.XAxis dataKey="name" />
              <R.YAxis yAxisId="left" />
              <R.YAxis yAxisId="right" orientation="right" />
              <R.Tooltip />
              <R.Bar yAxisId="left" dataKey="population" fill={COLORS[0]} />
              <R.Line yAxisId="right" type="monotone" dataKey="weatherIndex" stroke={COLORS[3]} strokeWidth={2} />
            </R.ComposedChart>
          ) : null}

          {chart === "pie-chart" ? (
            <R.PieChart>
              <R.Tooltip />
              <R.Pie data={rows} dataKey="value" nameKey="name" innerRadius={70} outerRadius={150}>
                {rows.map((row, index) => (
                  <R.Cell key={String(row.name)} fill={COLORS[index % COLORS.length]} />
                ))}
              </R.Pie>
            </R.PieChart>
          ) : null}

          {chart === "radar-chart" ? (
            <R.RadarChart data={rows}>
              <R.PolarGrid />
              <R.PolarAngleAxis dataKey="region" />
              <R.PolarRadiusAxis />
              <R.Radar dataKey="density" stroke={COLORS[4]} fill={COLORS[4]} fillOpacity={0.35} />
            </R.RadarChart>
          ) : null}

          {chart === "radial-bar-chart" ? (
            <R.RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={rows}>
              <R.RadialBar dataKey="value" background label={{ fill: "#111827", position: "insideStart" }} />
              <R.Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
              <R.Tooltip />
            </R.RadialBarChart>
          ) : null}

          {chart === "scatter-chart" ? (
            <R.ScatterChart>
              <R.CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <R.XAxis dataKey="x" name="Area" />
              <R.YAxis dataKey="y" name="Population" />
              <R.ZAxis dataKey="z" range={[60, 300]} />
              <R.Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <R.Scatter data={rows} fill={COLORS[0]} />
            </R.ScatterChart>
          ) : null}

          {chart === "funnel-chart" ? (
            <R.FunnelChart>
              <R.Tooltip />
              <R.Funnel dataKey="value" data={rows} isAnimationActive nameKey="name">
                <R.LabelList position="right" fill="#111827" stroke="none" dataKey="name" />
              </R.Funnel>
            </R.FunnelChart>
          ) : null}

          {chart === "treemap" ? (
            <R.Treemap {...({
              data: tree?.children ?? [],
              dataKey: "value",
              stroke: "#fff",
              fill: COLORS[2],
              aspectRatio: 1.2,
            } as Record<string, unknown>)} />
          ) : null}

          {chart === "sankey" ? (
            <SankeyChart {...({
              data: { nodes, links: indexedLinks },
              nodePadding: 14,
              margin: { left: 40, right: 40, top: 20, bottom: 20 },
            } as Record<string, unknown>)} />
          ) : null}

          {chart === "sunburst-chart" ? (
            SunburstChart ? (
              <SunburstChart data={tree} dataKey="value" nameKey="name" />
            ) : (
              <foreignObject x={20} y={20} width="100%" height="100%">
                <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                  Sunburst is unavailable in this Recharts build.
                </div>
              </foreignObject>
            )
          ) : null}
        </R.ResponsiveContainer>
      </div>
    </section>
  );
}

export const RechartsRenderer = memo(RechartsRendererComponent);
