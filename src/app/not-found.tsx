import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-start justify-center gap-4 px-6" id="main-content">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Not Found</p>
      <h1 className="text-balance font-display text-4xl text-ink">The requested chart page does not exist.</h1>
      <p className="text-ink-muted">Navigate from the homepage to one of the three chart library sections.</p>
      <Link
        className="rounded-lg border border-black/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        href="/"
      >
        Return Home
      </Link>
    </main>
  );
}
