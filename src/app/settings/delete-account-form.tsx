"use client";

import { deleteMyAccount } from "./actions";

export default function DeleteAccountForm() {
  return (
    <form
      action={deleteMyAccount}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Permanently delete your account and all of your projects and tasks? This cannot be undone.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <button
        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
        type="submit"
      >
        Delete my account
      </button>
    </form>
  );
}
