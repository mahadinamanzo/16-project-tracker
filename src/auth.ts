import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { ProjectTrackerSession } from "./types/next-auth";
import { sql } from "./lib/db";

const nextAuth = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "github") {
        return false;
      }

      await sql`
        INSERT INTO users (github_id, name, email, image)
        VALUES (
          ${account.providerAccountId},
          ${user.name ?? null},
          ${user.email ?? null},
          ${user.image ?? null}
        )
        ON CONFLICT (github_id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          image = EXCLUDED.image
      `;

      return true;
    },
    async jwt({ token, account }) {
      const githubId =
        account?.provider === "github"
          ? account.providerAccountId
          : token.sub;

      if (githubId && (account || token.id === undefined)) {
        const users = (await sql`
          SELECT id
          FROM users
          WHERE github_id = ${githubId}
          LIMIT 1
        `) as { id: number }[];
        const userId = Number(users[0]?.id);

        if (!Number.isSafeInteger(userId) || userId < 1) {
          throw new Error("Could not resolve the authenticated application user.");
        }

        token.id = userId;
      }

      return token;
    },
    async session({ session, token }) {
      if (
        !session.user ||
        typeof token.id !== "number" ||
        !Number.isSafeInteger(token.id) ||
        token.id < 1
      ) {
        throw new Error("The session is missing its application user ID.");
      }

      Object.assign(session.user, { id: token.id });
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

export async function auth(): Promise<ProjectTrackerSession | null> {
  const session = await nextAuth.auth();

  if (!session) {
    return null;
  }

  if (!session.user) {
    throw new Error("The authenticated session is missing its user.");
  }

  const userId = Number(session.user.id);

  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new Error("The authenticated session has an invalid user ID.");
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: userId,
    },
  };
}
