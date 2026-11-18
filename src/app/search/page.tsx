import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "../../lib/session";
import { searchProjectsAndTasks } from "../../lib/queries";
import { GlobalSearchInput } from "../../lib/validation";
import HighlightedText from "./highlighted-text";
import SearchForm from "./search-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search your projects and tasks.",
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { id: userId } = await requireUser();
  const search = await searchParams;
  const rawQuery = Array.isArray(search.q) ? search.q[0] : search.q;
  const parsed = GlobalSearchInput.safeParse({ query: rawQuery ?? "" });
  const query = parsed.success ? parsed.data.query : "";
  const results =
    query.length > 0
      ? await searchProjectsAndTasks(userId, query)
      : [];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <Link
          className="text-sm font-medium text-slate-700 hover:text-slate-950 focus-visible:outline-indigo-600"
          href="/"
        >
          ← All projects
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Search
        </h1>
        <p className="mt-2 text-slate-700">
          Find projects and tasks in your workspace.
        </p>
      </header>

      <SearchForm initialQuery={query} />

      {!parsed.success && rawQuery && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          Search terms must be 100 characters or fewer.
        </p>
      )}

      {query && (
        <section aria-live="polite" className="mt-8">
          <h2 className="mb-4 text-sm font-medium text-slate-700">
            {results.length} {results.length === 1 ? "result" : "results"} for{" "}
            <span className="font-semibold text-slate-950">“{query}”</span>
          </h2>
          <p className="mb-3 text-xs text-slate-600">
            Showing up to 50 matches.
          </p>
          {results.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-700">
              No matching projects or tasks found.
            </p>
          ) : (
            <ul className="space-y-3">
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <Link
                    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 focus-visible:outline-indigo-600"
                    href={`/projects/${result.project_id}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: result.project_color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="break-words font-semibold text-slate-950">
                            <HighlightedText text={result.title} query={query} />
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                            {result.type}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">
                          Project:{" "}
                          <HighlightedText
                            text={result.project_name}
                            query={query}
                          />
                        </p>
                        {result.description && (
                          <p className="mt-2 break-words text-sm leading-6 text-slate-700">
                            <HighlightedText
                              text={result.description}
                              query={query}
                            />
                          </p>
                        )}
                        {result.type === "task" && (
                          <p className="mt-2 text-xs text-slate-600">
                            {result.status} · {result.priority}
                            {result.due_date
                              ? ` · Due ${result.due_date}`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
