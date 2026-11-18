import { z } from "zod";

const projectId = z.coerce.number().int().positive("Project ID is invalid.");
const taskId = z.coerce.number().int().positive("Task ID is invalid.");

export const ProjectInput = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(120),
  description: z.string().trim().max(1000).optional(),
  color: z
    .string()
    .regex(/^#[\da-fA-F]{6}$/, "Choose a valid project color."),
});

export const TaskInput = z.object({
  project_id: projectId,
  title: z.string().trim().min(1, "Task title is required.").max(200),
  status: z.enum(["todo", "doing", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z
    .union([z.literal(""), z.iso.date()])
    .optional()
    .transform((value) => value || undefined),
});

export const UpdateTaskStatusInput = z.object({
  project_id: projectId,
  task_id: taskId,
  status: z.enum(["todo", "doing", "done"]),
});

export const DeleteTaskInput = z.object({
  project_id: projectId,
  task_id: taskId,
});

export const DeleteProjectInput = z.object({
  project_id: projectId,
});

export const GlobalSearchInput = z.object({
  query: z.string().trim().min(1, "Enter a search term.").max(
    100,
    "Search terms must be 100 characters or fewer.",
  ),
});

export type ActionState = {
  ok: boolean;
  errors: Record<string, string[]>;
};

export const initialActionState: ActionState = {
  ok: false,
  errors: {},
};
