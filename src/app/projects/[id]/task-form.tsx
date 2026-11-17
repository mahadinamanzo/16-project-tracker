"use client";

import { useActionState } from "react";
import { createTask } from "../../actions";
import type { ActionState } from "../../../lib/validation";

const initialState: ActionState = { ok: false, errors: {} };

function FieldError({
  id,
  errors,
}: {
  id: string;
  errors?: string[];
}) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-red-700" id={id}>
      {errors[0]}
    </p>
  );
}

export default function TaskForm({ projectId }: { projectId: number }) {
  const [state, formAction, pending] = useActionState(
    createTask,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-950">New task</h2>
      <input name="project_id" type="hidden" value={projectId} />

      <div className="mt-4 space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="task-title"
          >
            Title
          </label>
          <input
            aria-describedby={state.errors.title ? "task-title-error" : undefined}
            aria-invalid={Boolean(state.errors.title)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            id="task-title"
            maxLength={200}
            name="title"
            required
          />
          <FieldError errors={state.errors.title} id="task-title-error" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="task-status"
            >
              Status
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              defaultValue="todo"
              id="task-status"
              name="status"
            >
              <option value="todo">To do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
            <FieldError errors={state.errors.status} id="task-status-error" />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="task-priority"
            >
              Priority
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              defaultValue="medium"
              id="task-priority"
              name="priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <FieldError
              errors={state.errors.priority}
              id="task-priority-error"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="task-due-date"
          >
            Due date
          </label>
          <input
            aria-describedby={
              state.errors.due_date ? "task-due-date-error" : undefined
            }
            aria-invalid={Boolean(state.errors.due_date)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            id="task-due-date"
            name="due_date"
            type="date"
          />
          <FieldError errors={state.errors.due_date} id="task-due-date-error" />
        </div>
      </div>

      {state.errors.project_id?.map((message) => (
        <p className="mt-3 text-sm text-red-700" key={message} role="alert">
          {message}
        </p>
      ))}
      {state.errors._form?.map((message) => (
        <p className="mt-3 text-sm text-red-700" key={message} role="alert">
          {message}
        </p>
      ))}
      {state.ok && (
        <p className="mt-3 text-sm text-green-700" role="status">
          Task created.
        </p>
      )}
      <button
        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating..." : "Create task"}
      </button>
    </form>
  );
}
