import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-12">
      <section aria-labelledby="not-found-title" className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          404
        </p>
        <h1
          className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
          id="not-found-title"
        >
          Page not found
        </h1>
        <p className="mt-3 text-slate-700">
          This page may have moved or may not be available to your account.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          href="/"
        >
          Go to your projects
        </Link>
      </section>
    </main>
  );
}
