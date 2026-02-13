"use client";

import dynamic from "next/dynamic";
import { memo, useMemo } from "react";

import { buildEchartsOption } from "@/lib/datasets/transforms/echarts";
import { ensureWorldMap } from "@/lib/echarts/setup";
import type { BaseDatasetBundle, SortOrder } from "@/lib/types";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div className="flex h-[460px] items-center justify-center text-sm text-ink-muted">Loading chart…</div>,
});

type EchartsRendererProps = {
  chart: string;
  data: BaseDatasetBundle;
  limit: number;
  order: SortOrder;
  theme: string;
};

function EchartsRendererComponent({ chart, data, limit, order, theme }: EchartsRendererProps) {
  const needsWorldMap = chart === "map" || chart === "lines";
  const mapReady = !needsWorldMap || ensureWorldMap();

  const built = useMemo(() => buildEchartsOption(chart, data, limit, order, theme), [chart, data, limit, order, theme]);

  return (
    <section className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4">
      <p className="mb-3 text-sm text-ink-muted">{built.description}</p>
      {!mapReady ? (
        <div className="flex h-[460px] items-center justify-center rounded-xl border border-black/10 bg-white text-sm text-ink-muted">
          World map data is unavailable.
        </div>
      ) : (
        <div className="h-[460px] rounded-xl border border-black/10 bg-white p-2">
          <ReactECharts option={built.option} style={{ height: "100%", width: "100%" }} />
        </div>
      )}
    </section>
  );
}

export const EchartsRenderer = memo(EchartsRendererComponent);
