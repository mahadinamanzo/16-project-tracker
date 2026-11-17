"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { sql } from "../lib/db";
import {
  DeleteProjectInput,
  DeleteTaskInput,
  ProjectInput,
  TaskInput,
  UpdateTaskStatusInput,
  type ActionState,
} from "../lib/validation";

function formValues(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData);
}

function invalid(error: ZodError): ActionState {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? String(issue.path[0]) : "_form";
    const messages = errors[field] ?? [];
    messages.push(issue.message);
    errors[field] = messages;
  }

  return { ok: false, errors };
}

function notFound(field: string, message: string): ActionState {
  return { ok: false, errors: { [field]: [message] } };
}

export async function createProject(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ProjectInput.safeParse(formValues(formData));

  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const { name, description, color } = parsed.data;
  await sql`
    INSERT INTO projects (name, description, color)
    VALUES (${name}, ${description || null}, ${color})
  `;

  revalidatePath("/");
  return { ok: true, errors: {} };
}

export async function createTask(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = TaskInput.safeParse(formValues(formData));

  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const { project_id, title, status, priority, due_date } = parsed.data;
  const created = await sql`
    INSERT INTO tasks (project_id, title, status, priority, due_date)
    SELECT ${project_id}, ${title}, ${status}, ${priority}, ${due_date ?? null}
    WHERE EXISTS (SELECT 1 FROM projects WHERE id = ${project_id})
    RETURNING id
  `;

  if (created.length === 0) {
    return notFound("project_id", "Project not found.");
  }

  revalidatePath("/");
  revalidatePath(`/projects/${project_id}`);
  return { ok: true, errors: {} };
}

export async function updateTaskStatus(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = UpdateTaskStatusInput.safeParse(formValues(formData));

  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const { project_id, task_id, status } = parsed.data;
  const updated = await sql`
    UPDATE tasks
    SET status = ${status}
    WHERE id = ${task_id} AND project_id = ${project_id}
    RETURNING id
  `;

  if (updated.length === 0) {
    return notFound("task_id", "Task not found in this project.");
  }

  revalidatePath("/");
  revalidatePath(`/projects/${project_id}`);
  return { ok: true, errors: {} };
}

export async function deleteTask(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = DeleteTaskInput.safeParse(formValues(formData));

  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const { project_id, task_id } = parsed.data;
  const deleted = await sql`
    DELETE FROM tasks
    WHERE id = ${task_id} AND project_id = ${project_id}
    RETURNING id
  `;

  if (deleted.length === 0) {
    return notFound("task_id", "Task not found in this project.");
  }

  revalidatePath("/");
  revalidatePath(`/projects/${project_id}`);
  return { ok: true, errors: {} };
}

export async function deleteProject(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = DeleteProjectInput.safeParse(formValues(formData));

  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const { project_id } = parsed.data;
  const deleted = await sql`
    DELETE FROM projects
    WHERE id = ${project_id}
    RETURNING id
  `;

  if (deleted.length === 0) {
    return notFound("project_id", "Project not found.");
  }

  revalidatePath("/");
  revalidatePath(`/projects/${project_id}`);
  return { ok: true, errors: {} };
}
