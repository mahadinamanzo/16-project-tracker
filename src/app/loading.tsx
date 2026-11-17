export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading projects"
      className="mx-auto min-h-screen max-w-6xl px-6 py-12"
    >
      <div className="mb-10 space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-200"
          >
            <div className="h-2 animate-pulse bg-slate-200" />
            <div className="space-y-4 p-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-12 animate-pulse rounded bg-slate-100" />
              <div className="h-2 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
