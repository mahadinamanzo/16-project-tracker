import { safeCallbackUrl } from "../../lib/callback-url";
import { signInWithGithub } from "./actions";

export const metadata = {
  title: "Sign in | Project Tracker",
  description: "Sign in with GitHub to access your projects.",
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const search = await searchParams;
  const callbackUrl = Array.isArray(search.callbackUrl)
    ? search.callbackUrl[0]
    : search.callbackUrl;

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white"
        >
          P
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Project Tracker
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Your projects, all in one place
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in with GitHub to view and manage your private projects.
        </p>
        <form action={signInWithGithub}>
          <input
            name="callbackUrl"
            type="hidden"
            value={safeCallbackUrl(callbackUrl)}
          />
          <button
            className="mt-8 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            type="submit"
          >
            Sign in with GitHub
          </button>
        </form>
      </section>
    </main>
  );
}
