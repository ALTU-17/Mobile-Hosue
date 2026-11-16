/**
 * Password gate for /admin.
 *
 * The shop has one shared admin password (`ADMIN_PASSWORD`), not a user table.
 * The session cookie is an expiry timestamp signed with `ADMIN_SESSION_SECRET`,
 * so editing the cookie in the browser cannot forge a session. Web Crypto is
 * used so the same code runs in Node and in the Workers runtime.
 */

import { cookies } from "next/headers";

const COOKIE_NAME = "mh_admin";
/** A working day; the editor is a tool, not a banking session. */
const SESSION_SECONDS = 60 * 60 * 12;

type SessionCookie = {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    sameSite: "lax";
    secure: boolean;
    path: string;
    maxAge: number;
  };
};

function secret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET;
  return value && value.length >= 16 ? value : null;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && Boolean(secret());
}

async function sign(payload: string): Promise<string | null> {
  const keyValue = secret();
  if (!keyValue) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyValue),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));

  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Compares equal-length hex strings without an early exit. */
function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

export async function passwordMatches(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const [given, wanted] = await Promise.all([
    sign(`password:${input}`),
    sign(`password:${expected}`),
  ]);

  if (!given || !wanted) return false;
  return equal(given, wanted);
}

export async function createSession(): Promise<SessionCookie | null> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const signature = await sign(String(expires));
  if (!signature) return null;

  return {
    name: COOKIE_NAME,
    value: `${expires}.${signature}`,
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
      maxAge: SESSION_SECONDS,
    },
  };
}

export function clearSession(): SessionCookie {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
      maxAge: 0,
    },
  };
}

export async function hasAdminSession(): Promise<boolean> {
  if (!adminConfigured()) return false;

  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const [expires, signature] = raw.split(".");
  if (!expires || !signature) return false;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) return false;

  const expected = await sign(expires);
  return expected !== null && equal(signature, expected);
}
