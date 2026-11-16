"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminConfigured,
  clearSession,
  createSession,
  passwordMatches,
} from "@/lib/admin-auth";

export async function signIn(formData: FormData) {
  if (!adminConfigured()) redirect("/admin/login?error=config");

  const password = String(formData.get("password") ?? "");
  if (!(await passwordMatches(password))) {
    // A small pause makes guessing slower without needing server-side counters.
    await new Promise((resolve) => setTimeout(resolve, 400));
    redirect("/admin/login?error=password");
  }

  const session = await createSession();
  if (!session) redirect("/admin/login?error=config");

  (await cookies()).set(session.name, session.value, session.options);
  redirect("/admin");
}

export async function signOut() {
  const cleared = clearSession();
  (await cookies()).set(cleared.name, cleared.value, cleared.options);
  redirect("/admin/login");
}
