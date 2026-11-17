"use client";

import { useOptimistic, useState, useTransition } from "react";
import { deleteTask, updateTaskStatus } from "../../actions";
import type { ActionState } from "../../../lib/validation";
import type { Task, TaskStatus } from "../../../lib/queries";

const initialActionState: ActionState = { ok: false, errors: {} };

const columns: { status: TaskStatus; title: string }[] = [
  { status: "todo", title: "To do" },
  { status: "doing", title: "Doing" },
  { status: "done", title: "Done" },
];

const priorityClasses = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
} satisfies Record<Task["priority"], string>;

type BoardUpdate =
  | { kind: "move"; taskId: number; status: TaskStatus }
  | { kind: "delete"; taskId: number };

function firstError(state: ActionState): string {
  return (
    Object.values(state.errors).flat()[0] ?? "The change could not be saved."
  );
}

export default function Board({
  projectId,
  tasks,
  today,
}: {
  projectId: number;
  tasks: Task[];
  today: string;
}) {
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    tasks,
    (currentTasks, update: BoardUpdate) => {
      if (update.kind === "delete") {
        return currentTasks.filter((task) => task.id !== update.taskId);
      }

      return currentTasks.map((task) =>
        task.id === update.taskId ? { ...task, status: update.status } : task,
      );
    },
  );
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  function moveTask(taskId: number, status: TaskStatus) {
    const formData = new FormData();
    formData.set("project_id", String(projectId));
    formData.set("task_id", String(taskId));
    formData.set("status", status);

    startTransition(async () => {
      setActionError(null);
      updateOptimisticTasks({ kind: "move", taskId, status });
      const result = await updateTaskStatus(initialActionState, formData);

      if (!result.ok) {
        setActionError(firstError(result));
      }
    });
  }

  function removeTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }

    const formData = new FormData();
    formData.set("project_id", String(projectId));
    formData.set("task_id", String(task.id));

    startTransition(async () => {
      setActionError(null);
      updateOptimisticTasks({ kind: "delete", taskId: task.id });
      const result = await deleteTask(initialActionState, formData);

      if (!result.ok) {
        setActionError(firstError(result));
      }
    });
  }

  return (
    <section aria-label="Task board">
      {actionError && (
        <p
          className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {actionError}
        </p>
      )}
      <div className="grid items-start gap-4 md:grid-cols-3">
        {columns.map((column, columnIndex) => {
          const columnTasks = optimisticTasks.filter(
            (task) => task.status === column.status,
          );
          const previousStatus = columns[columnIndex - 1]?.status;
          const nextStatus = columns[columnIndex + 1]?.status;

          return (
            <section
              aria-labelledby={`column-${column.status}`}
              className="min-w-0 rounded-2xl bg-slate-100 p-4"
              key={column.status}
            >
              <header className="mb-4 flex items-center justify-between">
                <h2
                  className="font-semibold text-slate-900"
                  id={`column-${column.status}`}
                >
                  {column.title}
                </h2>
                <span
                  aria-label={`${columnTasks.length} tasks`}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600"
                >
                  {columnTasks.length}
                </span>
              </header>

              {columnTasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-5 text-center text-sm text-slate-500">
                  No tasks in this column.
                </p>
              ) : (
                <ul className="space-y-3">
                  {columnTasks.map((task) => (
                    <li
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      key={task.id}
                    >
                      <h3 className="break-words font-medium text-slate-950">
                        {task.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${priorityClasses[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <time
                            className={`text-xs ${
                              task.due_date < today
                                ? "font-semibold text-red-700"
                                : "text-slate-500"
                            }`}
                            dateTime={task.due_date}
                          >
                            Due {task.due_date}
                            {task.due_date < today ? " · Overdue" : ""}
                          </time>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex gap-2">
                          <button
                            aria-label={`Move ${task.title} left`}
                            className="rounded-md border border-slate-200 px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={isPending || !previousStatus}
                            onClick={() => {
                              if (previousStatus) {
                                moveTask(task.id, previousStatus);
                              }
                            }}
                            type="button"
                          >
                            ←
                          </button>
                          <button
                            aria-label={`Move ${task.title} right`}
                            className="rounded-md border border-slate-200 px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={isPending || !nextStatus}
                            onClick={() => {
                              if (nextStatus) {
                                moveTask(task.id, nextStatus);
                              }
                            }}
                            type="button"
                          >
                            →
                          </button>
                        </div>
                        <button
                          aria-label={`Delete ${task.title}`}
                          className="rounded-md px-2 py-1 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={isPending}
                          onClick={() => removeTask(task)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
