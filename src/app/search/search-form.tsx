"use client";

import { useActionState } from "react";
import { searchProjectsAndTasksAction } from "./actions";
import type { ActionState } from "../../lib/validation";

const initialState: ActionState = { ok: false, errors: {} };

export default function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const [state, formAction, pending] = useActionState(
    searchProjectsAndTasksAction,
    initialState,
  );
  const queryError = state.errors.query?.[0];

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label
        className="block text-sm font-medium text-slate-800"
        htmlFor="global-search-query"
      >
        Search projects and tasks
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          aria-describedby={queryError ? "global-search-error" : undefined}
          aria-invalid={Boolean(queryError)}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:outline-indigo-600"
          defaultValue={initialQuery}
          id="global-search-query"
          maxLength={100}
          name="query"
          placeholder="Try a project name or task title"
          required
          type="search"
        />
        <button
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-indigo-600"
          disabled={pending}
          type="submit"
        >
          {pending ? "Searching..." : "Search"}
        </button>
      </div>
      {queryError && (
        <p className="mt-2 text-sm text-red-700" id="global-search-error" role="alert">
          {queryError}
        </p>
      )}
    </form>
  );
}
