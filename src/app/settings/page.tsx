import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "../../lib/session";
import { getUserProfile } from "../../lib/queries";
import DeleteAccountForm from "./delete-account-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Project Tracker profile and account.",
};

export default async function SettingsPage() {
  const { id } = await requireUser();
  const profile = await getUserProfile(id);

  if (!profile) {
    throw new Error("Could not find the signed-in user's profile.");
  }

  const displayName = profile.name ?? "GitHub user";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <header className="mb-8">
        <Link
          className="text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/"
        >
          ← All projects
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
          Account settings
        </h1>
      </header>

      <section
        aria-labelledby="profile-heading"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-950" id="profile-heading">
          GitHub profile
        </h2>
        <div className="mt-5 flex items-center gap-4">
          {profile.image ? (
            <Image
              alt={`${displayName}'s GitHub avatar`}
              className="rounded-full"
              height={64}
              src={profile.image}
              width={64}
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-slate-700"
            >
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-950">{displayName}</p>
            {profile.email && (
              <p className="mt-1 text-sm text-slate-600">{profile.email}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              GitHub account ID: {profile.github_id}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="delete-account-heading"
        className="mt-8 rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
      >
        <h2
          className="text-lg font-semibold text-slate-950"
          id="delete-account-heading"
        >
          Delete account
        </h2>
        <p className="mt-2 mb-5 text-sm leading-6 text-slate-600">
          This permanently removes your account, projects, and tasks. This
          action cannot be undone.
        </p>
        <DeleteAccountForm />
      </section>
    </main>
  );
}
