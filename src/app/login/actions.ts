"use server";

import { signIn } from "../../auth";
import { safeCallbackUrl } from "../../lib/callback-url";

export async function signInWithGithub(formData: FormData): Promise<void> {
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"));
  await signIn("github", { redirectTo: callbackUrl });
}
