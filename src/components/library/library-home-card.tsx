import Link from "next/link";

import type { LibraryIndexDefinition } from "@/lib/types";

type LibraryHomeCardProps = {
  library: LibraryIndexDefinition;
};

export function LibraryHomeCard({ library }: LibraryHomeCardProps) {
  return (
    <Link
      className="group relative overflow-hidden rounded-[1.75rem] border border-black/10 bg-[var(--paper)] p-6 shadow-[0_20px_40px_-30px_rgba(31,41,55,0.55)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_44px_-24px_rgba(31,41,55,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
      href={`/libraries/${library.id}`}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 -translate-y-8 translate-x-8 rounded-full opacity-30 blur-2xl" style={{ backgroundColor: library.accent }} />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">{library.id}</p>
      <h2 className="mt-2 font-display text-3xl leading-none text-ink">{library.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{library.subtitle}</p>
      <div className="mt-5 flex items-center justify-between">
        <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-ink">
          {library.charts.length} chart pages
        </span>
        <span className="text-sm font-semibold text-ink transition group-hover:translate-x-0.5">Open Library</span>
      </div>
    </Link>
  );
}
