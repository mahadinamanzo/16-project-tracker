"use server";

import { redirect } from "next/navigation";
import { requireUser } from "../../lib/session";
import { GlobalSearchInput, type ActionState } from "../../lib/validation";

export async function searchProjectsAndTasksAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = GlobalSearchInput.safeParse({
    query: formData.get("query"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: {
        query: parsed.error.issues.map((issue) => issue.message),
      },
    };
  }

  redirect(`/search?q=${encodeURIComponent(parsed.data.query)}`);
}
