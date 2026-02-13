import { Suspense } from "react";
import { notFound } from "next/navigation";

import { LibraryChartPageClient } from "@/components/library/library-chart-page-client";
import { getLibraryChartStaticParams, isLibraryId, isValidLibraryChart } from "@/lib/library-config";

type LibraryChartPageProps = {
  params: Promise<{ library: string; chart: string }>;
};

export function generateStaticParams() {
  return getLibraryChartStaticParams();
}

export default async function LibraryChartPage({ params }: LibraryChartPageProps) {
  const { library, chart } = await params;

  if (!isLibraryId(library) || !isValidLibraryChart(library, chart)) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-[1400px] items-center justify-center px-4 py-12" id="main-content">
          <div className="rounded-2xl border border-black/10 bg-[var(--paper)] px-6 py-4 text-sm text-ink-muted">Loading chart page…</div>
        </main>
      }
    >
      <LibraryChartPageClient chart={chart} library={library} />
    </Suspense>
  );
}
