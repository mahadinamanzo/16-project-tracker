import { redirect } from "next/navigation";
import { auth } from "../auth";

export async function getCurrentUserId(): Promise<number | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const userId = Number(session.user.id);
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
}

export async function requireUserId(): Promise<number> {
  const userId = await getCurrentUserId();

  if (userId === null) {
    redirect("/login");
  }

  return userId;
}
