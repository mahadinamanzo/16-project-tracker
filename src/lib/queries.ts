import { sql } from "./db";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type ProjectWithCounts = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  task_count: number;
  done_count: number;
};

export type Project = Omit<ProjectWithCounts, "task_count" | "done_count">;

export type Task = {
  id: number;
  project_id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
};

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
};

export async function getProjects(): Promise<ProjectWithCounts[]> {
  const projects: ProjectWithCounts[] = await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.color,
      p.created_at,
      COUNT(t.id)::int AS task_count,
      COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count
    FROM projects AS p
    LEFT JOIN tasks AS t ON t.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  return projects;
}

export async function getProject(id: number): Promise<ProjectWithCounts | null> {
  const projects: ProjectWithCounts[] = await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.color,
      p.created_at,
      COUNT(t.id)::int AS task_count,
      COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count
    FROM projects AS p
    LEFT JOIN tasks AS t ON t.project_id = p.id
    WHERE p.id = ${id}
    GROUP BY p.id
    LIMIT 1
  `;

  return projects[0] ?? null;
}

export async function getTasks(
  projectId: number,
  filters: TaskFilters = {},
): Promise<Task[]> {
  const tasks: Task[] = await sql`
    SELECT id, project_id, title, status, priority, due_date, created_at
    FROM tasks
    WHERE project_id = ${projectId}
      AND (${filters.status === undefined}::boolean OR status = ${filters.status ?? "todo"})
      AND (${filters.priority === undefined}::boolean OR priority = ${filters.priority ?? "low"})
      AND (
        ${filters.q === undefined}::boolean
        OR title ILIKE ${`%${filters.q ?? ""}%`}
      )
    ORDER BY created_at DESC
  `;

  return tasks;
}
