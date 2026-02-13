import Link from "next/link";

import type { LibraryChartDefinition, LibraryId } from "@/lib/types";

type LibraryChartLinkProps = {
  chart: LibraryChartDefinition;
  library: LibraryId;
};

export function LibraryChartLink({ chart, library }: LibraryChartLinkProps) {
  return (
    <Link
      className="group rounded-2xl border border-black/10 bg-[var(--paper)] p-4 transition hover:border-black/30 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
      href={`/libraries/${library}/${chart.slug}`}
    >
      <h3 className="font-display text-xl text-ink group-hover:tracking-[0.01em]">{chart.title}</h3>
      <p className="mt-2 text-sm text-ink-muted">{chart.description}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-muted/90">{chart.slug}</p>
    </Link>
  );
}
