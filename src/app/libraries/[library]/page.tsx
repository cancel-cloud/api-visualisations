import Link from "next/link";
import { notFound } from "next/navigation";

import { LibraryChartLink } from "@/components/library/library-chart-link";
import { getLibraryConfig, getLibraryStaticParams, isLibraryId } from "@/lib/library-config";

type LibraryIndexPageProps = {
  params: Promise<{ library: string }>;
};

export function generateStaticParams() {
  return getLibraryStaticParams();
}

export default async function LibraryIndexPage({ params }: LibraryIndexPageProps) {
  const { library } = await params;

  if (!isLibraryId(library)) {
    notFound();
  }

  const definition = getLibraryConfig(library);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-4 py-8 md:px-8" id="main-content">
      <header className="rounded-3xl border border-black/10 bg-[var(--paper)] p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
          <Link className="rounded-full border border-black/15 bg-white px-3 py-1 transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink" href="/">
            Home
          </Link>
          <span>{definition.id}</span>
        </div>
        <h1 className="mt-4 text-balance font-display text-5xl leading-tight text-ink">{definition.title}</h1>
        <p className="mt-2 max-w-3xl text-base text-ink-muted">{definition.subtitle}</p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {definition.charts.map((chart) => (
          <LibraryChartLink key={chart.slug} chart={chart} library={library} />
        ))}
      </section>
    </main>
  );
}
