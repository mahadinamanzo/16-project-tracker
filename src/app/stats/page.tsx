import type { Metadata } from "next";
import Link from "next/link";
import { getProjectTrackerStats } from "../../lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats | Project Tracker",
  description: "Project completion and task statistics.",
};

type BarItem = {
  label: string;
  count: number;
  color: string;
};

function BarChart({ items }: { items: BarItem[] }) {
  const maximum = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="tabular-nums text-slate-500">{item.count}</span>
          </div>
          <div
            aria-label={`${item.label}: ${item.count}`}
            className="h-3 overflow-hidden rounded-full bg-slate-100"
            role="img"
          >
            <div
              className={`h-full rounded-full ${item.color}`}
              style={{ width: `${(item.count / maximum) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function StatsPage() {
  const { summary, projects, overdueTasks } = await getProjectTrackerStats();
  const statuses: BarItem[] = [
    { label: "To do", count: summary.todo_count, color: "bg-slate-500" },
    { label: "Doing", count: summary.doing_count, color: "bg-amber-500" },
    { label: "Done", count: summary.done_count, color: "bg-emerald-500" },
  ];
  const priorities: BarItem[] = [
    {
      label: "Low",
      count: summary.low_priority_count,
      color: "bg-sky-500",
    },
    {
      label: "Medium",
      count: summary.medium_priority_count,
      color: "bg-amber-500",
    },
    {
      label: "High",
      count: summary.high_priority_count,
      color: "bg-rose-500",
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-10">
        <Link
          className="text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/"
        >
          ← All projects
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Overview
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Project statistics
        </h1>
      </header>

      <section
        aria-label="Overall totals"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: "Projects", value: summary.project_count },
          { label: "Tasks", value: summary.task_count },
          { label: "Completed", value: summary.done_count },
          { label: "Overdue", value: summary.overdue_count },
        ].map((item) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            key={item.label}
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-slate-950">
              {item.value}
            </p>
          </article>
        ))}
      </section>

      <section
        aria-label="Task breakdown"
        className="mt-8 grid gap-5 lg:grid-cols-2"
      >
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-950">
            Tasks by status
          </h2>
          <BarChart items={statuses} />
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-950">
            Tasks by priority
          </h2>
          <BarChart items={priorities} />
        </article>
      </section>

      <section
        aria-labelledby="project-progress-heading"
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2
          className="mb-5 text-lg font-semibold text-slate-950"
          id="project-progress-heading"
        >
          Completion by project
        </h2>
        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects yet.</p>
        ) : (
          <ul className="space-y-5">
            {projects.map((project) => (
              <li key={project.id}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <Link
                    className="font-medium text-slate-800 hover:underline"
                    href={`/projects/${project.id}`}
                  >
                    {project.name}
                  </Link>
                  <span className="text-slate-500">
                    {project.done_count}/{project.task_count} tasks ·{" "}
                    {project.completion_percent}%
                  </span>
                </div>
                <div
                  aria-label={`${project.name}: ${project.completion_percent}% complete`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={project.completion_percent}
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                >
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${project.completion_percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="overdue-tasks-heading"
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2
          className="mb-5 text-lg font-semibold text-slate-950"
          id="overdue-tasks-heading"
        >
          Overdue tasks
        </h2>
        {overdueTasks.length === 0 ? (
          <p className="text-sm text-slate-500">No overdue tasks.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {overdueTasks.map((task) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                key={task.id}
              >
                <div>
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <Link
                    className="mt-1 text-sm text-slate-500 hover:underline"
                    href={`/projects/${task.project_id}`}
                  >
                    {task.project_name}
                  </Link>
                </div>
                <p className="text-sm font-semibold text-red-700">
                  Due {task.due_date}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
