import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "../../../lib/session";
import {
  getProject,
  getTasks,
  type TaskPriority,
} from "../../../lib/queries";
import Board from "./board";
import TaskForm from "./task-form";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getProjectForRequest = cache(getProject);

function parseProjectId(value: string): number | undefined {
  const projectId = Number(value);
  return Number.isSafeInteger(projectId) && projectId > 0
    ? projectId
    : undefined;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePriority(value: string | undefined): TaskPriority | undefined {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

export async function generateMetadata({
  params,
}: Pick<ProjectPageProps, "params">): Promise<Metadata> {
  const { id: ownerId } = await requireUser();
  const { id } = await params;
  const projectId = parseProjectId(id);

  if (projectId === undefined) {
    return { title: "Project not found | Project Tracker" };
  }

  const project = await getProjectForRequest(projectId, ownerId);

  if (!project) {
    return { title: "Project not found | Project Tracker" };
  }

  return {
    title: `${project.name} | Project Tracker`,
    description:
      project.description || `Tasks and progress for ${project.name}.`,
  };
}

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { id: ownerId } = await requireUser();
  const [{ id }, search] = await Promise.all([params, searchParams]);
  const projectId = parseProjectId(id);

  if (projectId === undefined) {
    notFound();
  }

  const project = await getProjectForRequest(projectId, ownerId);

  if (!project) {
    notFound();
  }

  const priority = parsePriority(firstValue(search.priority));
  const q = (firstValue(search.q) ?? "").trim().slice(0, 100);
  const tasks = await getTasks(projectId, ownerId, {
    priority,
    q: q || undefined,
  });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">
      <header className="mb-8">
        <Link
          className="text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/"
        >
          ← All projects
        </Link>
        <div
          aria-hidden="true"
          className="mb-5 mt-6 h-2 w-16 rounded-full"
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

      <form
        action={`/projects/${projectId}`}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4"
        method="get"
      >
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="priority-filter"
          >
            Priority
          </label>
          <select
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            defaultValue={priority ?? ""}
            id="priority-filter"
            name="priority"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="min-w-52 flex-1">
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="task-search"
          >
            Search tasks
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            defaultValue={q}
            id="task-search"
            maxLength={100}
            name="q"
            placeholder="Search by title"
            type="search"
          />
        </div>
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          type="submit"
        >
          Apply filters
        </button>
        {(priority || q) && (
          <Link
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            href={`/projects/${projectId}`}
          >
            Clear
          </Link>
        )}
      </form>

      <Board projectId={project.id} tasks={tasks} today={today} />

      <section className="mt-10 max-w-xl" aria-label="Create a task">
        <TaskForm projectId={project.id} />
      </section>
    </main>
  );
}
