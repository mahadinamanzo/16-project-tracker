"use client";

import { useActionState } from "react";
import { createProject } from "./actions";
import type { ActionState } from "../lib/validation";

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

export default function ProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-950">New project</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="project-name"
          >
            Name
          </label>
          <input
            aria-describedby={state.errors.name ? "project-name-error" : undefined}
            aria-invalid={Boolean(state.errors.name)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            id="project-name"
            maxLength={120}
            name="name"
            required
          />
          <FieldError errors={state.errors.name} id="project-name-error" />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="project-color"
          >
            Color
          </label>
          <input
            aria-describedby={
              state.errors.color ? "project-color-error" : undefined
            }
            aria-invalid={Boolean(state.errors.color)}
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 p-1"
            defaultValue="#6366f1"
            id="project-color"
            name="color"
            type="color"
          />
          <FieldError errors={state.errors.color} id="project-color-error" />
        </div>
        <div className="sm:col-span-2">
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="project-description"
          >
            Description
          </label>
          <textarea
            aria-describedby={
              state.errors.description
                ? "project-description-error"
                : undefined
            }
            aria-invalid={Boolean(state.errors.description)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            id="project-description"
            maxLength={1000}
            name="description"
            rows={3}
          />
          <FieldError
            errors={state.errors.description}
            id="project-description-error"
          />
        </div>
      </div>
      {state.errors._form?.map((message) => (
        <p className="mt-3 text-sm text-red-700" key={message}>
          {message}
        </p>
      ))}
      {state.ok && (
        <p className="mt-3 text-sm text-green-700" role="status">
          Project created.
        </p>
      )}
      <button
        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
