"use server";

import { signOut } from "../../auth";
import { sql } from "../../lib/db";
import { requireUser } from "../../lib/session";

export async function deleteMyAccount(): Promise<void> {
  const { id } = await requireUser();
  const deletedUsers = await sql`
    DELETE FROM users
    WHERE id = ${id}
    RETURNING id
  `;

  if (deletedUsers.length !== 1) {
    throw new Error("Could not delete the signed-in user account.");
  }

  await signOut({ redirectTo: "/login" });
}
