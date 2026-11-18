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

export type StatsSummary = {
  project_count: number;
  task_count: number;
  done_count: number;
  overdue_count: number;
  todo_count: number;
  doing_count: number;
  low_priority_count: number;
  medium_priority_count: number;
  high_priority_count: number;
};

export type ProjectStats = {
  id: number;
  name: string;
  task_count: number;
  done_count: number;
  completion_percent: number;
};

export type OverdueTask = {
  id: number;
  title: string;
  project_id: number;
  project_name: string;
  due_date: string;
  priority: TaskPriority;
};

type ProjectStatsQueryRow = ProjectStats & {
  overdue_tasks: OverdueTask[] | null;
};

export type ProjectTrackerStats = {
  summary: StatsSummary;
  projects: ProjectStats[];
  overdueTasks: OverdueTask[];
};

export type UserProfile = {
  id: number;
  github_id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export type GlobalSearchResult = {
  type: "project" | "task";
  id: number;
  title: string;
  description: string | null;
  project_id: number;
  project_name: string;
  project_color: string;
  status: TaskStatus | null;
  priority: TaskPriority | null;
  due_date: string | null;
  created_at: string;
};

export async function getUserProfile(
  userId: number,
): Promise<UserProfile | null> {
  const users = (await sql`
    SELECT id, github_id, name, email, image
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `) as UserProfile[];

  return users[0] ?? null;
}

export async function searchProjectsAndTasks(
  userId: number,
  query: string,
): Promise<GlobalSearchResult[]> {
  const pattern = `%${query}%`;
  const results = (await sql`
    SELECT
      'project'::text AS type,
      p.id,
      p.name AS title,
      p.description,
      p.id AS project_id,
      p.name AS project_name,
      p.color AS project_color,
      NULL::text AS status,
      NULL::text AS priority,
      NULL::date AS due_date,
      p.created_at
    FROM projects AS p
    WHERE p.owner_id = ${userId}
      AND (
        p.name ILIKE ${pattern}
      OR p.description ILIKE ${pattern}
      )

    UNION ALL

    SELECT
      'task'::text AS type,
      t.id,
      t.title,
      NULL::text AS description,
      p.id AS project_id,
      p.name AS project_name,
      p.color AS project_color,
      t.status,
      t.priority,
      t.due_date,
      t.created_at
    FROM tasks AS t
    INNER JOIN projects AS p
      ON p.id = t.project_id
      AND p.owner_id = ${userId}
    WHERE t.title ILIKE ${pattern}

    ORDER BY created_at DESC
    LIMIT 50
  `) as GlobalSearchResult[];

  return results;
}

export async function getProjects(
  ownerId: number,
): Promise<ProjectWithCounts[]> {
  const projects = (await sql`
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
    WHERE p.owner_id = ${ownerId}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `) as ProjectWithCounts[];

  return projects;
}

export async function getProject(
  id: number,
  ownerId: number,
): Promise<ProjectWithCounts | null> {
  const projects = (await sql`
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
    WHERE p.id = ${id} AND p.owner_id = ${ownerId}
    GROUP BY p.id
    LIMIT 1
  `) as ProjectWithCounts[];

  return projects[0] ?? null;
}

export async function getTasks(
  projectId: number,
  ownerId: number,
  filters: TaskFilters = {},
): Promise<Task[]> {
  const tasks = (await sql`
    SELECT
      t.id,
      t.project_id,
      t.title,
      t.status,
      t.priority,
      t.due_date,
      t.created_at
    FROM tasks AS t
    INNER JOIN projects AS p ON p.id = t.project_id
    WHERE t.project_id = ${projectId}
      AND p.owner_id = ${ownerId}
      AND (${filters.status === undefined}::boolean OR t.status = ${filters.status ?? "todo"})
      AND (${filters.priority === undefined}::boolean OR t.priority = ${filters.priority ?? "low"})
      AND (
        ${filters.q === undefined}::boolean
        OR t.title ILIKE ${`%${filters.q ?? ""}%`}
      )
    ORDER BY t.created_at DESC
  `) as Task[];

  return tasks;
}

export async function getProjectTrackerStats(
  ownerId: number,
): Promise<ProjectTrackerStats> {
  const [summaryResult, projectResult] = await Promise.all([
    sql`
      SELECT
        COUNT(DISTINCT p.id)::int AS project_count,
        COUNT(t.id)::int AS task_count,
        COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count,
        COUNT(t.id) FILTER (
          WHERE t.due_date < CURRENT_DATE AND t.status <> 'done'
        )::int AS overdue_count,
        COUNT(t.id) FILTER (WHERE t.status = 'todo')::int AS todo_count,
        COUNT(t.id) FILTER (WHERE t.status = 'doing')::int AS doing_count,
        COUNT(t.id) FILTER (WHERE t.priority = 'low')::int AS low_priority_count,
        COUNT(t.id) FILTER (
          WHERE t.priority = 'medium'
        )::int AS medium_priority_count,
        COUNT(t.id) FILTER (
          WHERE t.priority = 'high'
        )::int AS high_priority_count
      FROM projects AS p
      LEFT JOIN tasks AS t ON t.project_id = p.id
      WHERE p.owner_id = ${ownerId}
    `,
    sql`
      SELECT
        p.id,
        p.name,
        COUNT(t.id)::int AS task_count,
        COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count,
        CASE
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND(
            100.0 * COUNT(t.id) FILTER (WHERE t.status = 'done') / COUNT(t.id)
          )::int
        END AS completion_percent,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', t.id,
              'title', t.title,
              'project_id', p.id,
              'project_name', p.name,
              'due_date', t.due_date,
              'priority', t.priority
            )
            ORDER BY t.due_date ASC
          ) FILTER (
            WHERE t.id IS NOT NULL
              AND t.due_date < CURRENT_DATE
              AND t.status <> 'done'
          ),
          '[]'::json
        ) AS overdue_tasks
      FROM projects AS p
      LEFT JOIN tasks AS t ON t.project_id = p.id
      WHERE p.owner_id = ${ownerId}
      GROUP BY p.id
      ORDER BY p.name
    `,
  ]);

  const summaryRows = summaryResult as StatsSummary[];
  const projectRows = projectResult as ProjectStatsQueryRow[];
  const summary = summaryRows[0];

  if (!summary) {
    throw new Error("The project tracker stats query returned no summary.");
  }

  return {
    summary,
    projects: projectRows.map(
      ({ id, name, task_count, done_count, completion_percent }) => ({
        id,
        name,
        task_count,
        done_count,
        completion_percent,
      }),
    ),
    overdueTasks: projectRows.flatMap(
      (project) => project.overdue_tasks ?? [],
    ),
  };
}
