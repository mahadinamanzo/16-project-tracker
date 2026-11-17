import Link from "next/link";
import { requireUser } from "../lib/session";
import { getProjects } from "../lib/queries";
import ProjectForm from "./project-form";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { id: ownerId } = await requireUser();
  const projects = await getProjects(ownerId);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Project Tracker
          </h1>
          <p className="mt-3 text-slate-600">
            Keep track of your projects and see what is getting done.
          </p>
        </div>
        <Link
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          href="/stats"
        >
          View statistics
        </Link>
      </header>

      <ProjectForm />

      {projects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No projects yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add a project to see it here.
          </p>
        </section>
      ) : (
        <section
          aria-label="Projects"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project) => {
            const progress =
              project.task_count === 0
                ? 0
                : Math.round(
                    (project.done_count / project.task_count) * 100,
                  );

            return (
              <article
                key={project.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div
                  aria-hidden="true"
                  className="h-2"
                  style={{ backgroundColor: project.color }}
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-950">
                    <Link
                      className="hover:underline"
                      href={`/projects/${project.id}`}
                    >
                      {project.name}
                    </Link>
                  </h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                    {project.description || "No description yet."}
                  </p>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        Progress
                      </span>
                      <span className="text-slate-500">
                        {project.done_count} / {project.task_count} done
                      </span>
                    </div>
                    <div
                      aria-label={`${progress}% complete`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={progress}
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                    >
                      <div
                        className="h-full rounded-full bg-slate-900 transition-[width]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
