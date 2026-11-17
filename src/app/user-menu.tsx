import Image from "next/image";
import { auth, signIn, signOut } from "../auth";
import { requireUser } from "../lib/session";

export default async function UserMenu() {
  const session = await auth();

  if (session?.user) {
    const name = session.user.name ?? session.user.email ?? "Signed in";

    return (
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <Image
            alt={`${name}'s avatar`}
            className="rounded-full"
            height={32}
            src={session.user.image}
            width={32}
          />
        ) : (
          <span
            aria-label={`${name}'s avatar`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700"
            role="img"
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden text-sm text-slate-600 sm:inline">{name}</span>
        <form
          action={async () => {
            "use server";
            await requireUser();
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/" });
      }}
    >
      <button
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        type="submit"
      >
        Sign in with GitHub
      </button>
    </form>
  );
}
