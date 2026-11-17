"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
      <section
        aria-labelledby="error-title"
        className="max-w-md text-center"
        role="alert"
      >
        <h1
          className="text-2xl font-bold tracking-tight text-slate-950"
          id="error-title"
        >
          Could not load your projects
        </h1>
        <p className="mt-3 text-slate-600">
          Something went wrong. Please try again.
        </p>
        <button
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
