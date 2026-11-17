import { redirect } from "next/navigation";
import { auth } from "../auth";

export async function requireUser(): Promise<{ id: number }> {
  const session = await auth();
  const id = Number(session?.user?.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    redirect("/login");
  }

  return { id };
}
