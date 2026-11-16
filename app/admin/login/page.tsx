import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminConfigured, hasAdminSession } from "@/lib/admin-auth";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

const errorCopy: Record<string, string> = {
  password: "That password did not match.",
  config: "ADMIN_PASSWORD and ADMIN_SESSION_SECRET are not set. Add them to .env.local and restart the dev server.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await hasAdminSession()) redirect("/admin");

  const { error } = await searchParams;
  const configured = adminConfigured();
  const message = error ? errorCopy[error] ?? errorCopy.password : "";

  return (
    <main className="admin admin-login">
      <div className="admin-login__card">
        <span className="admin__eyebrow">Mobile House · content admin</span>
        <h1 className="admin__title">Sign in</h1>
        <p className="admin-card__hint">
          Enter the admin password to edit the counter and festival content.
        </p>

        {message && (
          <p className={`admin__notice ${configured ? "admin__notice--error" : "admin__notice--warn"}`}>
            {message}
          </p>
        )}

        <form action={signIn} className="admin-login__form">
          <label className="admin-field">
            <span className="admin-field__label">Password</span>
            <input
              className="admin-input"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              autoFocus
              disabled={!configured}
            />
          </label>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={!configured}>
            Sign in
          </button>
        </form>

        <Link className="admin-login__back" href="/">
          ← Back to the shop
        </Link>
      </div>
    </main>
  );
}
