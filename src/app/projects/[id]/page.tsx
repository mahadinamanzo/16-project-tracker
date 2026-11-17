import { notFound } from "next/navigation";
import { getProject, getTasks } from "../../../lib/queries";
import TaskForm from "./task-form";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    notFound();
  }

  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  const tasks = await getTasks(projectId);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-10">
        <div
          aria-hidden="true"
          className="mb-5 h-2 w-16 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Project
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          {project.name}
        </h1>
        {project.description && (
          <p className="mt-3 max-w-2xl text-slate-600">
            {project.description}
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="tasks-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2
              className="text-xl font-semibold text-slate-950"
              id="tasks-heading"
            >
              Tasks
            </h2>
            <p className="text-sm text-slate-500">
              {project.done_count} of {project.task_count} done
            </p>
          </div>

          {tasks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
              No tasks yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
                  key={task.id}
                >
                  <div>
                    <h3 className="font-medium text-slate-900">{task.title}</h3>
                    {task.due_date && (
                      <p className="mt-1 text-sm text-slate-500">
                        Due {task.due_date}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      {task.status}
                    </span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
                      {task.priority}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside>
          <TaskForm projectId={project.id} />
        </aside>
      </div>
    </main>
  );
}
