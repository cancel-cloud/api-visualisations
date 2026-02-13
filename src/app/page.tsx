import { LibraryHomeCard } from "@/components/library/library-home-card";
import { getAllLibraryConfigs } from "@/lib/library-config";

export default function HomePage() {
  const libraries = getAllLibraryConfigs();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-4 py-12 md:px-10" id="main-content">
      <header className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-[var(--paper)] px-6 py-10 shadow-[0_40px_70px_-50px_rgba(17,24,39,0.55)] md:px-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(124,58,237,0.28),_transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-28 left-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(234,88,12,0.24),_transparent_70%)]" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.25em] text-ink-muted">Editorial Visual Atlas</p>
        <h1 className="relative mt-4 max-w-4xl text-balance font-display text-5xl leading-[0.95] text-ink md:text-7xl">
          Three chart libraries, rebuilt with a completely new visual identity.
        </h1>
        <p className="relative mt-5 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
          Navigate Chart.js, Recharts, and ECharts as separate galleries. Every official chart family has its own dedicated page and shared live API data foundation.
        </p>
      </header>

      <section aria-label="Chart libraries" className="mt-8 grid gap-5 md:grid-cols-3">
        {libraries.map((library) => (
          <LibraryHomeCard key={library.id} library={library} />
        ))}
      </section>
    </main>
  );
}
